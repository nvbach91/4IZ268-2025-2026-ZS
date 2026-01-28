// Storage management for places (localStorage)

const STORAGE_KEY = 'tripPlannerPlaces';

export const loadPlaces = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (error) {
    console.error('Failed to load places from storage', error);
    return [];
  }
};

export const savePlaces = (places) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
  } catch (error) {
    console.error('Failed to save places to storage', error);
  }
};

export const clearPlaces = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear places from storage', error);
  }
};
