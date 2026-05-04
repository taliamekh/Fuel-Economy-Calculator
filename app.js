/* ============================================================
 * Gas Trip Cost Calculator
 * Vanilla JS — no build, no deps. Drop in a browser, it works.
 * ============================================================ */

/* =========================
   CONVERSION CONSTANTS
   ========================= */
const KM_PER_MILE = 1.60934;
const MILE_PER_KM = 0.621371;
const L_PER_GAL_US = 3.78541;
const L_PER_GAL_UK = 4.54609;

/* =========================
   UNIT SYSTEMS
   ========================= */
const UNIT_SYSTEMS = {
  // UK sells fuel by the litre but rates cars in MPG (Imperial gallons), so volume = litre there.
  'metric-l100km': { distance: 'km',   efficiency: 'l100km', volume: 'litre',     effLabel: 'L/100km',  distLabel: 'km',    volLabel: 'L',   effInverse: false },
  'metric-kmpl':   { distance: 'km',   efficiency: 'kmpl',   volume: 'litre',     effLabel: 'km/L',     distLabel: 'km',    volLabel: 'L',   effInverse: true  },
  'imperial-us':   { distance: 'mile', efficiency: 'mpg-us', volume: 'gallon-us', effLabel: 'MPG',      distLabel: 'miles', volLabel: 'gal', effInverse: true  },
  'imperial-uk':   { distance: 'mile', efficiency: 'mpg-uk', volume: 'litre',     effLabel: 'MPG (UK)', distLabel: 'miles', volLabel: 'L',   effInverse: true  },
};

/* =========================
   COUNTRIES & DEFAULTS
   ========================= */
const COUNTRIES = [
  { code: 'US', name: 'United States',     currency: 'USD', symbol: '$',   unit: 'imperial-us',   priceUnit: 'gallon-us' },
  { code: 'CA', name: 'Canada',            currency: 'CAD', symbol: 'CA$', unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'GB', name: 'United Kingdom',    currency: 'GBP', symbol: '£',   unit: 'imperial-uk',   priceUnit: 'litre' },
  { code: 'AU', name: 'Australia',         currency: 'AUD', symbol: 'A$',  unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'NZ', name: 'New Zealand',       currency: 'NZD', symbol: 'NZ$', unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'IE', name: 'Ireland',           currency: 'EUR', symbol: '€',   unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'DE', name: 'Germany',           currency: 'EUR', symbol: '€',   unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'FR', name: 'France',            currency: 'EUR', symbol: '€',   unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'IT', name: 'Italy',             currency: 'EUR', symbol: '€',   unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'ES', name: 'Spain',             currency: 'EUR', symbol: '€',   unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'NL', name: 'Netherlands',       currency: 'EUR', symbol: '€',   unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'BE', name: 'Belgium',           currency: 'EUR', symbol: '€',   unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'PT', name: 'Portugal',          currency: 'EUR', symbol: '€',   unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'SE', name: 'Sweden',            currency: 'SEK', symbol: 'kr',  unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'NO', name: 'Norway',            currency: 'NOK', symbol: 'kr',  unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'DK', name: 'Denmark',           currency: 'DKK', symbol: 'kr',  unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'CH', name: 'Switzerland',       currency: 'CHF', symbol: 'Fr',  unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'AT', name: 'Austria',           currency: 'EUR', symbol: '€',   unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'PL', name: 'Poland',            currency: 'PLN', symbol: 'zł',  unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'JP', name: 'Japan',             currency: 'JPY', symbol: '¥',   unit: 'metric-kmpl',   priceUnit: 'litre' },
  { code: 'KR', name: 'South Korea',       currency: 'KRW', symbol: '₩',   unit: 'metric-kmpl',   priceUnit: 'litre' },
  { code: 'IN', name: 'India',             currency: 'INR', symbol: '₹',   unit: 'metric-kmpl',   priceUnit: 'litre' },
  { code: 'BR', name: 'Brazil',            currency: 'BRL', symbol: 'R$',  unit: 'metric-kmpl',   priceUnit: 'litre' },
  { code: 'MX', name: 'Mexico',            currency: 'MXN', symbol: '$',   unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'ZA', name: 'South Africa',      currency: 'ZAR', symbol: 'R',   unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', symbol: 'د.إ', unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'SG', name: 'Singapore',         currency: 'SGD', symbol: 'S$',  unit: 'metric-l100km', priceUnit: 'litre' },
  { code: 'OTHER', name: 'Other / not listed', currency: 'USD', symbol: '$', unit: 'metric-l100km', priceUnit: 'litre' },
];

const CA_PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland & Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
];

// Gas price defaults — fallback values, used until prices.json loads (and if it fails to load).
// Stored in their native unit (US: $/gal_US, others: $/L). Currency is local.
// prices.json (refreshed daily by scripts/update-prices.mjs) overwrites these on app start.
let GAS_DEFAULTS = {
  US:    { regular: 4.45, mid: 4.85, premium: 5.20, diesel: 4.55, label: 'US national avg' },
  CA:    { regular: 1.75, mid: 1.92, premium: 2.05, diesel: 1.85, label: 'Canada avg' },
  CA_AB: { regular: 1.55, mid: 1.72, premium: 1.85, diesel: 1.65, label: 'Alberta avg' },
  CA_BC: { regular: 2.05, mid: 2.22, premium: 2.35, diesel: 2.10, label: 'BC avg' },
  CA_MB: { regular: 1.65, mid: 1.82, premium: 1.95, diesel: 1.75, label: 'Manitoba avg' },
  CA_NB: { regular: 1.70, mid: 1.87, premium: 2.00, diesel: 1.80, label: 'New Brunswick avg' },
  CA_NL: { regular: 1.85, mid: 2.02, premium: 2.15, diesel: 1.95, label: 'Newfoundland avg' },
  CA_NS: { regular: 1.78, mid: 1.95, premium: 2.08, diesel: 1.88, label: 'Nova Scotia avg' },
  CA_NT: { regular: 1.95, mid: 2.12, premium: 2.25, diesel: 2.05, label: 'NWT avg' },
  CA_NU: { regular: 2.20, mid: 2.40, premium: 2.55, diesel: 2.30, label: 'Nunavut avg' },
  CA_ON: { regular: 1.75, mid: 1.92, premium: 2.05, diesel: 1.85, label: 'Ontario avg' },
  CA_PE: { regular: 1.80, mid: 1.97, premium: 2.10, diesel: 1.90, label: 'PEI avg' },
  CA_QC: { regular: 1.80, mid: 1.97, premium: 2.10, diesel: 1.90, label: 'Quebec avg' },
  CA_SK: { regular: 1.60, mid: 1.77, premium: 1.90, diesel: 1.70, label: 'Saskatchewan avg' },
  CA_YT: { regular: 1.95, mid: 2.12, premium: 2.25, diesel: 2.05, label: 'Yukon avg' },
  GB:    { regular: 1.45, mid: 1.55, premium: 1.65, diesel: 1.55, label: 'UK avg' },
  AU:    { regular: 1.95, mid: 2.05, premium: 2.20, diesel: 1.85, label: 'Australia avg' },
  NZ:    { regular: 2.85, mid: 2.95, premium: 3.10, diesel: 1.95, label: 'NZ avg' },
  IE:    { regular: 1.78, mid: 1.85, premium: 1.95, diesel: 1.75, label: 'Ireland avg' },
  DE:    { regular: 1.75, mid: 1.78, premium: 1.85, diesel: 1.65, label: 'Germany avg' },
  FR:    { regular: 1.85, mid: 1.88, premium: 1.95, diesel: 1.75, label: 'France avg' },
  IT:    { regular: 1.90, mid: 1.95, premium: 2.05, diesel: 1.80, label: 'Italy avg' },
  ES:    { regular: 1.65, mid: 1.70, premium: 1.78, diesel: 1.60, label: 'Spain avg' },
  NL:    { regular: 2.10, mid: 2.15, premium: 2.25, diesel: 1.85, label: 'Netherlands avg' },
  BE:    { regular: 1.85, mid: 1.90, premium: 2.00, diesel: 1.80, label: 'Belgium avg' },
  PT:    { regular: 1.80, mid: 1.85, premium: 1.95, diesel: 1.70, label: 'Portugal avg' },
  SE:    { regular: 19.50, mid: 20.50, premium: 21.50, diesel: 18.50, label: 'Sweden avg' },
  NO:    { regular: 22.00, mid: 23.00, premium: 24.00, diesel: 21.00, label: 'Norway avg' },
  DK:    { regular: 14.50, mid: 15.00, premium: 15.50, diesel: 13.50, label: 'Denmark avg' },
  CH:    { regular: 1.85, mid: 1.90, premium: 2.00, diesel: 1.95, label: 'Switzerland avg' },
  AT:    { regular: 1.55, mid: 1.62, premium: 1.70, diesel: 1.50, label: 'Austria avg' },
  PL:    { regular: 6.50, mid: 6.80, premium: 7.10, diesel: 6.40, label: 'Poland avg' },
  JP:    { regular: 175,  mid: 185,  premium: 195,  diesel: 155,  label: 'Japan avg' },
  KR:    { regular: 1700, mid: 1780, premium: 1850, diesel: 1550, label: 'Korea avg' },
  IN:    { regular: 105,  mid: 108,  premium: 115,  diesel: 95,   label: 'India avg' },
  BR:    { regular: 6.20, mid: 6.50, premium: 7.00, diesel: 6.50, label: 'Brazil avg' },
  MX:    { regular: 24.50, mid: 26.00, premium: 27.50, diesel: 25.80, label: 'Mexico avg' },
  ZA:    { regular: 24.00, mid: 24.50, premium: 25.00, diesel: 22.00, label: 'South Africa avg' },
  AE:    { regular: 3.20, mid: 3.30, premium: 3.40, diesel: 3.45, label: 'UAE avg' },
  SG:    { regular: 3.05, mid: 3.20, premium: 3.50, diesel: 2.85, label: 'Singapore avg' },
  OTHER: { regular: 1.50, mid: 1.60, premium: 1.70, diesel: 1.45, label: 'Generic estimate' },
};

/* =========================
   DRIVING ADJUSTMENTS
   ========================= */
// Multiplier on fuel CONSUMPTION (L/100km). >1 = uses more fuel.
const STYLE_FUEL_MULT = { eco: 0.90, normal: 1.0, aggressive: 1.20 };

// Fractional fuel-use INCREASE per condition (additive within group).
const CONDITION_PENALTY = {
  ac: 0.03, roofRack: 0.10, towing: 0.15,
  mountainous: 0.10, cold: 0.05, poorRoads: 0.08,
};

/* =========================
   VEHICLE PRESETS
   ========================= */
// Stored as MPG (US). Convert to other units on the fly.
// tankL = typical tank size in litres for that segment — used to auto-fill
// the Trip-extras tank field when the user picks a preset.
const VEHICLE_PRESETS = [
  { name: 'Compact',      mpg: 35, tankL: 50  },
  { name: 'Sedan',        mpg: 30, tankL: 60  },
  { name: 'Crossover',    mpg: 28, tankL: 60  },
  { name: 'SUV',          mpg: 22, tankL: 75  },
  { name: 'Pickup truck', mpg: 18, tankL: 95  },
  { name: 'Sports car',   mpg: 20, tankL: 60  },
  { name: 'Hybrid',       mpg: 48, tankL: 50  },
  { name: 'Minivan',      mpg: 24, tankL: 75  },
  { name: 'Cargo van',    mpg: 18, tankL: 95  },
  { name: 'Moving truck', mpg: 10, tankL: 150 },
  { name: 'RV',           mpg: 15, tankL: 200 },
  { name: 'Motorcycle',   mpg: 55, tankL: 18  },
];

// Map a FuelEconomy.gov VClass label to a typical tank size in litres.
// FuelEconomy.gov doesn't expose tank capacity, so we estimate by segment;
// users can override the value in the Trip-extras input.
function estimateTankLitres(vClass) {
  if (!vClass) return 0;
  const v = String(vClass).toLowerCase();
  if (v.includes('motorcycle'))                      return 18;
  if (v.includes('two seater'))                      return 55;
  if (v.includes('minicompact') || v.includes('subcompact')) return 45;
  if (v.includes('compact'))                         return 50;
  if (v.includes('midsize'))                         return 60;
  if (v.includes('large car'))                       return 70;
  if (v.includes('station wagon'))                   return v.includes('small') ? 50 : 60;
  if (v.includes('minivan'))                         return 75;
  if (v.includes('small pickup'))                    return 75;
  if (v.includes('pickup'))                          return 95;
  if (v.includes('standard') && v.includes('sport')) return 80;
  if (v.includes('small') && v.includes('sport'))    return 60;
  if (v.includes('sport utility'))                   return 70;
  if (v.includes('cargo') || v.includes(' van'))     return 95;
  if (v.includes('special'))                         return 85;
  return 60; // unknown segment — sensible default
}

/* =========================
   STATE
   ========================= */
const state = {
  detected: { country: null, region: null, city: null, source: null, status: 'detecting' },
  country: 'US',
  region: null,
  unitSystem: 'imperial-us',

  distance: 0,
  isRoundTrip: false,

  vehicleMode: 'pick',
  pickedVehicle: null,
  customEff: 0,

  fuelType: 'regular',
  price: 0,
  priceTouched: false,
  chartRange: '6m',

  cityMixPct: 45,
  drivingStyle: 'normal',
  conditions: { ac: false, roofRack: false, towing: false, mountainous: false, cold: false, poorRoads: false },

  passengers: 1,
  tankSize: 0,
  tolls: 0,

  compareEnabled: false,
  cmpVehicleMode: 'pick',
  cmpPickedVehicle: null,
  cmpCustomEff: 0,

  theme: 'dark',
};

// In-memory cache of API responses.
const cache = { years: null, makes: {}, models: {}, options: {}, vehicles: {} };

// Holds combobox instances after they're created.
const combos = {
  country: null, province: null,
  year: null, make: null, model: null, trim: null,
  cmpYear: null, cmpMake: null, cmpModel: null, cmpTrim: null,
};

/* =========================
   BODY-CLASS ICON MAPPING
   ========================= */
function bodyClassIcon(vClassRaw) {
  if (!vClassRaw) return '🚗';
  const v = String(vClassRaw).toLowerCase();
  if (v.includes('two seater')) return '🏎️';
  if (v.includes('sport utility') || v.includes(' suv')) return '🚙';
  if (v.includes('pickup') || v.includes('truck')) return '🛻';
  if (v.includes('minivan') || v.includes('van')) return '🚐';
  if (v.includes('special')) return '🚐';
  if (v.includes('motorcycle')) return '🏍️';
  return '🚗'; // compact, midsize, large, etc.
}

/* =========================
   SEARCHABLE COMBOBOX
   ========================= */
function createCombo(rootEl, config = {}) {
  if (!rootEl) return null;
  const placeholder = config.placeholder || '— select —';
  const searchPlaceholder = config.searchPlaceholder || 'Search…';

  rootEl.innerHTML = `
    <button class="combo-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
      <span class="combo-value empty"></span>
      <span class="combo-caret"></span>
    </button>
    <div class="combo-panel" hidden>
      <input class="combo-search" type="text" placeholder="${searchPlaceholder}" aria-label="Search">
      <ul class="combo-list" role="listbox"></ul>
      <div class="combo-empty" hidden>No matches</div>
    </div>
  `;
  const trigger = rootEl.querySelector('.combo-trigger');
  const valueEl = rootEl.querySelector('.combo-value');
  const panel = rootEl.querySelector('.combo-panel');
  const search = rootEl.querySelector('.combo-search');
  const listEl = rootEl.querySelector('.combo-list');
  const emptyEl = rootEl.querySelector('.combo-empty');

  let options = [];
  let value = null;
  let label = '';
  let icon = '';
  let activeIndex = -1;
  let isOpen = false;
  let suppressChange = false;

  function setEmpty() {
    valueEl.textContent = placeholder;
    valueEl.classList.add('empty');
  }
  setEmpty();

  function findOption(v) { return options.find(o => o.value === v); }
  function visibleItems() {
    const q = search.value.trim().toLowerCase();
    if (!q) return options.slice();
    return options.filter(o => (o.label + ' ' + (o.search || '')).toLowerCase().includes(q));
  }

  function renderList() {
    const items = visibleItems();
    listEl.innerHTML = '';
    if (items.length === 0) { emptyEl.hidden = false; return; }
    emptyEl.hidden = true;
    items.forEach((it, i) => {
      const li = document.createElement('li');
      li.className = 'combo-item';
      li.role = 'option';
      if (it.value === value) li.classList.add('selected');
      if (i === activeIndex) li.classList.add('active');
      if (it.icon) {
        const ic = document.createElement('span');
        ic.className = 'combo-item-icon'; ic.textContent = it.icon;
        li.appendChild(ic);
      }
      const text = document.createElement('span');
      text.textContent = it.label;
      li.appendChild(text);
      li.addEventListener('mousedown', (e) => { e.preventDefault(); pick(it.value); });
      li.addEventListener('mouseenter', () => {
        activeIndex = i;
        listEl.querySelectorAll('.combo-item.active').forEach(x => x.classList.remove('active'));
        li.classList.add('active');
      });
      listEl.appendChild(li);
    });
    // Scroll active into view
    const active = listEl.querySelector('.combo-item.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  function open() {
    if (isOpen || trigger.disabled) return;
    isOpen = true;
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    search.value = '';
    activeIndex = options.findIndex(o => o.value === value);
    if (activeIndex < 0) activeIndex = 0;
    renderList();
    setTimeout(() => search.focus(), 0);
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  }
  function pick(v) {
    setValue(v, false);
    close();
    if (!suppressChange) config.onChange?.(value, label);
  }
  function setValue(v, silent = true) {
    value = v;
    const opt = findOption(v);
    if (opt) {
      label = opt.label;
      icon = opt.icon || '';
      if (icon) {
        valueEl.innerHTML = `<span class="combo-value-icon">${icon}</span><span>${escapeHtml(label)}</span>`;
      } else {
        valueEl.textContent = label;
      }
      valueEl.classList.remove('empty');
    } else {
      label = '';
      icon = '';
      setEmpty();
    }
    if (!silent && !suppressChange) config.onChange?.(value, label);
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  trigger.addEventListener('click', () => isOpen ? close() : open());
  search.addEventListener('input', () => { activeIndex = 0; renderList(); });
  search.addEventListener('keydown', (e) => {
    const items = visibleItems();
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(items.length - 1, activeIndex + 1); renderList(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(0, activeIndex - 1); renderList(); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const it = items[activeIndex];
      if (it) pick(it.value);
    }
    else if (e.key === 'Escape') { e.preventDefault(); close(); trigger.focus(); }
  });
  document.addEventListener('mousedown', (e) => {
    if (!rootEl.contains(e.target) && isOpen) close();
  });

  return {
    el: rootEl,
    setOptions(items) {
      options = (items || []).map(it => typeof it === 'string'
        ? { value: it, label: it }
        : { value: String(it.value), label: String(it.label), icon: it.icon, search: it.search });
      // Refresh display in case current value's label changed
      if (value != null) {
        const opt = findOption(value);
        if (opt) setValue(value, true);
        else { value = null; setEmpty(); }
      }
      if (isOpen) renderList();
    },
    setValue(v, fire = false) {
      if (fire) {
        suppressChange = false;
        setValue(v, false);
      } else {
        suppressChange = true;
        setValue(v, true);
        suppressChange = false;
      }
    },
    getValue() { return value; },
    getLabel() { return label; },
    setDisabled(d) { trigger.disabled = !!d; },
    setLoading(loading, txt = 'Loading…') {
      if (loading) {
        valueEl.textContent = txt;
        valueEl.classList.add('empty');
        trigger.disabled = true;
      } else {
        if (value == null) setEmpty();
        trigger.disabled = false;
      }
    },
    clear() {
      options = []; value = null; label = ''; icon = '';
      setEmpty();
      if (isOpen) renderList();
    },
    open, close,
  };
}

/* =========================
   UTILS
   ========================= */
const $ = (id) => document.getElementById(id);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function debounce(fn, ms) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function fmtNumber(n, digits = 2) {
  if (!isFinite(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
function moneyDigits(currency) {
  if (currency === 'JPY' || currency === 'KRW') return 0;
  return 2;
}
function priceDigits(currency) {
  if (currency === 'JPY' || currency === 'KRW') return 0;
  if (currency === 'INR') return 2;
  if (currency === 'USD') return 2;
  return 3;
}
function fmtMoney(n, symbol, currency, digits) {
  if (!isFinite(n)) return '—';
  const d = digits != null ? digits : moneyDigits(currency);
  const v = n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
  return `${symbol}${v} ${currency}`;
}

/* ----- conversions: distance ----- */
function toKm(value, fromUnit) {
  if (fromUnit === 'mile') return value * KM_PER_MILE;
  return value;
}
function fromKm(km, toUnit) {
  if (toUnit === 'mile') return km * MILE_PER_KM;
  return km;
}

/* ----- conversions: efficiency (canonical = L/100km) ----- */
function toL100km(value, fromUnit) {
  if (!value || value <= 0) return 0;
  if (fromUnit === 'mpg-us') return 235.215 / value;
  if (fromUnit === 'mpg-uk') return 282.481 / value;
  if (fromUnit === 'kmpl')   return 100 / value;
  return value; // l100km
}
function fromL100km(l100km, toUnit) {
  if (!l100km || l100km <= 0) return 0;
  if (toUnit === 'mpg-us') return 235.215 / l100km;
  if (toUnit === 'mpg-uk') return 282.481 / l100km;
  if (toUnit === 'kmpl')   return 100 / l100km;
  return l100km;
}

/* ----- conversions: volume (canonical = litre) ----- */
function toLitre(value, fromUnit) {
  if (fromUnit === 'gallon-us') return value * L_PER_GAL_US;
  if (fromUnit === 'gallon-uk') return value * L_PER_GAL_UK;
  return value;
}
function fromLitre(litres, toUnit) {
  if (toUnit === 'gallon-us') return litres / L_PER_GAL_US;
  if (toUnit === 'gallon-uk') return litres / L_PER_GAL_UK;
  return litres;
}

/* ----- conversions: price (canonical = $/litre) ----- */
function pricePerLToDisplay(perLitre, displayVolUnit) {
  if (displayVolUnit === 'gallon-us') return perLitre * L_PER_GAL_US;
  if (displayVolUnit === 'gallon-uk') return perLitre * L_PER_GAL_UK;
  return perLitre;
}
function priceDisplayToPerL(perDisplay, displayVolUnit) {
  if (displayVolUnit === 'gallon-us') return perDisplay / L_PER_GAL_US;
  if (displayVolUnit === 'gallon-uk') return perDisplay / L_PER_GAL_UK;
  return perDisplay;
}

/* =========================
   PERSISTENCE
   ========================= */
const LS_KEY = 'gtcc-state-v1';
const STATION_PRICES_KEY = 'gtcc-station-prices-v1';

/* Per-station price memory: when a user "Use this price" applies a price to the calculator
 * we also persist it locally indexed by OSM station ID, so the next time they open that
 * popup we can show "Last reported: $X.XX · 2h ago". Crowdsourced GasBuddy-style data
 * isn't available without a backend or paid partnership. */
function loadStationPrices() {
  try { return JSON.parse(localStorage.getItem(STATION_PRICES_KEY) || '{}'); }
  catch { return {}; }
}
function saveStationPriceReport(stationId, price, currency, volLabel, sym) {
  if (!stationId) return;
  const all = loadStationPrices();
  all[stationId] = { price, currency, volLabel, sym, timestamp: Date.now() };
  try { localStorage.setItem(STATION_PRICES_KEY, JSON.stringify(all)); } catch {}
}
function getStationPriceReport(stationId) {
  const all = loadStationPrices();
  return all[stationId] || null;
}
function relativeAge(ms) {
  const sec = Math.floor((Date.now() - ms) / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return `${Math.floor(day / 30)}mo ago`;
}
function saveState() {
  try {
    const slim = {
      country: state.country, region: state.region, unitSystem: state.unitSystem,
      vehicleMode: state.vehicleMode, customEff: state.customEff,
      fuelType: state.fuelType, priceTouched: state.priceTouched, price: state.price,
      cityMixPct: state.cityMixPct, drivingStyle: state.drivingStyle,
      conditions: state.conditions,
      passengers: state.passengers, tankSize: state.tankSize, tolls: state.tolls,
      isRoundTrip: state.isRoundTrip, theme: state.theme,
    };
    localStorage.setItem(LS_KEY, JSON.stringify(slim));
  } catch (e) { /* quota or private mode */ }
}
function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    Object.assign(state, JSON.parse(raw));
  } catch (e) { /* ignore */ }
}

/* =========================
   COUNTRY / REGION HELPERS
   ========================= */
function getCountry(code) {
  return COUNTRIES.find(c => c.code === code) || COUNTRIES.find(c => c.code === 'OTHER');
}
// Maps a US state postal code to whichever GAS_DEFAULTS key best represents it:
// either the state itself (when EIA publishes per-state data) or its PADD region.
const US_STATE_REGION_KEY = {
  // States with direct EIA data
  CA: 'US_CA', CO: 'US_CO', FL: 'US_FL', MA: 'US_MA', MN: 'US_MN',
  NY: 'US_NY', OH: 'US_OH', TX: 'US_TX', WA: 'US_WA',
  // PADD1A — New England
  ME: 'US_PADD1A', NH: 'US_PADD1A', VT: 'US_PADD1A', CT: 'US_PADD1A', RI: 'US_PADD1A',
  // PADD1B — Central Atlantic
  NJ: 'US_PADD1B', PA: 'US_PADD1B', DE: 'US_PADD1B', MD: 'US_PADD1B', DC: 'US_PADD1B',
  // PADD1C — Lower Atlantic
  VA: 'US_PADD1C', NC: 'US_PADD1C', SC: 'US_PADD1C', GA: 'US_PADD1C', WV: 'US_PADD1C',
  // PADD2 — Midwest
  MI: 'US_PADD2', IN: 'US_PADD2', IL: 'US_PADD2', WI: 'US_PADD2', IA: 'US_PADD2',
  MO: 'US_PADD2', ND: 'US_PADD2', SD: 'US_PADD2', NE: 'US_PADD2', KS: 'US_PADD2',
  KY: 'US_PADD2', TN: 'US_PADD2',
  // PADD3 — Gulf Coast
  LA: 'US_PADD3', AR: 'US_PADD3', MS: 'US_PADD3', AL: 'US_PADD3', OK: 'US_PADD3', NM: 'US_PADD3',
  // PADD4 — Rocky Mountain
  MT: 'US_PADD4', ID: 'US_PADD4', WY: 'US_PADD4', UT: 'US_PADD4',
  // PADD5 — West Coast
  OR: 'US_PADD5', NV: 'US_PADD5', AZ: 'US_PADD5', AK: 'US_PADD5', HI: 'US_PADD5',
};

function gasDefaultFor(country, region) {
  if (country === 'CA' && region) return GAS_DEFAULTS[`CA_${region}`] || GAS_DEFAULTS.CA;
  if (country === 'US' && region) {
    const key = US_STATE_REGION_KEY[region];
    if (key && GAS_DEFAULTS[key]) return GAS_DEFAULTS[key];
  }
  return GAS_DEFAULTS[country] || GAS_DEFAULTS.OTHER;
}

// Loads the daily-refreshed data/prices.json (when served over http/https) and
// overlays it on GAS_DEFAULTS. If the fetch fails (offline, file:// origin, 404)
// we silently keep the hardcoded fallback values — the app keeps working either way.
async function loadPrices() {
  try {
    const res = await fetch('data/prices.json', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    const { _meta, ...prices } = data;
    Object.assign(GAS_DEFAULTS, prices);
    if (!state.priceTouched) renderGasPrice();
  } catch { /* keep fallback */ }
}
function priceUnitFor(country) { return getCountry(country).priceUnit; }

/* =========================
   GEOLOCATION
   ========================= */
async function detectByIp() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error('ipapi failed');
    const data = await res.json();
    return {
      country: data.country_code || null,
      region: data.region_code || null,
      city: data.city || null,
      lat: typeof data.latitude === 'number' ? data.latitude : null,
      lng: typeof data.longitude === 'number' ? data.longitude : null,
      source: 'ip',
    };
  } catch (e) {
    return null;
  }
}

async function detectLocation() {
  state.detected.status = 'detecting';
  renderLocation();

  // Try IP first — faster, no permission prompt. Browser geolocation could be added later.
  const ipInfo = await detectByIp();
  if (ipInfo && ipInfo.country) {
    state.detected = { ...ipInfo, status: 'ok' };
    return ipInfo;
  }
  state.detected.status = 'failed';
  return null;
}

/* =========================
   FUELECONOMY.GOV API
   ========================= */
const FEG_BASE = 'https://www.fueleconomy.gov/ws/rest';

async function fegFetch(path) {
  const url = `${FEG_BASE}${path}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const text = await res.text();
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return JSON.parse(trimmed);
  }
  // XML fallback
  const doc = new DOMParser().parseFromString(text, 'text/xml');
  return xmlToObject(doc.documentElement);
}

function xmlToObject(node) {
  const result = {};
  for (const child of Array.from(node.children)) {
    const name = child.tagName;
    const value = child.children.length > 0
      ? xmlToObject(child)
      : (child.textContent || '').trim();
    if (result[name] !== undefined) {
      if (!Array.isArray(result[name])) result[name] = [result[name]];
      result[name].push(value);
    } else {
      result[name] = value;
    }
  }
  return result;
}

function normalizeMenu(data) {
  let items = data?.menuItem ?? data?.menuItems?.menuItem ?? [];
  if (!Array.isArray(items)) items = items ? [items] : [];
  return items.map(it => ({ text: String(it.text ?? ''), value: String(it.value ?? '') }));
}

async function fegYears() {
  if (cache.years) return cache.years;
  const data = await fegFetch('/vehicle/menu/year');
  cache.years = normalizeMenu(data).map(i => i.value).filter(Boolean);
  return cache.years;
}
async function fegMakes(year) {
  if (cache.makes[year]) return cache.makes[year];
  const data = await fegFetch(`/vehicle/menu/make?year=${encodeURIComponent(year)}`);
  cache.makes[year] = normalizeMenu(data).map(i => i.value).filter(Boolean);
  return cache.makes[year];
}
async function fegModels(year, make) {
  const key = `${year}|${make}`;
  if (cache.models[key]) return cache.models[key];
  const data = await fegFetch(`/vehicle/menu/model?year=${encodeURIComponent(year)}&make=${encodeURIComponent(make)}`);
  cache.models[key] = normalizeMenu(data).map(i => i.value).filter(Boolean);
  return cache.models[key];
}
async function fegOptions(year, make, model) {
  const key = `${year}|${make}|${model}`;
  if (cache.options[key]) return cache.options[key];
  const data = await fegFetch(`/vehicle/menu/options?year=${encodeURIComponent(year)}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
  cache.options[key] = normalizeMenu(data);
  return cache.options[key];
}
async function fegVehicle(id) {
  if (cache.vehicles[id]) return cache.vehicles[id];
  const data = await fegFetch(`/vehicle/${encodeURIComponent(id)}`);
  cache.vehicles[id] = data;
  return data;
}

/* =========================
   CALCULATION
   ========================= */
function effectiveL100km(vehicle, customEffDisplay, vehicleMode, cityMixPct) {
  // Returns base L/100km BEFORE style/condition adjustments.
  if (vehicleMode === 'custom') {
    if (!customEffDisplay || customEffDisplay <= 0) return 0;
    const us = UNIT_SYSTEMS[state.unitSystem];
    return toL100km(customEffDisplay, us.efficiency);
  }
  if (!vehicle) return 0;
  const cityMpg = parseFloat(vehicle.city08) || 0;
  const hwyMpg = parseFloat(vehicle.highway08) || 0;
  const combMpg = parseFloat(vehicle.comb08) || 0;
  if (cityMpg > 0 && hwyMpg > 0) {
    const cityFrac = clamp(cityMixPct / 100, 0, 1);
    const hwyFrac = 1 - cityFrac;
    const cityL = 235.215 / cityMpg;
    const hwyL = 235.215 / hwyMpg;
    return cityL * cityFrac + hwyL * hwyFrac;
  }
  if (combMpg > 0) return 235.215 / combMpg;
  return 0;
}

function applyAdjustments(baseL100km, style, conditions) {
  if (!baseL100km) return 0;
  const styleMult = STYLE_FUEL_MULT[style] ?? 1.0;
  let extra = 0;
  for (const [k, on] of Object.entries(conditions)) {
    if (on) extra += CONDITION_PENALTY[k] || 0;
  }
  return baseL100km * styleMult * (1 + extra);
}

function totalDistanceKm() {
  const us = UNIT_SYSTEMS[state.unitSystem];
  let total = toKm(state.distance || 0, us.distance);
  if (state.isRoundTrip) total *= 2;
  return total;
}

function calculate() {
  const us = UNIT_SYSTEMS[state.unitSystem];
  const country = getCountry(state.country);
  const distanceKm = totalDistanceKm();

  // Primary vehicle
  const baseL = effectiveL100km(state.pickedVehicle, state.customEff, state.vehicleMode, state.cityMixPct);
  const adjL = applyAdjustments(baseL, state.drivingStyle, state.conditions);

  // Price (always normalized to $/L canonical)
  const priceCanonical = priceDisplayToPerL(state.price || 0, us.volume);

  const fuelLitres = adjL > 0 ? (adjL * distanceKm) / 100 : 0;
  const totalCost = fuelLitres * priceCanonical;
  const passengers = Math.max(1, state.passengers || 1);
  const perPerson = totalCost / passengers;
  const tolls = state.tolls || 0;
  const grandTotal = totalCost + tolls;

  // Comparison vehicle
  let comparison = null;
  if (state.compareEnabled) {
    const cmpBaseL = effectiveL100km(state.cmpPickedVehicle, state.cmpCustomEff, state.cmpVehicleMode, state.cityMixPct);
    const cmpAdjL = applyAdjustments(cmpBaseL, state.drivingStyle, state.conditions);
    if (cmpAdjL > 0 && distanceKm > 0) {
      const cmpFuelL = (cmpAdjL * distanceKm) / 100;
      const cmpCost = cmpFuelL * priceCanonical;
      comparison = {
        baseL: cmpBaseL, adjL: cmpAdjL,
        fuelL: cmpFuelL, cost: cmpCost,
        savings: totalCost - cmpCost,
        label: cmpVehicleLabel(),
      };
    }
  }

  // Fill-ups
  let fillups = null;
  if (state.tankSize > 0 && fuelLitres > 0) {
    const tankLitres = toLitre(state.tankSize, us.volume);
    fillups = fuelLitres / tankLitres;
  }

  return {
    distanceKm, baseL, adjL, fuelLitres, totalCost, perPerson, grandTotal, tolls,
    fillups, passengers, country, us, priceCanonical, comparison,
  };
}

/* =========================
   RENDER
   ========================= */
function render() {
  renderLocation();
  renderUnits();
  renderCountrySelect();
  renderProvinceSelect();
  renderDistance();
  renderVehicleMode();
  renderPresets();
  renderGasPrice();
  renderConditions();
  renderExtras();
  renderCompare();
  renderResults();
  saveState();
}

function renderLocation() {
  const el = $('locationText');
  const d = state.detected;
  if (d.status === 'detecting') el.textContent = 'Detecting…';
  else if (d.status === 'ok') {
    const country = getCountry(d.country);
    const bits = [];
    if (d.city) bits.push(d.city);
    if (d.region && d.country !== 'US') bits.push(d.region);
    bits.push(country.name);
    el.textContent = bits.join(', ');
  } else {
    el.textContent = 'Set manually';
  }
}

function renderCountrySelect() {
  if (combos.country) combos.country.setValue(state.country);
  $('provinceWrap').hidden = state.country !== 'CA';
}

function renderProvinceSelect() {
  if (combos.province) combos.province.setValue(state.region || '');
}

function renderUnits() {
  for (const btn of $$('.unit-card .seg-btn')) {
    btn.classList.toggle('active', btn.dataset.unit === state.unitSystem);
  }
  const us = UNIT_SYSTEMS[state.unitSystem];
  $('distanceLabel').textContent = `Distance (${us.distLabel})`;
  $('customEffLabel').textContent = `Fuel efficiency (${us.effLabel})`;
  $('cmpCustomEffLabel').textContent = `Fuel efficiency (${us.effLabel})`;
  $('priceLabel').textContent = `Price (${getCountry(state.country).symbol}/${us.volLabel})`;
  $('tankLabel').innerHTML = `Tank size (${us.volLabel}) <small>optional</small>`;
  $('perDistanceUnit').textContent = us.distLabel;

  const sym = getCountry(state.country).symbol;
  $('currencyPrefix').textContent = sym;
  $('tollPrefix').textContent = sym;
}

function renderDistance() {
  const inp = $('distanceInput');
  if (document.activeElement !== inp) {
    inp.value = state.distance ? String(state.distance) : '';
  }
  $('roundTripChk').checked = state.isRoundTrip;
  updateDistanceHint();
}

function updateDistanceHint() {
  const us = UNIT_SYSTEMS[state.unitSystem];
  const totalDisp = fromKm(totalDistanceKm(), us.distance);
  const oneWayKm = totalDistanceKm() / (state.isRoundTrip ? 2 : 1);
  const oneWayDisp = fromKm(oneWayKm, us.distance);
  const hint = $('distanceHint');
  if (!hint) return;
  if (state.distance > 0) {
    hint.textContent = state.isRoundTrip
      ? `Round trip: ${fmtNumber(totalDisp, 1)} ${us.distLabel} (one way ${fmtNumber(oneWayDisp, 1)} ${us.distLabel})`
      : `One way: ${fmtNumber(totalDisp, 1)} ${us.distLabel}`;
  } else {
    hint.textContent = 'Tip: use Google Maps for an exact distance.';
  }
}

function renderStops() {
  const list = $('stopsList');
  if (!list) return;
  list.innerHTML = '';
  map.stops.forEach((stop, idx) => {
    const div = document.createElement('div');
    div.className = 'waypoint';
    div.innerHTML = `
      <span class="wp-marker wp-marker-stop" title="Stop ${idx + 1}">${idx + 1}</span>
      <div class="field autocomplete-wrap wp-input-wrap">
        <input type="text" class="input stop-input" placeholder="Stop ${idx + 1}" autocomplete="off" spellcheck="false">
        <div class="autocomplete-dropdown" hidden></div>
      </div>
      <button type="button" class="wp-remove" title="Remove stop">×</button>
    `;
    list.appendChild(div);

    const inp = div.querySelector('.stop-input');
    const dropdown = div.querySelector('.autocomplete-dropdown');
    const removeBtn = div.querySelector('.wp-remove');

    inp.value = stop.label || '';

    attachAddressAutocomplete(inp, dropdown, (coords) => {
      if (coords) {
        map.stops[idx] = coords;
      } else if (map.stops[idx]) {
        // User cleared — null out coords; re-geocode at calc time
        map.stops[idx] = { lat: null, lon: null, label: inp.value };
      }
    });

    removeBtn.addEventListener('click', () => {
      map.stops.splice(idx, 1);
      renderStops();
      if (map.routes.length > 0 && map.origin && map.dest) handleDistanceLookup();
    });
  });
}

function renderVehicleMode() {
  for (const btn of $$('.card .seg-btn[data-mode]')) {
    btn.classList.toggle('active', btn.dataset.mode === state.vehicleMode);
  }
  $('pickPanel').classList.toggle('hidden', state.vehicleMode !== 'pick');
  $('customPanel').classList.toggle('hidden', state.vehicleMode !== 'custom');
  // Custom efficiency input
  const inp = $('customEffInput');
  if (document.activeElement !== inp) {
    inp.value = state.customEff ? String(state.customEff) : '';
  }
}

function renderPresets() {
  const us = UNIT_SYSTEMS[state.unitSystem];
  const grid = $('presetsList');
  grid.innerHTML = '';
  for (const p of VEHICLE_PRESETS) {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'preset-btn';
    const baseL = 235.215 / p.mpg;
    const display = fromL100km(baseL, us.efficiency);
    btn.innerHTML = `${p.name}<span class="preset-val">${fmtNumber(display, 1)} ${us.effLabel}</span>`;
    btn.addEventListener('click', () => {
      state.vehicleMode = 'custom';
      state.customEff = parseFloat(fmtNumber(display, 1));
      // Auto-fill tank from preset's typical size.
      if (p.tankL) {
        state.tankSize = parseFloat(fromLitre(p.tankL, us.volume).toFixed(1));
      }
      render(); update();
    });
    grid.appendChild(btn);
  }
}

function renderGasPrice() {
  const inp = $('priceInput');
  if (!state.priceTouched) {
    // Pre-fill with default for current country/region
    const def = gasDefaultFor(state.country, state.region);
    const native = priceUnitFor(state.country); // 'gallon-us' or 'litre'
    const us = UNIT_SYSTEMS[state.unitSystem];
    // Default value is in country's native unit. Convert via canonical $/L if user is on a different unit system.
    const defaultRaw = def[state.fuelType] ?? def.regular ?? 0;
    const perL = priceDisplayToPerL(defaultRaw, native);
    state.price = pricePerLToDisplay(perL, us.volume);
  }
  if (document.activeElement !== inp) {
    inp.value = state.price ? state.price.toFixed(priceDigits(getCountry(state.country).currency)) : '';
  }
  // Fuel type buttons
  for (const btn of $$('.fuel-types .seg-btn')) {
    btn.classList.toggle('active', btn.dataset.fuel === state.fuelType);
  }
  // Hint
  const def = gasDefaultFor(state.country, state.region);
  const us = UNIT_SYSTEMS[state.unitSystem];
  $('priceHint').textContent = `${def.label} (${state.fuelType}, ${getCountry(state.country).symbol}/${us.volLabel})`;
  // Auto-fill notice: shown only when the price hasn't been manually edited.
  // Tells the user *where* the prefilled number came from and that they can override.
  const note = $('priceAutoNote');
  if (note) {
    note.hidden = !!state.priceTouched;
    const regionEl = $('priceAutoRegion');
    if (regionEl) regionEl.textContent = def.label;
  }
  // Smart "Find live prices nearby" link — uses detected city + region when available
  // so GasBuddy lands on a search relevant to the user instead of the generic home page.
  const finder = $('gasFinderBtn');
  if (finder) {
    const det = state.detected || {};
    const parts = [det.city, det.region, getCountry(state.country)?.name].filter(Boolean);
    finder.href = parts.length
      ? `https://www.gasbuddy.com/home?search=${encodeURIComponent(parts.join(', '))}`
      : 'https://www.gasbuddy.com/home';
  }
  renderPriceChart();
}

/* =========================
   PRICE HISTORY CHART
   ========================= */
// Range filter buttons shown above the chart. Days = how far back to keep points;
// null means everything we have. Default '6m' is the most informative view given
// HISTORY_CAP = 26 weekly entries (~6 months).
const CHART_RANGES = {
  '1w':  { days: 7,    label: '1W' },
  '1m':  { days: 31,   label: '1M' },
  '6m':  { days: 186,  label: '6M' },
  '1y':  { days: 365,  label: '1Y' },
  'all': { days: null, label: 'All' },
};
const MONTH_NAMES_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Renders an inline SVG line chart of regional gas-price history for the active
// region, plus a dashed linear-regression projection 4 weeks forward. Range tabs
// (1W / 1M / 6M / 1Y / All) filter how far back we plot. X-axis switches to month
// labels when the visible span covers 2+ months. Drawn from scratch (no chart lib).
function renderPriceChart() {
  const host = $('priceChart');
  if (!host) return;
  const def = gasDefaultFor(state.country, state.region);
  const history = (def && def.history) || [];
  const usSys = UNIT_SYSTEMS[state.unitSystem];
  const country = getCountry(state.country);
  const rangeKey = CHART_RANGES[state.chartRange] ? state.chartRange : '6m';
  const range = CHART_RANGES[rangeKey];

  if (history.length < 2) {
    host.hidden = true;
    return;
  }
  host.hidden = false;

  // Convert prices into the user's display unit so the chart axis matches the input box.
  const native = priceUnitFor(state.country);
  const allPoints = history.map(h => ({
    date: h.date,
    ts: new Date(h.date).getTime(),
    value: pricePerLToDisplay(priceDisplayToPerL(h.regular, native), usSys.volume),
  })).sort((a, b) => a.ts - b.ts);

  // Filter by selected range, anchored on the latest data point.
  const lastTs = allPoints[allPoints.length - 1].ts;
  const cutoff = range.days ? lastTs - range.days * 86400000 : 0;
  const points = allPoints.filter(p => p.ts >= cutoff);
  const n = points.length;

  const tabsHtml = renderChartRangeTabs(rangeKey);

  if (n < 3) {
    host.innerHTML = `
      <div class="chart-header">
        <span class="chart-title">${escapeHtml(def.label)}</span>
      </div>
      ${tabsHtml}
      <p class="chart-empty">Not enough data points in this window yet — try a longer range.</p>
    `;
    bindChartRangeHandlers(host);
    return;
  }

  // Linear regression on (index, value) so we project 4 steps forward.
  const xs = points.map((_, i) => i);
  const ys = points.map(p => p.value);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (ys[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;
  const projSteps = 4;
  const projected = [];
  for (let i = 1; i <= projSteps; i++) {
    projected.push({ x: n - 1 + i, value: slope * (n - 1 + i) + intercept });
  }

  // Plot bounds — share Y between actual and projection so they're on the same scale.
  const allY = [...ys, ...projected.map(p => p.value)];
  const yMin = Math.min(...allY);
  const yMax = Math.max(...allY);
  const yPad = Math.max(0.05, (yMax - yMin) * 0.15);
  const yLo = yMin - yPad, yHi = yMax + yPad;
  const totalSteps = n - 1 + projSteps;

  const W = 360, H = 130, PADL = 38, PADR = 10, PADT = 10, PADB = 24;
  const innerW = W - PADL - PADR, innerH = H - PADT - PADB;
  const xToPx = i => PADL + (i / totalSteps) * innerW;
  const yToPx = v => PADT + (1 - (v - yLo) / (yHi - yLo)) * innerH;

  const linePath = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${xToPx(i).toFixed(1)},${yToPx(p.value).toFixed(1)}`
  ).join(' ');
  const lastActual = { x: xToPx(n - 1), y: yToPx(points[n - 1].value) };
  const projPath = `M${lastActual.x.toFixed(1)},${lastActual.y.toFixed(1)} ` +
    projected.map(p => `L${xToPx(p.x).toFixed(1)},${yToPx(p.value).toFixed(1)}`).join(' ');
  // Hide individual dots when the line is dense — they just become noise.
  const showDots = n <= 14;
  const dots = showDots
    ? points.map((p, i) =>
        `<circle cx="${xToPx(i).toFixed(1)}" cy="${yToPx(p.value).toFixed(1)}" r="2.5" class="chart-dot"/>`
      ).join('')
    : '';

  // Y-axis labels: top, mid, bottom.
  const yLabel = v => {
    const dp = priceDigits(country.currency);
    return `${country.symbol}${v.toFixed(dp + 1)}`;
  };
  const yTicks = [yHi, (yHi + yLo) / 2, yLo].map(v =>
    `<text x="${PADL - 4}" y="${yToPx(v) + 3}" class="chart-y-label">${yLabel(v)}</text>`
  ).join('');

  // X-axis labels: month names when the visible window spans 2+ months, otherwise dates.
  const firstD = new Date(points[0].date);
  const lastD = new Date(points[n - 1].date);
  const monthSpan = (lastD.getUTCFullYear() - firstD.getUTCFullYear()) * 12
    + (lastD.getUTCMonth() - firstD.getUTCMonth());
  let xLabels = '';
  if (monthSpan >= 2) {
    // Place a label at the first point of each month visible.
    const seen = new Set();
    const labels = [];
    points.forEach((p, i) => {
      const d = new Date(p.date);
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
      if (seen.has(key)) return;
      seen.add(key);
      labels.push({ idx: i, label: MONTH_NAMES_SHORT[d.getUTCMonth()] });
    });
    // Drop the first label if it's right at idx=0 (avoids overlap with y-axis).
    const filtered = labels.filter(l => l.idx > 0 || labels.length === 1);
    xLabels = filtered.map(l =>
      `<text x="${xToPx(l.idx).toFixed(1)}" y="${H - 6}" class="chart-x-label" text-anchor="middle">${l.label}</text>`
    ).join('');
    // Always mark the projection endpoint.
    xLabels += `<text x="${xToPx(totalSteps).toFixed(1)}" y="${H - 6}" class="chart-x-label" text-anchor="end">+${projSteps}w</text>`;
  } else {
    const fmtDate = iso => { const [, m, d] = iso.split('-'); return `${m}/${d}`; };
    xLabels =
      `<text x="${xToPx(0).toFixed(1)}" y="${H - 6}" class="chart-x-label" text-anchor="start">${fmtDate(points[0].date)}</text>` +
      `<text x="${xToPx(n - 1).toFixed(1)}" y="${H - 6}" class="chart-x-label" text-anchor="middle">${fmtDate(points[n - 1].date)}</text>` +
      `<text x="${xToPx(totalSteps).toFixed(1)}" y="${H - 6}" class="chart-x-label" text-anchor="end">+${projSteps}w</text>`;
  }

  // Trend label
  const last = points[n - 1].value;
  const future = projected[projSteps - 1].value;
  const deltaPct = last > 0 ? ((future - last) / last) * 100 : 0;
  const trendDir = Math.abs(deltaPct) < 0.5 ? 'flat' : (deltaPct > 0 ? 'up' : 'down');
  const trendArrow = trendDir === 'up' ? '↗' : trendDir === 'down' ? '↘' : '→';
  const trendText = trendDir === 'flat'
    ? 'Flat trend'
    : `${deltaPct > 0 ? '+' : ''}${deltaPct.toFixed(1)}% in 4w (trend)`;

  host.innerHTML = `
    <div class="chart-header">
      <span class="chart-title">${escapeHtml(def.label)} · last ${n} weeks</span>
      <span class="chart-trend chart-trend-${trendDir}">${trendArrow} ${escapeHtml(trendText)}</span>
    </div>
    ${tabsHtml}
    <svg viewBox="0 0 ${W} ${H}" class="chart-svg" role="img" aria-label="Recent gas prices">
      ${yTicks}
      <path d="${linePath}" class="chart-line"/>
      <path d="${projPath}" class="chart-projection"/>
      ${dots}
      <circle cx="${lastActual.x.toFixed(1)}" cy="${lastActual.y.toFixed(1)}" r="3.5" class="chart-dot-last"/>
      ${xLabels}
    </svg>
    <p class="chart-note">Trend line is a simple linear projection — useful directionally, not a forecast.</p>
  `;
  bindChartRangeHandlers(host);
}

function renderChartRangeTabs(activeKey) {
  return `<div class="chart-range-tabs" role="tablist">
    ${Object.entries(CHART_RANGES).map(([key, r]) =>
      `<button type="button" class="chart-range-tab${key === activeKey ? ' active' : ''}" data-range="${key}">${r.label}</button>`
    ).join('')}
  </div>`;
}

function bindChartRangeHandlers(host) {
  for (const btn of host.querySelectorAll('.chart-range-tab')) {
    btn.addEventListener('click', () => {
      state.chartRange = btn.dataset.range;
      saveState();
      renderPriceChart();
    });
  }
}

function renderConditions() {
  const slider = $('cityMixSlider');
  slider.value = state.cityMixPct;
  slider.style.setProperty('--slider-val', String(state.cityMixPct));
  const cityPct = state.cityMixPct, hwyPct = 100 - cityPct;
  $('mixReadout').textContent = `${cityPct}% city · ${hwyPct}% hwy`;
  for (const btn of $$('.seg-btn[data-style]')) {
    btn.classList.toggle('active', btn.dataset.style === state.drivingStyle);
  }
  for (const cb of $$('input[type="checkbox"][data-cond]')) {
    cb.checked = !!state.conditions[cb.dataset.cond];
  }
}

function renderExtras() {
  if (document.activeElement !== $('passengersInput')) {
    $('passengersInput').value = state.passengers || 1;
  }
  if (document.activeElement !== $('tankInput')) {
    $('tankInput').value = state.tankSize ? String(state.tankSize) : '';
  }
  if (document.activeElement !== $('tollsInput')) {
    $('tollsInput').value = state.tolls ? String(state.tolls) : '';
  }
}

function renderCompare() {
  const body = $('compareBody');
  const toggleBtn = $('toggleCompareBtn');
  body.hidden = !state.compareEnabled;
  toggleBtn.textContent = state.compareEnabled ? 'Remove' : 'Add';
  if (!state.compareEnabled) return;

  for (const btn of $$('.seg-btn[data-cmp-mode]')) {
    btn.classList.toggle('active', btn.dataset.cmpMode === state.cmpVehicleMode);
  }
  $('cmpPickPanel').classList.toggle('hidden', state.cmpVehicleMode !== 'pick');
  $('cmpCustomPanel').classList.toggle('hidden', state.cmpVehicleMode !== 'custom');
  if (document.activeElement !== $('cmpCustomEffInput')) {
    $('cmpCustomEffInput').value = state.cmpCustomEff ? String(state.cmpCustomEff) : '';
  }
}

function vehicleLabel(vehicle, mode, customEff) {
  const us = UNIT_SYSTEMS[state.unitSystem];
  if (mode === 'custom') {
    if (!customEff) return 'Custom (not set)';
    return `Custom — ${fmtNumber(customEff, 1)} ${us.effLabel}`;
  }
  if (!vehicle) return 'Not selected';
  const v = vehicle;
  return `${v.year} ${v.make} ${v.model}${v.trimText ? ` · ${v.trimText.split(',')[0]}` : ''}`;
}
function cmpVehicleLabel() {
  return vehicleLabel(state.cmpPickedVehicle, state.cmpVehicleMode, state.cmpCustomEff);
}

function renderResults() {
  updateDistanceHint();
  const r = calculate();
  const us = r.us;
  const country = r.country;
  const sym = country.symbol;
  const flash = (id, val) => {
    const el = $(id);
    if (!el) return;
    if (el.textContent !== val) {
      el.textContent = val;
      el.classList.remove('flash');
      void el.offsetWidth;
      el.classList.add('flash');
    }
  };

  // ----- HERO TOTAL -----
  $('heroSymbol').textContent = sym;
  $('heroCurrency').textContent = country.currency;
  const heroNumEl = $('heroNum');
  const newHeroNum = fmtNumber(r.totalCost > 0 ? r.totalCost : 0, moneyDigits(country.currency));
  if (heroNumEl.textContent !== newHeroNum) {
    heroNumEl.textContent = newHeroNum;
    heroNumEl.classList.remove('flash');
    void heroNumEl.offsetWidth;
    heroNumEl.classList.add('flash');
  }
  // Hero sub text
  let heroSub;
  if (r.totalCost > 0) {
    const distDisp = fromKm(r.distanceKm, us.distance);
    heroSub = `${fmtNumber(distDisp, 0)} ${us.distLabel}${state.isRoundTrip ? ' round trip' : ''}`;
  } else if (r.distanceKm === 0 && r.baseL === 0) {
    heroSub = 'Add a distance and vehicle';
  } else if (r.distanceKm === 0) {
    heroSub = 'Enter your trip distance';
  } else if (r.baseL === 0) {
    heroSub = 'Pick a vehicle or enter custom efficiency';
  } else {
    heroSub = 'Enter a gas price';
  }
  $('heroSub').textContent = heroSub;

  // ----- PER-PERSON BAR -----
  if (r.totalCost > 0 && r.passengers > 1) {
    $('perPersonBar').hidden = false;
    $('ppCount').textContent = String(r.passengers);
    flash('ppValue', `${sym}${fmtNumber(r.perPerson, moneyDigits(country.currency))}`);
  } else {
    $('perPersonBar').hidden = true;
  }

  // ----- BREAKDOWN -----
  // Distance
  const distDisp = fromKm(r.distanceKm, us.distance);
  flash('resDistance',
    r.distanceKm > 0
      ? `${fmtNumber(distDisp, 1)} ${us.distLabel}${state.isRoundTrip ? ' (round trip)' : ''}`
      : '—'
  );

  // Vehicle line — only append efficiency when picking from DB (custom label already has it).
  const vLabel = vehicleLabel(state.pickedVehicle, state.vehicleMode, state.customEff);
  let vehicleLine = vLabel;
  if (state.vehicleMode === 'pick' && r.baseL > 0) {
    vehicleLine += ` — ${fmtNumber(fromL100km(r.baseL, us.efficiency), 1)} ${us.effLabel}`;
  }
  const vIcon = (state.vehicleMode === 'pick' && state.pickedVehicle?.vClass)
    ? bodyClassIcon(state.pickedVehicle.vClass) : '';
  flash('resVehicle', vIcon ? `${vIcon}  ${vehicleLine}` : vehicleLine);

  // Adjusted
  if (r.adjL > 0 && Math.abs(r.adjL - r.baseL) > 0.001) {
    $('resAdjustedRow').hidden = false;
    flash('resAdjusted', `${fmtNumber(fromL100km(r.adjL, us.efficiency), 1)} ${us.effLabel}`);
  } else {
    $('resAdjustedRow').hidden = true;
  }

  // Fuel needed
  if (r.fuelLitres > 0) {
    const volDisp = fromLitre(r.fuelLitres, us.volume);
    flash('resFuel', `${fmtNumber(volDisp, 2)} ${us.volLabel}`);
  } else {
    flash('resFuel', '—');
  }

  // Price
  flash('resPrice', state.price > 0 ? `${sym}${fmtNumber(state.price, priceDigits(country.currency))}/${us.volLabel}` : '—');

  // Per distance
  if (r.totalCost > 0 && r.distanceKm > 0) {
    const totalDistDisp = fromKm(r.distanceKm, us.distance);
    const perDist = r.totalCost / totalDistDisp;
    flash('resPerDist', `${sym}${fmtNumber(perDist, 3)} ${country.currency}`);
  } else {
    flash('resPerDist', '—');
  }

  // Fill-ups
  if (r.fillups != null) {
    $('resFillupsRow').hidden = false;
    flash('resFillups', `~${fmtNumber(r.fillups, 1)} on a ${fmtNumber(state.tankSize, 0)} ${us.volLabel} tank`);
  } else {
    $('resFillupsRow').hidden = true;
  }

  // Tolls + grand total
  if (r.tolls > 0) {
    $('resTollsRow').hidden = false;
    $('resGrandTotalRow').hidden = false;
    flash('resTolls', fmtMoney(r.tolls, sym, country.currency));
    flash('resGrandTotal', fmtMoney(r.grandTotal, sym, country.currency));
  } else {
    $('resTollsRow').hidden = true;
    $('resGrandTotalRow').hidden = true;
  }

  // Comparison
  const cmpPanel = $('comparisonPanel');
  if (r.comparison) {
    cmpPanel.hidden = false;
    $('cmpVehLabel').textContent = r.comparison.label;
    flash('cmpFuel', `${fmtNumber(fromLitre(r.comparison.fuelL, us.volume), 2)} ${us.volLabel}`);
    flash('cmpTotal', fmtMoney(r.comparison.cost, sym, country.currency));
    const sav = r.comparison.savings;
    const savLine = $('savingsLine');
    if (Math.abs(sav) < 0.01) {
      savLine.textContent = 'About the same.';
      savLine.classList.remove('negative');
    } else if (sav > 0) {
      savLine.textContent = `Comparison vehicle saves ${fmtMoney(sav, sym, country.currency)}.`;
      savLine.classList.remove('negative');
    } else {
      savLine.textContent = `Primary vehicle saves ${fmtMoney(-sav, sym, country.currency)}.`;
      savLine.classList.add('negative');
    }
  } else {
    cmpPanel.hidden = true;
  }

  // Warning for EVs / missing fuel data
  const warn = $('resWarn');
  let warnText = '';
  if (state.vehicleMode === 'pick' && state.pickedVehicle) {
    const ft = (state.pickedVehicle.fuelType || '').toLowerCase();
    if (ft.includes('electricity') && !ft.includes('gasoline')) {
      warnText = 'This is an electric vehicle — gasoline cost does not apply.';
    } else if (ft.includes('premium')) {
      warnText = 'Manufacturer recommends Premium gasoline.';
    } else if (ft.includes('diesel') && state.fuelType !== 'diesel') {
      warnText = 'This is a diesel vehicle — switch fuel type to Diesel for accurate cost.';
    }
  }
  if (warnText) { warn.hidden = false; warn.textContent = warnText; }
  else { warn.hidden = true; }
}

/* =========================
   VEHICLE PICKER LOGIC (combo-based)
   ========================= */
function comboGroup(role) {
  return role === 'primary'
    ? { year: combos.year, make: combos.make, model: combos.model, trim: combos.trim }
    : { year: combos.cmpYear, make: combos.cmpMake, model: combos.cmpModel, trim: combos.cmpTrim };
}

async function initPickers(role = 'primary') {
  const c = comboGroup(role);
  if (!c.year) return;
  c.year.setLoading(true, 'Loading years…');
  try {
    const years = await fegYears();
    c.year.setLoading(false);
    const sorted = years.slice().sort((a, b) => Number(b) - Number(a));
    c.year.setOptions(sorted.map(y => ({ value: y, label: y })));
  } catch (e) {
    c.year.setLoading(false);
    showVehicleError(role, 'Vehicle database unavailable. Use custom efficiency mode.');
  }
}

function showVehicleError(role, msg) {
  if (role === 'primary') {
    const err = $('vehicleError');
    err.textContent = msg; err.hidden = false;
  } else {
    state.cmpVehicleMode = 'custom';
    renderCompare();
  }
}

async function onYearChange(role, year) {
  const c = comboGroup(role);
  c.make.clear(); c.model.clear(); c.trim.clear();
  c.make.setDisabled(true); c.model.setDisabled(true); c.trim.setDisabled(true);
  if (role === 'primary') state.pickedVehicle = null;
  else state.cmpPickedVehicle = null;
  update();
  if (!year) return;
  c.make.setLoading(true, 'Loading makes…');
  try {
    const makes = await fegMakes(year);
    c.make.setLoading(false);
    c.make.setOptions(makes.map(m => ({ value: m, label: m })));
    c.make.setDisabled(false);
  } catch (e) { c.make.setLoading(false); showVehicleError(role, 'Could not load makes.'); }
}

async function onMakeChange(role, make) {
  const c = comboGroup(role);
  c.model.clear(); c.trim.clear();
  c.model.setDisabled(true); c.trim.setDisabled(true);
  if (role === 'primary') state.pickedVehicle = null;
  else state.cmpPickedVehicle = null;
  update();
  const year = c.year.getValue();
  if (!year || !make) return;
  c.model.setLoading(true, 'Loading models…');
  try {
    const models = await fegModels(year, make);
    c.model.setLoading(false);
    c.model.setOptions(models.map(m => ({ value: m, label: m })));
    c.model.setDisabled(false);
  } catch (e) { c.model.setLoading(false); showVehicleError(role, 'Could not load models.'); }
}

async function onModelChange(role, model) {
  const c = comboGroup(role);
  c.trim.clear(); c.trim.setDisabled(true);
  if (role === 'primary') state.pickedVehicle = null;
  else state.cmpPickedVehicle = null;
  update();
  const year = c.year.getValue(), make = c.make.getValue();
  if (!year || !make || !model) return;
  c.trim.setLoading(true, 'Loading trims…');
  try {
    const opts = await fegOptions(year, make, model);
    c.trim.setLoading(false);
    c.trim.setOptions(opts.map(o => ({ value: o.value, label: o.text })));
    c.trim.setDisabled(false);
  } catch (e) { c.trim.setLoading(false); showVehicleError(role, 'Could not load trims.'); }
}

async function onTrimChange(role, vehicleId) {
  const c = comboGroup(role);
  if (!vehicleId) {
    if (role === 'primary') state.pickedVehicle = null;
    else state.cmpPickedVehicle = null;
    update(); return;
  }
  try {
    const veh = await fegVehicle(vehicleId);
    const trimText = c.trim.getLabel();
    const data = {
      id: vehicleId,
      year: c.year.getValue(),
      make: c.make.getValue(),
      model: c.model.getValue(),
      trimText,
      city08: veh.city08, highway08: veh.highway08, comb08: veh.comb08,
      fuelType: veh.fuelType || veh.fuelType1 || '',
      vClass: veh.VClass || veh.vClass || '',
    };
    if (role === 'primary') {
      state.pickedVehicle = data;
      // Auto-fill tank size from vehicle class so users don't have to look it up.
      const litres = estimateTankLitres(data.vClass);
      if (litres > 0) {
        const us = UNIT_SYSTEMS[state.unitSystem];
        state.tankSize = parseFloat(fromLitre(litres, us.volume).toFixed(1));
      }
    } else {
      state.cmpPickedVehicle = data;
    }
    update();
  } catch (e) { showVehicleError(role, 'Could not load vehicle data.'); }
}

/* =========================
   THEME
   ========================= */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
  $('themeIcon').textContent = theme === 'light' ? '☀️' : '🌙';
  state.theme = theme;
  // Swap map tiles if a map is already on the page
  if (map && map.instance) applyMapTiles();
}

/* =========================
   EVENTS
   ========================= */
const update = debounce(() => {
  renderResults();
  // Keep per-route fuel estimates fresh if routes are visible
  if (map.routes && map.routes.length > 0) renderRouteAlts();
  saveState();
}, 80);

function attachListeners() {
  // Theme
  $('themeToggle').addEventListener('click', () => {
    applyTheme(state.theme === 'light' ? 'dark' : 'light');
    saveState();
  });

  // Refresh location
  $('refreshLocationBtn').addEventListener('click', async () => {
    const det = await detectLocation();
    if (det && det.country) {
      applyDetected(det);
    }
    render(); update();
  });

  // Unit system
  for (const btn of $$('.unit-card .seg-btn')) {
    btn.addEventListener('click', () => {
      changeUnitSystem(btn.dataset.unit);
    });
  }

  // Distance
  $('distanceInput').addEventListener('input', (e) => {
    state.distance = parseFloat(e.target.value) || 0;
    updateDistanceHint();
    update();
  });
  $('roundTripChk').addEventListener('change', (e) => {
    state.isRoundTrip = e.target.checked;
    renderDistance(); update();
  });

  // Stops (route waypoints)
  $('addStopBtn').addEventListener('click', () => {
    map.stops.push({ lat: null, lon: null, label: '' });
    renderStops();
    // Focus the new input
    const inputs = document.querySelectorAll('#stopsList .stop-input');
    inputs[inputs.length - 1]?.focus();
  });
  $('suggestStopsBtn').addEventListener('click', suggestFuelStops);
  $('mapClickModeBtn').addEventListener('click', toggleMapClickMode);
  $('clearRouteBtn').addEventListener('click', () => {
    clearRoutePoints();
    showToast('Route cleared. Pick A and B from the map or the address fields.');
  });

  // Vehicle mode
  for (const btn of $$('.card .seg-btn[data-mode]')) {
    btn.addEventListener('click', () => {
      state.vehicleMode = btn.dataset.mode;
      renderVehicleMode(); update();
    });
  }

  // (Pickers wired through combo onChange callbacks in initCombos)

  // VIN lookup
  $('vinLookupBtn').addEventListener('click', () => openModal('vinModal'));
  $('vinDecodeBtn').addEventListener('click', handleVinDecode);
  $('vinInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleVinDecode(); }
  });

  // Route planner
  $('distLookupGo').addEventListener('click', handleDistanceLookup);
  $('distMapsBtn').addEventListener('click', (e) => {
    e.preventDefault();
    const o = $('distOrigin').value.trim();
    const d = $('distDest').value.trim();
    let url = 'https://www.google.com/maps/dir/';
    if (o && d) url += `${encodeURIComponent(o)}/${encodeURIComponent(d)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  // Address autocomplete
  attachAddressAutocomplete($('distOrigin'), $('distOriginDropdown'), (coords) => {
    map.origin = coords; // null clears cache
  });
  attachAddressAutocomplete($('distDest'), $('distDestDropdown'), (coords) => {
    map.dest = coords;
  });

  // Allow Enter in either address field to trigger Calculate
  ['distOrigin', 'distDest'].forEach(id => {
    $(id).addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && $('distOriginDropdown').hidden && $('distDestDropdown').hidden) {
        e.preventDefault();
        handleDistanceLookup();
      }
    });
  });

  // Avoid checkboxes — re-pick active route or re-render labels
  $('avoidHighways').addEventListener('change', () => {
    if (map.routes.length > 0) {
      // Re-pick active route based on new preference (no re-fetch needed)
      selectRoute(pickActiveRouteIdx());
    }
  });
  ['avoidTolls', 'avoidFerries'].forEach(id => {
    $(id).addEventListener('change', () => {
      // No filtering possible — just refresh hint text
      if (map.routes.length > 0) {
        const hint = $('distLookupHint');
        hint.style.color = 'var(--text-fade)';
        hint.textContent = `${map.routes.length} route${map.routes.length > 1 ? 's' : ''} loaded.${avoidNoteSuffix()}`;
      }
    });
  });

  // Custom efficiency
  $('customEffInput').addEventListener('input', (e) => {
    state.customEff = parseFloat(e.target.value) || 0;
    update();
  });

  // Gas price
  $('priceInput').addEventListener('input', (e) => {
    state.price = parseFloat(e.target.value) || 0;
    state.priceTouched = true;
    $('priceHint').textContent = 'Custom price';
    update();
  });
  for (const btn of $$('.fuel-types .seg-btn')) {
    btn.addEventListener('click', () => {
      state.fuelType = btn.dataset.fuel;
      state.priceTouched = false;
      renderGasPrice(); update();
    });
  }

  // Conditions
  $('cityMixSlider').addEventListener('input', (e) => {
    state.cityMixPct = parseInt(e.target.value, 10);
    e.target.style.setProperty('--slider-val', String(state.cityMixPct));
    const cityPct = state.cityMixPct, hwyPct = 100 - cityPct;
    $('mixReadout').textContent = `${cityPct}% city · ${hwyPct}% hwy`;
    update();
  });
  for (const btn of $$('.seg-btn[data-style]')) {
    btn.addEventListener('click', () => {
      state.drivingStyle = btn.dataset.style;
      renderConditions(); update();
    });
  }
  for (const cb of $$('input[type="checkbox"][data-cond]')) {
    cb.addEventListener('change', () => {
      state.conditions[cb.dataset.cond] = cb.checked;
      update();
    });
  }

  // Extras
  $('passengersInput').addEventListener('input', (e) => {
    state.passengers = Math.max(1, parseInt(e.target.value, 10) || 1);
    update();
  });
  $('tankInput').addEventListener('input', (e) => {
    state.tankSize = parseFloat(e.target.value) || 0;
    update();
  });
  $('tollsInput').addEventListener('input', (e) => {
    state.tolls = parseFloat(e.target.value) || 0;
    update();
  });

  // Compare
  $('toggleCompareBtn').addEventListener('click', () => {
    state.compareEnabled = !state.compareEnabled;
    renderCompare();
    if (state.compareEnabled) initPickers('compare');
    update();
  });
  for (const btn of $$('.seg-btn[data-cmp-mode]')) {
    btn.addEventListener('click', () => {
      state.cmpVehicleMode = btn.dataset.cmpMode;
      renderCompare(); update();
    });
  }
  // Comparison combos wired via initCombos onChange.
  $('cmpCustomEffInput').addEventListener('input', (e) => {
    state.cmpCustomEff = parseFloat(e.target.value) || 0;
    update();
  });

  // Modal close handlers (backdrop / × / Esc)
  document.querySelectorAll('[data-modal-close]').forEach(el => {
    el.addEventListener('click', (e) => {
      const modal = el.closest('.modal');
      if (modal) closeModal(modal.id);
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal:not([hidden])').forEach(m => closeModal(m.id));
    }
  });
}

/* =========================
   COMBOS / MODAL HELPERS
   ========================= */
function initCombos() {
  combos.country = createCombo($('countryCombo'), {
    placeholder: 'Select country',
    searchPlaceholder: 'Search countries…',
    onChange: (val) => {
      if (!val) return;
      state.country = val;
      state.region = null;
      state.priceTouched = false;
      state.unitSystem = getCountry(state.country).unit;
      render(); update();
    },
  });
  combos.country.setOptions(COUNTRIES.map(c => ({ value: c.code, label: c.name, search: c.code })));

  combos.province = createCombo($('provinceCombo'), {
    placeholder: 'Pick a province',
    searchPlaceholder: 'Search…',
    onChange: (val) => {
      state.region = val || null;
      state.priceTouched = false;
      render(); update();
    },
  });
  combos.province.setOptions(CA_PROVINCES.map(p => ({ value: p.code, label: p.name })));

  // Primary vehicle combos
  combos.year = createCombo($('yearCombo'), {
    placeholder: 'Year', searchPlaceholder: 'Type a year…',
    onChange: (val) => onYearChange('primary', val),
  });
  combos.make = createCombo($('makeCombo'), {
    placeholder: 'Pick year first', searchPlaceholder: 'Search makes…',
    onChange: (val) => onMakeChange('primary', val),
  });
  combos.make.setDisabled(true);
  combos.model = createCombo($('modelCombo'), {
    placeholder: 'Pick make first', searchPlaceholder: 'Search models…',
    onChange: (val) => onModelChange('primary', val),
  });
  combos.model.setDisabled(true);
  combos.trim = createCombo($('trimCombo'), {
    placeholder: 'Pick model first', searchPlaceholder: 'Search trims…',
    onChange: (val) => onTrimChange('primary', val),
  });
  combos.trim.setDisabled(true);

  // Comparison combos
  combos.cmpYear = createCombo($('cmpYearCombo'), {
    placeholder: 'Year', searchPlaceholder: 'Type a year…',
    onChange: (val) => onYearChange('compare', val),
  });
  combos.cmpMake = createCombo($('cmpMakeCombo'), {
    placeholder: 'Pick year first', searchPlaceholder: 'Search makes…',
    onChange: (val) => onMakeChange('compare', val),
  });
  combos.cmpMake.setDisabled(true);
  combos.cmpModel = createCombo($('cmpModelCombo'), {
    placeholder: 'Pick make first', searchPlaceholder: 'Search models…',
    onChange: (val) => onModelChange('compare', val),
  });
  combos.cmpModel.setDisabled(true);
  combos.cmpTrim = createCombo($('cmpTrimCombo'), {
    placeholder: 'Pick model first', searchPlaceholder: 'Search trims…',
    onChange: (val) => onTrimChange('compare', val),
  });
  combos.cmpTrim.setDisabled(true);
}

function openModal(id) {
  const m = $(id);
  if (!m) return;
  m.hidden = false;
  document.body.style.overflow = 'hidden';
  // Focus first input
  setTimeout(() => m.querySelector('input, button')?.focus(), 50);
}
function closeModal(id) {
  const m = $(id);
  if (!m) return;
  m.hidden = true;
  document.body.style.overflow = '';
}

/* =========================
   VIN DECODE (NHTSA vPIC)
   ========================= */
async function handleVinDecode() {
  const inp = $('vinInput');
  const result = $('vinResult');
  const btn = $('vinDecodeBtn');
  const vin = (inp.value || '').trim().toUpperCase();
  if (vin.length < 11) {
    result.hidden = false;
    result.className = 'modal-result error';
    result.textContent = 'VIN looks too short. Most modern VINs are 17 characters.';
    return;
  }
  result.hidden = false;
  result.className = 'modal-result';
  result.textContent = 'Decoding…';
  btn.disabled = true;
  try {
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NHTSA error ${res.status}`);
    const data = await res.json();
    const r = data?.Results?.[0];
    if (!r) throw new Error('No data returned');
    const year = r.ModelYear, make = r.Make, model = r.Model;
    if (!year || !make || !model) throw new Error('VIN incomplete — year, make or model missing.');
    result.className = 'modal-result success';
    result.textContent = `Found: ${year} ${make} ${model}. Loading trims…`;
    await applyVinToPickers({ year, make, model });
    result.textContent = `✓ ${year} ${make} ${model} — pick your trim from the dropdown.`;
    setTimeout(() => closeModal('vinModal'), 700);
  } catch (e) {
    result.className = 'modal-result error';
    result.textContent = `Failed: ${e.message}`;
  } finally {
    btn.disabled = false;
  }
}

async function applyVinToPickers({ year, make, model }) {
  // Switch to pick mode and run the picker chain.
  state.vehicleMode = 'pick';
  renderVehicleMode();

  combos.year.setValue(String(year));
  await onYearChange('primary', String(year));
  // Match make case-insensitively
  const makes = await fegMakes(String(year));
  const matchedMake = makes.find(m => m.toLowerCase() === make.toLowerCase())
    || makes.find(m => m.toLowerCase().startsWith(make.toLowerCase()));
  if (!matchedMake) throw new Error(`Make "${make}" not in database for ${year}`);
  combos.make.setValue(matchedMake);
  await onMakeChange('primary', matchedMake);
  // Match model
  const models = await fegModels(String(year), matchedMake);
  const target = model.toLowerCase();
  const matchedModel = models.find(m => m.toLowerCase() === target)
    || models.find(m => m.toLowerCase().startsWith(target))
    || models.find(m => m.toLowerCase().includes(target.split(' ')[0]));
  if (!matchedModel) throw new Error(`Model "${model}" not in database`);
  combos.model.setValue(matchedModel);
  await onModelChange('primary', matchedModel);
}

/* =========================
   DISTANCE LOOKUP + EMBEDDED MAP (OSM/Leaflet)
   ========================= */
const map = {
  instance: null,
  tileLayer: null,
  routeLayers: [],     // one Polyline per alternative route
  stationLayer: null,
  startMarker: null,
  endMarker: null,
  stopMarkers: [],     // markers for intermediate stops
  origin: null,        // { lon, lat, label }
  dest: null,          // { lon, lat, label }
  stops: [],           // [{ lon, lat, label }] — intermediate waypoints
  routes: [],          // [{ distance, duration, coords }]
  activeRoute: 0,
  clickMode: false,    // when true, clicking the map adds a stop
};

const ROUTE_COLORS = ['#F59E0B', '#22C55E', '#60A5FA'];
const ROUTE_NAMES = ['Fastest', 'Alternative', 'Scenic'];
// OSRM's default car profile uses conservative free-flow speeds and undershoots real-world ETAs by ~22%.
// Empirical correction so durations match traffic-aware estimates (Google Maps).
const DURATION_CORRECTION = 0.78;
let stationGen = 0; // generation counter to discard stale station-load results

function ensureMap() {
  if (map.instance) return map.instance;
  if (typeof L === 'undefined') throw new Error('Leaflet failed to load');
  const el = document.getElementById('map');
  const defaultView = state.detected?.lat != null && state.detected?.lng != null
    ? { center: [state.detected.lat, state.detected.lng], zoom: 7 }
    : { center: [45, -75], zoom: 4 };
  map.instance = L.map(el, { zoomControl: true, attributionControl: true })
    .setView(defaultView.center, defaultView.zoom);
  applyMapTiles();
  bindStationPopupHandlers();
  // Listen for clicks to add waypoints when clickMode is active. The handler
  // figures out whether this click should be A, B, or a stop based on what's
  // already set, so the user can build a whole route from the map alone.
  map.instance.on('click', (e) => {
    if (!map.clickMode) return;
    addPointByClick(e.latlng.lat, e.latlng.lng);
  });
  return map.instance;
}

async function reverseGeocodeLabel(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`);
    if (res.ok) {
      const data = await res.json();
      const fmt = formatNominatimSuggestion(data);
      return fmt.value || data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  } catch { /* fall back */ }
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

// Smart click-to-build-route:
//   1st click → origin (A)
//   2nd click → destination (B), route is plotted
//   3rd+ clicks → fuel stops along the way
async function addPointByClick(lat, lon) {
  const label = await reverseGeocodeLabel(lat, lon);
  const point = { lat, lon, label };

  if (!map.origin) {
    map.origin = point;
    $('distOrigin').value = label;
    showToast(`Start set: ${label}`, 'success');
    return;
  }
  if (!map.dest) {
    map.dest = point;
    $('distDest').value = label;
    showToast(`Destination set: ${label}`, 'success');
    handleDistanceLookup();
    return;
  }
  map.stops.push(point);
  renderStops();
  showToast(`Stop added: ${label}`, 'success');
  handleDistanceLookup();
}

// Wipe the route so the user can build a fresh one from map clicks.
function clearRoutePoints() {
  map.origin = null;
  map.dest = null;
  map.stops = [];
  $('distOrigin').value = '';
  $('distDest').value = '';
  renderStops();
  // Pull route polylines + start/end markers off the map.
  if (typeof clearRouteLayers === 'function') clearRouteLayers();
  if (map.startMarker) { map.instance.removeLayer(map.startMarker); map.startMarker = null; }
  if (map.endMarker) { map.instance.removeLayer(map.endMarker); map.endMarker = null; }
  for (const m of map.stopMarkers || []) map.instance.removeLayer(m);
  map.stopMarkers = [];
  map.routes = [];
  renderRouteAlts();
  $('mapInfo').textContent = 'Pan & zoom · enter addresses above to plot a route';
}

function applyMapTiles() {
  if (!map.instance) return;
  if (map.tileLayer) map.instance.removeLayer(map.tileLayer);
  const dark = state.theme !== 'light';
  const url = dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/voyager/{z}/{x}/{y}{r}.png';
  map.tileLayer = L.tileLayer(url, {
    maxZoom: 19,
    attribution: '© OpenStreetMap, © CARTO',
    subdomains: 'abcd',
  }).addTo(map.instance);
}

function clearRouteLayers() {
  for (const layer of map.routeLayers) map.instance.removeLayer(layer);
  map.routeLayers = [];
  if (map.startMarker) { map.instance.removeLayer(map.startMarker); map.startMarker = null; }
  if (map.endMarker) { map.instance.removeLayer(map.endMarker); map.endMarker = null; }
  for (const m of map.stopMarkers) map.instance.removeLayer(m);
  map.stopMarkers = [];
}

function clearStationLayer() {
  if (map.stationLayer) { map.instance.removeLayer(map.stationLayer); map.stationLayer = null; }
  map.stationCount = 0;
}

function clearMapLayers() {
  clearRouteLayers();
  clearStationLayer();
}

async function handleDistanceLookup() {
  const originText = $('distOrigin').value.trim();
  const destText = $('distDest').value.trim();
  const hint = $('distLookupHint');
  const btn = $('distLookupGo');
  if (!originText || !destText) {
    hint.textContent = 'Enter both an origin and destination.';
    hint.style.color = 'var(--red)';
    return;
  }
  hint.style.color = '';
  hint.textContent = 'Resolving addresses…';
  btn.disabled = true;
  try {
    // Use cached coords if user picked from autocomplete; else geocode the text
    const origin = map.origin && map.origin.label === originText
      ? map.origin
      : await geocodeOne(originText);
    const dest = map.dest && map.dest.label === destText
      ? map.dest
      : await geocodeOne(destText);
    map.origin = origin; map.dest = dest;

    // Resolve any unresolved stops (typed but not picked from autocomplete)
    const stopsResolved = [];
    for (let i = 0; i < map.stops.length; i++) {
      const s = map.stops[i];
      if (s && s.lat != null && s.lon != null) {
        stopsResolved.push(s);
      } else if (s && s.label) {
        try {
          const g = await geocodeOne(s.label);
          map.stops[i] = g;
          stopsResolved.push(g);
        } catch (e) {
          // Skip unresolvable stops silently
        }
      }
    }

    hint.textContent = 'Computing routes…';
    const points = [origin, ...stopsResolved, dest]
      .map(p => `${p.lon},${p.lat}`).join(';');
    // alternatives only available for 2-point routes; with stops, skip
    const altParam = stopsResolved.length === 0 ? '&alternatives=2' : '';
    const url = `https://router.project-osrm.org/route/v1/driving/${points}?overview=full&geometries=geojson${altParam}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Route lookup failed (${r.status})`);
    const data = await r.json();
    if (data.code !== 'Ok' || !data.routes?.length) throw new Error('No drivable route found');

    map.routes = data.routes.map(rt => ({
      distance: rt.distance,
      duration: rt.duration,
      coords: rt.geometry.coordinates,
      avgSpeedKmh: (rt.distance / rt.duration) * 3.6,
    }));
    // Pick initial active route based on user preferences
    map.activeRoute = pickActiveRouteIdx();

    hint.style.color = 'var(--green)';
    const noteSuffix = avoidNoteSuffix();
    hint.textContent = `✓ ${map.routes.length} route${map.routes.length > 1 ? 's' : ''} found. Click a route to use it.${noteSuffix}`;

    // Stations need a fresh load for the new origin/dest pair (different geographic area)
    if (map.instance) clearStationLayer();

    selectRoute(map.activeRoute); // updates display + calculator, no station reload
    // Now load stations for the union of all routes
    loadStationsForAllRoutes();
  } catch (e) {
    hint.style.color = 'var(--red)';
    hint.textContent = `Couldn't compute: ${e.message}`;
  } finally {
    btn.disabled = false;
  }
}

async function geocodeOne(q) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`Geocode failed (${res.status})`);
  const arr = await res.json();
  if (!arr || arr.length === 0) throw new Error(`Couldn't locate "${q}"`);
  return { lon: parseFloat(arr[0].lon), lat: parseFloat(arr[0].lat), label: arr[0].display_name };
}

function labelRoutes(routes) {
  if (routes.length === 0) return [];
  const fastestIdx = routes.reduce((a, r, i) => r.duration < routes[a].duration ? i : a, 0);
  const shortestIdx = routes.reduce((a, r, i) => r.distance < routes[a].distance ? i : a, 0);
  const slowestIdx = routes.reduce((a, r, i) => r.avgSpeedKmh < routes[a].avgSpeedKmh ? i : a, 0);
  const avoidHwy = $('avoidHighways')?.checked;

  return routes.map((r, i) => {
    const isFast = i === fastestIdx;
    const isShort = i === shortestIdx;
    const isSlowest = i === slowestIdx;

    // Highlight the "less highway" alt when user wants to avoid highways
    if (avoidHwy && routes.length > 1 && isSlowest && !isFast) {
      return { label: 'Less highway', color: '#A78BFA', key: 'lowhwy' };
    }
    if (isFast && isShort && routes.length > 1) {
      return { label: 'Fastest & most efficient', color: '#F59E0B', key: 'both' };
    }
    if (isFast) return { label: 'Fastest', color: '#F59E0B', key: 'fast' };
    if (isShort) return { label: 'Most fuel efficient', color: '#22C55E', key: 'efficient' };
    return { label: 'Alternative', color: '#60A5FA', key: 'alt' };
  });
}

function pickActiveRouteIdx() {
  if (!map.routes.length) return 0;
  const avoidHwy = $('avoidHighways')?.checked;
  if (avoidHwy && map.routes.length > 1) {
    // Lowest avg speed = least highway-heavy
    return map.routes.reduce((a, rt, i) => rt.avgSpeedKmh < map.routes[a].avgSpeedKmh ? i : a, 0);
  }
  // Default: most fuel efficient (shortest distance)
  return map.routes.reduce((a, rt, i) => rt.distance < map.routes[a].distance ? i : a, 0);
}

function avoidNoteSuffix() {
  const tolls = $('avoidTolls')?.checked;
  const ferries = $('avoidFerries')?.checked;
  if (!tolls && !ferries) return '';
  const which = [tolls && 'tolls', ferries && 'ferries'].filter(Boolean).join(' & ');
  return ` Note: ${which} can't be filtered without a paid routing API.`;
}

function routeFuelEstimate(routeKm) {
  const baseL = effectiveL100km(state.pickedVehicle, state.customEff, state.vehicleMode, state.cityMixPct);
  const adjL = applyAdjustments(baseL, state.drivingStyle, state.conditions);
  if (adjL <= 0) return null;
  const fuelL = (adjL * routeKm) / 100;
  const us = UNIT_SYSTEMS[state.unitSystem];
  const country = getCountry(state.country);
  const priceCanonical = priceDisplayToPerL(state.price || 0, us.volume);
  const cost = priceCanonical > 0 ? fuelL * priceCanonical : null;
  return {
    fuelL,
    volDisp: fromLitre(fuelL, us.volume),
    volLabel: us.volLabel,
    cost,
    sym: country.symbol,
    currency: country.currency,
  };
}

function plotRoutes() {
  const m = ensureMap();
  setTimeout(() => m.invalidateSize(), 30);
  clearRouteLayers(); // keep station layer intact — it doesn't depend on which route is active
  if (!map.origin || !map.dest) return;

  // Origin / destination markers
  const startIcon = L.divIcon({ className: 'map-pin map-pin-start', html: 'A', iconSize: [28, 28] });
  const endIcon = L.divIcon({ className: 'map-pin map-pin-end', html: 'B', iconSize: [28, 28] });
  map.startMarker = L.marker([map.origin.lat, map.origin.lon], { icon: startIcon })
    .bindPopup(`<strong>Start</strong><br>${escapeHtml(map.origin.label)}`).addTo(m);
  map.endMarker = L.marker([map.dest.lat, map.dest.lon], { icon: endIcon })
    .bindPopup(`<strong>End</strong><br>${escapeHtml(map.dest.label)}`).addTo(m);

  // Stop waypoint markers
  map.stops.forEach((s, i) => {
    if (s.lat == null || s.lon == null) return;
    const icon = L.divIcon({ className: 'map-pin map-pin-stop', html: String(i + 1), iconSize: [26, 26] });
    const m2 = L.marker([s.lat, s.lon], { icon })
      .bindPopup(`<strong>Stop ${i + 1}</strong><br>${escapeHtml(s.label || '')}`).addTo(m);
    map.stopMarkers.push(m2);
  });

  const labels = labelRoutes(map.routes);
  // Draw alternatives — inactive ones first (under), active last (on top)
  const ordered = map.routes.map((r, i) => ({ r, i }));
  ordered.sort((a, b) => (a.i === map.activeRoute ? 1 : 0) - (b.i === map.activeRoute ? 1 : 0));
  for (const { r, i } of ordered) {
    const isActive = i === map.activeRoute;
    const color = labels[i].color;
    const latlngs = r.coords.map(c => [c[1], c[0]]);
    const layer = L.polyline(latlngs, {
      color,
      weight: isActive ? 5 : 4,
      opacity: isActive ? 0.95 : 0.45,
    }).addTo(m);
    if (!isActive) {
      layer.on('click', () => selectRoute(i));
      layer.bindTooltip(`${labels[i].label}: ${fmtNumber(r.distance / 1000, 1)} km — click to use`);
    }
    map.routeLayers[i] = layer;
  }

  // Fit map to active route
  if (map.routeLayers[map.activeRoute]) {
    m.fitBounds(map.routeLayers[map.activeRoute].getBounds(), { padding: [40, 40] });
  }
}

function renderRouteAlts() {
  const wrap = $('routeAlts');
  if (!map.routes.length) { wrap.hidden = true; return; }
  wrap.hidden = false;
  wrap.innerHTML = '<h3 class="route-alts-title">Pick a route <small style="font-weight:500;text-transform:none;letter-spacing:0;color:var(--text-fade)"> · fastest and most-efficient may differ — pick what matters for your trip</small></h3>';
  const us = UNIT_SYSTEMS[state.unitSystem];
  const labels = labelRoutes(map.routes);
  map.routes.forEach((r, i) => {
    const km = r.distance / 1000;
    // Apply correction factor to OSRM's free-flow duration so it matches real-world (Google) ETAs
    const correctedSec = r.duration * DURATION_CORRECTION;
    const mins = Math.round(correctedSec / 60);
    const hrs = Math.floor(mins / 60);
    const remMin = mins % 60;
    const timeStr = hrs ? `${hrs}h ${remMin}min` : `${mins} min`;
    const distDisp = fromKm(km, us.distance);
    const isActive = i === map.activeRoute;
    const lbl = labels[i];

    const fuelEst = routeFuelEstimate(km);
    let fuelHtml = '';
    if (fuelEst) {
      const volStr = `${fmtNumber(fuelEst.volDisp, 1)} ${fuelEst.volLabel}`;
      if (fuelEst.cost != null) {
        fuelHtml = `<span class="route-alt-fuel">⛽ ${volStr} · <strong>${fuelEst.sym}${fmtNumber(fuelEst.cost, moneyDigits(fuelEst.currency))}</strong></span>`;
      } else {
        fuelHtml = `<span class="route-alt-fuel">⛽ ${volStr}</span>`;
      }
    }

    const div = document.createElement('div');
    div.className = 'route-alt' + (isActive ? ' active' : '');
    div.innerHTML = `
      <div class="route-alt-bar" style="background:${lbl.color}"></div>
      <div class="route-alt-info">
        <div class="route-alt-name">${escapeHtml(lbl.label)}</div>
        <div class="route-alt-stats">
          <span class="route-alt-dist">${fmtNumber(distDisp, 1)} ${us.distLabel}</span>
          <span class="route-alt-time">${timeStr}</span>
          ${fuelHtml}
        </div>
      </div>
      <button class="route-alt-pick" type="button">${isActive ? '✓ Selected' : 'Use this'}</button>
    `;
    div.addEventListener('click', (e) => {
      if (e.target.closest('.route-alt-pick') || !isActive) selectRoute(i);
    });
    wrap.appendChild(div);
  });
}

function selectRoute(idx) {
  if (idx < 0 || idx >= map.routes.length) return;
  map.activeRoute = idx;

  // Apply this route's distance to the calculator
  const km = map.routes[idx].distance / 1000;
  const us = UNIT_SYSTEMS[state.unitSystem];
  const display = parseFloat(fromKm(km, us.distance).toFixed(1));
  state.distance = display;
  $('distanceInput').value = String(display);
  update();

  if (map.instance) plotRoutes(); // clears + redraws ROUTE layers only — stations stay
  renderRouteAlts();

  // Update info bar without disturbing stations.
  const cnt = map.stationCount || 0;
  $('mapInfo').textContent = cnt > 0
    ? `${cnt} fuel stations · ${fmtNumber(km, 1)} km active route`
    : `${fmtNumber(km, 1)} km active route`;
}

// Load gas stations once for all routes' union — kept stable across route switches.
async function loadStationsForAllRoutes() {
  if (!map.instance || !map.routes.length) return;
  const myGen = ++stationGen;
  $('mapInfo').textContent = 'Searching gas stations…';
  // Combine all route coords for a wider corridor search
  const allLatLngs = [];
  for (const r of map.routes) {
    for (const c of r.coords) allLatLngs.push([c[1], c[0]]);
  }
  try {
    const count = await loadGasStationsAlongRoute(allLatLngs);
    if (myGen !== stationGen) return; // stale
    map.stationCount = count;
    const km = map.routes[map.activeRoute].distance / 1000;
    $('mapInfo').textContent = `${count} fuel stations · ${fmtNumber(km, 1)} km active route`;
  } catch (err) {
    if (myGen !== stationGen) return;
    map.stationCount = 0;
    const km = map.routes[map.activeRoute].distance / 1000;
    $('mapInfo').textContent = `${fmtNumber(km, 1)} km route · stations unavailable`;
  }
}

/* =========================
   ADDRESS AUTOCOMPLETE (Nominatim)
   ========================= */
function formatNominatimSuggestion(r) {
  const a = r.address || {};
  let main = '', sub = '';
  // Prefer structured fields when available
  if (a.house_number && a.road) {
    main = `${a.house_number} ${a.road}`;
    sub = [a.suburb || a.neighbourhood, a.city || a.town || a.village || a.hamlet, a.state, a.country].filter(Boolean).join(', ');
  } else if (a.road) {
    main = a.road;
    sub = [a.suburb || a.neighbourhood, a.city || a.town || a.village, a.state, a.country].filter(Boolean).join(', ');
  } else if (a.city || a.town || a.village || a.hamlet) {
    main = a.city || a.town || a.village || a.hamlet;
    sub = [a.state || a.county, a.country].filter(Boolean).join(', ');
  } else if (a.county) {
    main = a.county;
    sub = [a.state, a.country].filter(Boolean).join(', ');
  } else if (a.state) {
    main = a.state;
    sub = a.country || '';
  } else if (a.country) {
    main = a.country;
    sub = '';
  } else if (r.name) {
    main = r.name;
    sub = r.display_name || '';
  } else {
    // Fallback parsing — combine numeric first segment with second
    const parts = (r.display_name || '').split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2 && /^\d+[a-z]?$/i.test(parts[0])) {
      main = `${parts[0]} ${parts[1]}`;
      sub = parts.slice(2).join(', ');
    } else {
      main = parts[0] || '';
      sub = parts.slice(1).join(', ');
    }
  }
  // For the input value, use a friendlier "main, city, country" rather than the entire display_name.
  const value = sub ? `${main}, ${sub.split(',').slice(-2).join(',').trim()}` : main;
  return { main, sub, value };
}

function attachAddressAutocomplete(inputEl, dropdownEl, onSelect) {
  let timer = null;
  let activeIdx = -1;
  let suggestions = [];

  function render() {
    if (suggestions.length === 0) {
      dropdownEl.innerHTML = '<div class="autocomplete-empty">No matches</div>';
      return;
    }
    dropdownEl.innerHTML = '';
    suggestions.forEach((r, i) => {
      const { main, sub } = formatNominatimSuggestion(r);
      const div = document.createElement('div');
      div.className = 'autocomplete-item' + (i === activeIdx ? ' active' : '');
      div.innerHTML = `<span class="ac-main">${escapeHtml(main)}</span>${sub ? `<span class="ac-sub">${escapeHtml(sub)}</span>` : ''}`;
      div.addEventListener('mousedown', (e) => {
        e.preventDefault();
        pick(i);
      });
      div.addEventListener('mouseenter', () => {
        activeIdx = i;
        dropdownEl.querySelectorAll('.autocomplete-item.active').forEach(x => x.classList.remove('active'));
        div.classList.add('active');
      });
      dropdownEl.appendChild(div);
    });
  }

  function pick(i) {
    const r = suggestions[i];
    if (!r) return;
    const fmt = formatNominatimSuggestion(r);
    inputEl.value = fmt.value || r.display_name;
    dropdownEl.hidden = true;
    onSelect({ lon: parseFloat(r.lon), lat: parseFloat(r.lat), label: fmt.value || r.display_name });
  }

  inputEl.addEventListener('input', (e) => {
    clearTimeout(timer);
    onSelect(null); // clear cached coords
    const q = e.target.value.trim();
    if (q.length < 3) {
      dropdownEl.hidden = true;
      return;
    }
    dropdownEl.innerHTML = '<div class="autocomplete-loading">Searching…</div>';
    dropdownEl.hidden = false;
    timer = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error('search failed');
        suggestions = await res.json();
        activeIdx = 0;
        render();
      } catch (err) {
        dropdownEl.innerHTML = '<div class="autocomplete-empty">Search failed</div>';
      }
    }, 350);
  });

  inputEl.addEventListener('keydown', (e) => {
    if (dropdownEl.hidden) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(suggestions.length - 1, activeIdx + 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(0, activeIdx - 1); render(); }
    else if (e.key === 'Enter') {
      if (suggestions.length > 0) { e.preventDefault(); pick(activeIdx); }
    }
    else if (e.key === 'Escape') { dropdownEl.hidden = true; }
  });

  inputEl.addEventListener('blur', () => setTimeout(() => { dropdownEl.hidden = true; }, 200));
  inputEl.addEventListener('focus', () => {
    if (dropdownEl.children.length > 0 && suggestions.length > 0) dropdownEl.hidden = false;
  });
}

async function loadGasStationsAlongRoute(routeLatLngs) {
  // Compute bounding box
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  for (const [lat, lng] of routeLatLngs) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  const padLat = Math.max(0.01, (maxLat - minLat) * 0.04);
  const padLng = Math.max(0.01, (maxLng - minLng) * 0.04);
  const bbox = `${minLat - padLat},${minLng - padLng},${maxLat + padLat},${maxLng + padLng}`;

  const query = `[out:json][timeout:25];node["amenity"="fuel"](${bbox});out body 200;`;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!res.ok) throw new Error('Overpass error');
  const data = await res.json();
  let stations = data.elements || [];
  // Filter to within ~2.5km of route polyline
  stations = stations.filter(s => isNearRoute(s.lat, s.lon, routeLatLngs, 2.5));
  // Limit
  stations = stations.slice(0, 60);

  if (map.stationLayer) map.instance.removeLayer(map.stationLayer);
  map.stationLayer = L.layerGroup().addTo(map.instance);

  for (const s of stations) {
    const marker = L.circleMarker([s.lat, s.lon], {
      radius: 6,
      color: '#22C55E',
      fillColor: '#22C55E',
      weight: 2,
      fillOpacity: 0.85,
    }).bindPopup(() => stationPopupHtml(s));
    marker.addTo(map.stationLayer);
  }
  return stations.length;
}

function stationPopupHtml(station) {
  const name = station.tags?.name || station.tags?.brand || 'Fuel station';
  const brand = station.tags?.brand || station.tags?.operator || '';
  const sym = getCountry(state.country).symbol;
  const us = UNIT_SYSTEMS[state.unitSystem];
  const street = station.tags?.['addr:street'] || '';
  const city = station.tags?.['addr:city'] || '';
  const houseNum = station.tags?.['addr:housenumber'] || '';
  const stateProv = station.tags?.['addr:state'] || station.tags?.['addr:province'] || '';
  const country = station.tags?.['addr:country'] || '';
  // Most-specific search string GasBuddy will accept. They don't expose deep links
  // to individual station pages, so this lands the user on a list with this station
  // typically in position 1.
  const addressParts = [houseNum, street, city, stateProv, country].filter(Boolean).join(' ').trim();
  const queryStr = addressParts ? `${name} ${addressParts}` : `${name} ${station.lat.toFixed(4)},${station.lon.toFixed(4)}`;
  const gbUrl = `https://www.gasbuddy.com/home?search=${encodeURIComponent(queryStr)}`;
  // Saved local report?
  const saved = getStationPriceReport(station.id);
  const savedHtml = saved
    ? `<div class="popup-saved" data-saved-price="${saved.price}">
         <div class="popup-saved-row">
           <span class="popup-saved-label">⛽ Last reported here</span>
           <span class="popup-saved-time">${escapeHtml(relativeAge(saved.timestamp))}</span>
         </div>
         <div class="popup-saved-row">
           <span class="popup-saved-value">${escapeHtml(saved.sym)}${saved.price.toFixed(3)}/${escapeHtml(saved.volLabel)}</span>
           <button class="popup-saved-use" type="button" data-use-saved>Use again</button>
         </div>
       </div>`
    : '';
  return `<div class="station-popup" data-station-id="${station.id}" data-station-lat="${station.lat}" data-station-lon="${station.lon}" data-station-name="${escapeHtml(name)}">
    <strong>${escapeHtml(name)}</strong>
    ${brand && brand.toLowerCase() !== name.toLowerCase() ? `<div class="popup-sub">${escapeHtml(brand)}</div>` : ''}
    ${savedHtml}
    <a href="${gbUrl}" target="_blank" rel="noopener noreferrer" class="popup-gb-primary" title="Open this station on GasBuddy in a new tab">
      ⛽ Check GasBuddy for live price
    </a>
    <div class="popup-input">
      <label>${saved ? 'Update price' : 'Saw a price? Apply it'}</label>
      <div class="popup-price-row">
        <span>${escapeHtml(sym)}</span>
        <input type="number" step="0.001" min="0" placeholder="0.000" data-station-price>
        <span>/${escapeHtml(us.volLabel)}</span>
      </div>
      <button class="popup-apply" type="button" data-apply-price>Use this price</button>
    </div>
    <button class="popup-stop" type="button" data-add-stop>➕ Add as fuel stop</button>
  </div>`;
}

function bindStationPopupHandlers() {
  if (!map.instance) return;
  map.instance.on('popupopen', (e) => {
    const node = e.popup._contentNode;
    if (!node) return;
    const popupRoot = node.querySelector('.station-popup');
    const inp = node.querySelector('[data-station-price]');
    const applyBtn = node.querySelector('[data-apply-price]');
    const stopBtn = node.querySelector('[data-add-stop]');
    if (inp) {
      setTimeout(() => inp.focus(), 50);
      inp.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' && applyBtn) { ev.preventDefault(); applyBtn.click(); }
      });
    }
    const applyPrice = (v, label) => {
      const country = getCountry(state.country);
      const us = UNIT_SYSTEMS[state.unitSystem];
      state.price = v;
      state.priceTouched = true;
      $('priceInput').value = v.toFixed(priceDigits(country.currency));
      $('priceHint').textContent = 'Custom price (from station)';
      update();
      // Persist to per-station memory
      const stationId = popupRoot?.dataset.stationId;
      if (stationId) saveStationPriceReport(stationId, v, country.currency, us.volLabel, country.symbol);
      const stationName = popupRoot?.dataset.stationName || 'station';
      showToast(`${label || 'Price'} ${country.symbol}${v} applied from ${stationName}`);
      map.instance.closePopup();
    };
    if (applyBtn && inp) {
      applyBtn.addEventListener('click', () => {
        const v = parseFloat(inp.value);
        if (!isFinite(v) || v <= 0) {
          inp.style.borderColor = 'var(--red)';
          return;
        }
        applyPrice(v, 'New price');
      });
    }
    // Re-use the saved price
    const useSavedBtn = node.querySelector('[data-use-saved]');
    if (useSavedBtn && popupRoot) {
      useSavedBtn.addEventListener('click', () => {
        const saved = popupRoot.querySelector('[data-saved-price]');
        const v = parseFloat(saved?.dataset.savedPrice);
        if (!isFinite(v) || v <= 0) return;
        applyPrice(v, 'Saved price');
      });
    }
    if (stopBtn && popupRoot) {
      stopBtn.addEventListener('click', () => {
        const lat = parseFloat(popupRoot.dataset.stationLat);
        const lon = parseFloat(popupRoot.dataset.stationLon);
        const label = popupRoot.dataset.stationName || 'Fuel station';
        if (!isFinite(lat) || !isFinite(lon)) return;
        map.stops.push({ lat, lon, label });
        renderStops();
        showToast(`Added ${label} as fuel stop`);
        map.instance.closePopup();
        if (map.origin && map.dest) handleDistanceLookup();
      });
    }
  });
}

function toggleMapClickMode() {
  map.clickMode = !map.clickMode;
  const btn = $('mapClickModeBtn');
  const lbl = $('mapClickModeLabel');
  btn.setAttribute('aria-pressed', map.clickMode ? 'true' : 'false');
  lbl.textContent = map.clickMode ? 'Click map…' : 'Map my own route';
  if (map.instance) {
    map.instance.getContainer().style.cursor = map.clickMode ? 'crosshair' : '';
  }
  if (map.clickMode) {
    const next = !map.origin ? 'start (A)' : !map.dest ? 'destination (B)' : 'a fuel stop';
    showToast(`Click the map to set ${next}. Click again to add the next point.`);
  }
}

async function suggestFuelStops() {
  if (!map.routes.length || !map.routes[map.activeRoute]) {
    showToast('Calculate a route first', 'error'); return;
  }
  if (!state.tankSize || state.tankSize <= 0) {
    showToast('Set your tank size in Trip extras first', 'error'); return;
  }
  const baseL = effectiveL100km(state.pickedVehicle, state.customEff, state.vehicleMode, state.cityMixPct);
  const adjL = applyAdjustments(baseL, state.drivingStyle, state.conditions);
  if (!adjL) { showToast('Pick a vehicle or enter custom efficiency first', 'error'); return; }

  // Convert tank size to litres for math
  const us = UNIT_SYSTEMS[state.unitSystem];
  const tankL = toLitre(state.tankSize, us.volume);
  const tankRangeKm = (tankL / adjL) * 100;
  const interval = tankRangeKm * 0.7; // 70% safety buffer
  const totalKm = map.routes[map.activeRoute].distance / 1000;
  if (totalKm < interval) {
    showToast(`Route is shorter than ${Math.round(interval)} km — no fuel stops needed`);
    return;
  }

  // Walk the route geometry, find target points
  const coords = map.routes[map.activeRoute].coords; // [lon, lat][]
  const targets = [];
  let cumKm = 0;
  let nextTarget = interval;
  for (let i = 1; i < coords.length; i++) {
    const seg = haversineKm(coords[i - 1][1], coords[i - 1][0], coords[i][1], coords[i][0]);
    cumKm += seg;
    while (cumKm >= nextTarget && nextTarget < totalKm - interval / 2) {
      targets.push({ lat: coords[i][1], lon: coords[i][0] });
      nextTarget += interval;
    }
  }
  if (targets.length === 0) { showToast('No fuel stops needed for this distance'); return; }

  showToast(`Searching for ${targets.length} fuel stop${targets.length > 1 ? 's' : ''}…`);

  // Find nearest gas station to each target
  const found = [];
  for (const t of targets) {
    try {
      const query = `[out:json][timeout:25];node["amenity"="fuel"](around:6000,${t.lat},${t.lon});out body 5;`;
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      if (!res.ok) continue;
      const data = await res.json();
      const stations = data.elements || [];
      if (stations.length === 0) continue;
      // Pick closest to target
      let nearest = stations[0];
      let nearestD = haversineKm(nearest.lat, nearest.lon, t.lat, t.lon);
      for (const s of stations) {
        const d = haversineKm(s.lat, s.lon, t.lat, t.lon);
        if (d < nearestD) { nearest = s; nearestD = d; }
      }
      const name = nearest.tags?.name || nearest.tags?.brand || 'Fuel station';
      // Skip if too close to an existing stop (avoid dupes)
      const dup = map.stops.find(st =>
        st.lat != null && haversineKm(st.lat, st.lon, nearest.lat, nearest.lon) < 1);
      if (dup) continue;
      found.push({ lat: nearest.lat, lon: nearest.lon, label: name });
    } catch (e) { /* skip */ }
  }
  if (found.length === 0) { showToast('No suitable gas stations found along route', 'error'); return; }

  // Insert in route order — sort by distance from origin along route
  found.sort((a, b) => {
    const dA = haversineKm(a.lat, a.lon, map.origin.lat, map.origin.lon);
    const dB = haversineKm(b.lat, b.lon, map.origin.lat, map.origin.lon);
    return dA - dB;
  });
  for (const s of found) map.stops.push(s);
  renderStops();
  showToast(`Added ${found.length} fuel stop${found.length > 1 ? 's' : ''}`);
  await handleDistanceLookup();
}

function isNearRoute(lat, lng, routeLatLngs, maxKm) {
  // Sample points along the route — full check is overkill for ~thousands of points.
  const step = Math.max(1, Math.floor(routeLatLngs.length / 250));
  for (let i = 0; i < routeLatLngs.length; i += step) {
    const [rlat, rlng] = routeLatLngs[i];
    if (haversineKm(lat, lng, rlat, rlng) <= maxKm) return true;
  }
  return false;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = String(s ?? '');
  return div.innerHTML;
}

/* =========================
   TOAST
   ========================= */
function showToast(text, type = 'success') {
  const wrap = $('toastContainer');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast' + (type === 'error' ? ' error' : '');
  el.textContent = text;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/* When unit system changes, convert input display values so they keep their meaning. */
function changeUnitSystem(newSys) {
  const oldSys = state.unitSystem;
  if (oldSys === newSys) return;
  const oldU = UNIT_SYSTEMS[oldSys];
  const newU = UNIT_SYSTEMS[newSys];

  // Distance: convert via km
  if (state.distance > 0) {
    const km = toKm(state.distance, oldU.distance);
    state.distance = parseFloat(fromKm(km, newU.distance).toFixed(1));
  }
  state.stops = state.stops.map(s => {
    if (!s) return s;
    const km = toKm(s, oldU.distance);
    return parseFloat(fromKm(km, newU.distance).toFixed(1));
  });
  // Custom efficiency: convert via L/100km
  if (state.customEff > 0) {
    const l = toL100km(state.customEff, oldU.efficiency);
    state.customEff = parseFloat(fromL100km(l, newU.efficiency).toFixed(2));
  }
  if (state.cmpCustomEff > 0) {
    const l = toL100km(state.cmpCustomEff, oldU.efficiency);
    state.cmpCustomEff = parseFloat(fromL100km(l, newU.efficiency).toFixed(2));
  }
  // Tank: convert via litres
  if (state.tankSize > 0) {
    const litres = toLitre(state.tankSize, oldU.volume);
    state.tankSize = parseFloat(fromLitre(litres, newU.volume).toFixed(2));
  }
  // Price: convert via $/L canonical
  if (state.price > 0) {
    const perL = priceDisplayToPerL(state.price, oldU.volume);
    const digits = priceDigits(getCountry(state.country).currency);
    state.price = parseFloat(pricePerLToDisplay(perL, newU.volume).toFixed(digits));
  }

  state.unitSystem = newSys;
  render(); update();
}

function applyDetected(det) {
  if (!det || !det.country) return;
  const known = COUNTRIES.find(c => c.code === det.country);
  state.country = known ? det.country : 'OTHER';
  // Match province for Canada
  if (state.country === 'CA' && det.region) {
    const region = det.region.length === 2 ? det.region : null;
    if (region && CA_PROVINCES.find(p => p.code === region)) state.region = region;
  }
  // Default unit system for that country (only if user hasn't already explicitly set one)
  state.unitSystem = getCountry(state.country).unit;
  state.priceTouched = false;
}

/* =========================
   INIT
   ========================= */
async function init() {
  const isFirstRun = !localStorage.getItem(LS_KEY);
  loadState();
  applyTheme(state.theme || 'dark');

  // Fire-and-forget: fetch fresh prices in the background. If it lands before/after
  // first paint doesn't matter — renderGasPrice() is re-run when it arrives.
  loadPrices();

  initCombos();      // build searchable dropdown instances
  attachListeners(); // wire up everything
  render();          // first paint with combo refs available

  initPickers('primary').catch(() => {});

  // Initialize map immediately so it's visible from the start.
  // Wrapped in try/catch — if Leaflet hasn't loaded for some reason, the page still works.
  try {
    ensureMap();
    setTimeout(() => map.instance && map.instance.invalidateSize(), 100);
  } catch (e) { /* map unavailable */ }

  const det = await detectLocation();
  if (det && det.country && isFirstRun) applyDetected(det);

  // Re-center map if detection gave us coords and there are no routes yet.
  if (det?.lat != null && map.instance && map.routes.length === 0) {
    map.instance.setView([det.lat, det.lng], 7);
  }

  render(); update();
}

document.addEventListener('DOMContentLoaded', init);
