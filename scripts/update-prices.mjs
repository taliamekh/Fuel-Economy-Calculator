#!/usr/bin/env node
// Daily refresh of prices.json. Run with: node scripts/update-prices.mjs
//
// Fetches public regional gas-price averages from government data sources and
// rewrites prices.json. Safe to run repeatedly: if a source is unreachable or its
// HTML changed, the script logs a warning and keeps the existing value for that
// region instead of clobbering it.
//
// Sources:
//   - US (national regular + diesel):
//       https://www.eia.gov/petroleum/gasdiesel/   (EIA — no API key needed)
//   - Canada (national + 11 cities aggregated by province):
//       https://www2.nrcan.gc.ca/eneene/sources/pripri/prices_bycity_e.cfm
//
// Mid-grade and premium prices for the US, plus diesel for Canadian provinces, are
// derived by preserving the existing ratio against regular gas in prices.json.
// Other countries (UK, AU, etc.) are left as-is until we add more scrapers.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const PRICES_PATH = resolve(HERE, '..', 'prices.json');

const UA = 'Mozilla/5.0 (compatible; trip-fuel-cost-bot/1.0)';

const EIA_URL = 'https://www.eia.gov/petroleum/gasdiesel/';

// NRCan locationIDs — picked one or two cities per province with available data.
// Order matters: it determines column index in the rendered table.
const NRCAN_CITY_TO_PROVINCE = {
  'Canada':        'CA',     // national average
  'Calgary':       'CA_AB',
  'Charlottetown': 'CA_PE',
  'Edmonton':      'CA_AB',
  'Halifax':       'CA_NS',
  'Montreal':      'CA_QC',
  'Ottawa':        'CA_ON',
  'Quebec':        'CA_QC',
  'Regina':        'CA_SK',
  'Saint John':    'CA_NB',
  "St. John's":    'CA_NL',
  'Toronto':       'CA_ON',
  'Vancouver':     'CA_BC',
  'Whitehorse':    'CA_YT',
  'Winnipeg':      'CA_MB',
  'Yellowknife':   'CA_NT',
};
const NRCAN_LOCATION_IDS = [
  66,  // Canada (national)
  2,   // Vancouver
  10,  // Edmonton
  8,   // Calgary
  12,  // Regina
  15,  // Winnipeg
  17,  // Toronto
  18,  // Ottawa
  28,  // Montreal
  29,  // Quebec
  33,  // Saint John
  39,  // Halifax
  43,  // Charlottetown
  44,  // St. John's
  1,   // Whitehorse
  7,   // Yellowknife
];
const NRCAN_URL =
  'https://www2.nrcan.gc.ca/eneene/sources/pripri/prices_bycity_e.cfm?productID=1&priceYear=' +
  new Date().getFullYear() + '&frequency=W' +
  NRCAN_LOCATION_IDS.map(id => `&locationID=${id}`).join('');

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'text/html' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

// ---------- EIA (US) ----------
// The gasdiesel page renders two tables. In each, the first row is the U.S.
// national figure with columns: this-week, last-week, year-ago, change-from-week,
// change-from-year, etc. We pull the first numeric <td> after the "U.S." anchor.
function parseEIA(html) {
  const out = {};
  const grab = (caption) => {
    const blockRe = new RegExp(
      `<caption>${caption}[\\s\\S]*?<\\/caption>([\\s\\S]*?)<\\/table>`,
      'i'
    );
    const block = html.match(blockRe);
    if (!block) return null;
    const cellRe = /<a[^>]*>U\.S\.<\/a>[\s\S]*?<td[^>]*>\s*([\d.]+)\s*<\/td>/;
    const m = block[1].match(cellRe);
    if (!m) return null;
    const v = parseFloat(m[1]);
    return isFinite(v) && v > 0 && v < 20 ? v : null;
  };
  const regular = grab('U\\.S\\. Regular Gasoline Prices');
  const diesel  = grab('U\\.S\\. On-Highway Diesel Fuel Prices');
  if (regular != null) out.regular = regular;
  if (diesel  != null) out.diesel  = diesel;
  return out;
}

// ---------- NRCan (Canada) ----------
// City order is determined by the colspan="4">CityName</th> column headers.
// Each data row's price for column N is in <td headers="header4_N_1 ...">PRICE</td>.
// PRICE is in cents per litre, includes taxes. Latest week is the last <tr>.
function parseNRCan(html) {
  const out = {}; // { cityName: $/L }

  const cities = [];
  const cityRe = /colspan="4">\s*([^<]+?)\s*<\/th>/g;
  let m;
  while ((m = cityRe.exec(html))) cities.push(m[1].trim());
  if (cities.length === 0) return out;

  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/);
  if (!tbodyMatch) return out;
  const trs = [...tbodyMatch[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)];
  if (trs.length === 0) return out;
  const lastRow = trs[trs.length - 1][1];

  for (let i = 0; i < cities.length; i++) {
    const N = i + 1;
    const priceRe = new RegExp(
      `<td headers="header4_${N}_1[^"]*">\\s*([0-9]+\\.?[0-9]*)\\s*</td>`
    );
    const pm = lastRow.match(priceRe);
    if (!pm) continue;
    const cents = parseFloat(pm[1]);
    if (!isFinite(cents) || cents < 50 || cents > 400) continue;
    out[cities[i]] = cents / 100; // ¢/L → $/L
  }
  return out;
}

// ---------- Helpers ----------
function avg(nums) {
  const v = nums.filter(n => isFinite(n) && n > 0);
  if (!v.length) return null;
  return v.reduce((a, b) => a + b, 0) / v.length;
}

function round(n, dp = 3) {
  return Math.round(n * 10 ** dp) / 10 ** dp;
}

// Refresh one region. `fresh` may have { regular, diesel }; either is optional.
// Mid-grade and premium are derived by preserving the existing ratio against
// regular, so a single regular-price update produces sensible mid/premium values.
// If diesel isn't supplied, we preserve diesel/regular ratio against the new regular.
function applyRefresh(data, key, fresh, changes) {
  const prev = data[key];
  if (!prev) return;
  if (!isFinite(prev.regular) || prev.regular <= 0) return;

  const baseRegular = isFinite(fresh.regular) ? fresh.regular : prev.regular;
  const midRatio  = prev.mid / prev.regular;
  const premRatio = prev.premium / prev.regular;
  const dieselRatio = prev.diesel / prev.regular;

  const before = { regular: prev.regular, diesel: prev.diesel };

  data[key].regular = round(baseRegular, 3);
  data[key].mid     = round(baseRegular * midRatio, 3);
  data[key].premium = round(baseRegular * premRatio, 3);
  data[key].diesel  = round(
    isFinite(fresh.diesel) ? fresh.diesel : baseRegular * dieselRatio,
    3
  );

  if (data[key].regular !== before.regular || data[key].diesel !== before.diesel) {
    changes.push(
      `${key}: regular ${before.regular}→${data[key].regular}, ` +
      `diesel ${before.diesel}→${data[key].diesel}`
    );
  }
}

// ---------- Main ----------
async function main() {
  const raw = await readFile(PRICES_PATH, 'utf8');
  const data = JSON.parse(raw);
  const changes = [];

  // --- US ---
  try {
    const html = await fetchText(EIA_URL);
    const us = parseEIA(html);
    if (us.regular != null || us.diesel != null) {
      applyRefresh(data, 'US', us, changes);
    } else {
      console.warn('[update-prices] EIA: parsed nothing (page format may have changed). Keeping US values.');
    }
  } catch (err) {
    console.warn(`[update-prices] EIA fetch/parse failed: ${err.message}. Keeping US values.`);
  }

  // --- Canada ---
  try {
    const html = await fetchText(NRCAN_URL);
    const cityPrices = parseNRCan(html); // { city: $/L (regular, taxes incl) }
    if (Object.keys(cityPrices).length === 0) {
      console.warn('[update-prices] NRCan: no cities matched. Keeping CA values.');
    } else {
      // Group cities into provinces, average duplicates (e.g. Edmonton+Calgary → AB).
      const byKey = {}; // { 'CA_ON': [1.819, 1.823], ... }
      for (const [city, regularUSD] of Object.entries(cityPrices)) {
        const key = NRCAN_CITY_TO_PROVINCE[city];
        if (!key) continue;
        (byKey[key] ||= []).push(regularUSD);
      }
      for (const [key, prices] of Object.entries(byKey)) {
        const regular = avg(prices);
        if (regular) applyRefresh(data, key, { regular }, changes);
      }
    }
  } catch (err) {
    console.warn(`[update-prices] NRCan fetch/parse failed: ${err.message}. Keeping CA values.`);
  }

  // --- Stamp + write ---
  data._meta = data._meta || {};
  data._meta.lastUpdated = new Date().toISOString().slice(0, 10);
  await writeFile(PRICES_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');

  if (changes.length === 0) {
    console.log('[update-prices] No price changes (sources unreachable or values identical).');
  } else {
    console.log(`[update-prices] Updated ${changes.length} entries:`);
    for (const c of changes) console.log('  - ' + c);
  }
}

main().catch(err => {
  console.error('[update-prices] fatal:', err);
  process.exit(1);
});
