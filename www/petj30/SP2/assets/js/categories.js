// Správa kategorií

const CATEGORIES_KEY = 'sp2_categories';

// Výchozí kategorie
const DEFAULT_CATEGORIES = ['Práce', 'Studium', 'Domácnost'];

// Načte kategorie z localStorage
export function getCategories() {
  const raw = localStorage.getItem(CATEGORIES_KEY);
  if (!raw) {
    // Pokud neexistují, ulož výchozí
    saveCategories(DEFAULT_CATEGORIES);
    return [...DEFAULT_CATEGORIES];
  }
  try {
    const categories = JSON.parse(raw);
    return Array.isArray(categories) ? categories : [...DEFAULT_CATEGORIES];
  } catch (e) {
    console.warn('Chyba při načítání kategorií:', e);
    return [...DEFAULT_CATEGORIES];
  }
}

// Uloží kategorie do localStorage
export function saveCategories(categories) {
  if (!Array.isArray(categories)) {
    console.error('saveCategories očekává pole');
    return;
  }
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

// Přidá novou kategorii
export function addCategory(name) {
  const trimmed = String(name).trim();
  if (!trimmed) {
    throw new Error('Název kategorie nesmí být prázdný.');
  }
  
  const categories = getCategories();
  if (categories.includes(trimmed)) {
    throw new Error('Tato kategorie již existuje.');
  }
  
  categories.push(trimmed);
  saveCategories(categories);
  return trimmed;
}

// Odstraní kategorii
export function removeCategory(name) {
  const categories = getCategories();
  const filtered = categories.filter(c => c !== name);
  saveCategories(filtered);
}

// Přejmenuje kategorii
export function renameCategory(oldName, newName) {
  const trimmed = String(newName).trim();
  if (!trimmed) {
    throw new Error('Název kategorie nesmí být prázdný.');
  }
  
  const categories = getCategories();
  const idx = categories.indexOf(oldName);
  if (idx === -1) {
    throw new Error('Kategorie nenalezena.');
  }
  
  if (oldName !== trimmed && categories.includes(trimmed)) {
    throw new Error('Tato kategorie již existuje.');
  }
  
  categories[idx] = trimmed;
  saveCategories(categories);
  return trimmed;
}
