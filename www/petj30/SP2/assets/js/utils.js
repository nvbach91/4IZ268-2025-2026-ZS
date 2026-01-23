// Pomocné funkce

// Unikátní ID
export function uid(prefix = '') {
  const rnd = Math.floor((1 + Math.random()) * 0x100000).toString(16).substring(1);
  return `${prefix}${Date.now().toString(36)}${rnd}`;
}

// Debounce
export function debounce(fn, wait = 300) {
  let timeout = null;
  return function (...args) {
    const ctx = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(ctx, args), wait);
  };
}

// Formátování data
export function formatISODate(iso) {
  if (!iso) return '';
  // Podporujeme i čistý YYYY-MM-DD nebo plný ISO string
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}. ${mm}. ${yyyy}`;
}

/**
 * safeParseJSON(str, fallback)
 * Bezpečně parse JSON; při chybě vrátí fallback (nevyhazuje).
 */
export function safeParseJSON(str, fallback = null) {
  if (str === null || str === undefined || str === '') return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.warn('safeParseJSON: parse error', e);
    return fallback;
  }
}

/**
 * nowISO()
 * Rychlý helper pro aktuální ISO timestamp.
 */
export function nowISO() {
  return new Date().toISOString();
}
