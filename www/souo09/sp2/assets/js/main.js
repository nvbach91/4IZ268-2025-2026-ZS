// Main application logic

import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.1';
import Swal from 'https://esm.sh/sweetalert2@11';
import { elements } from './elements.js';
import { loadPlaces, savePlaces, clearPlaces } from './storage.js';
import { renderPlaces, renderDetails, fillFormForEdit, resetForm, setFormMode, showValidationErrors } from './renders.js';
import { validatePlace, hasValidationErrors } from './validation.js';
import { fetchWeatherForPlace } from './weather.js';
import { searchPlaces, placeLabel } from './geocoding.js';

let places = [];
let selectedPlaceId = null;
let editingPlaceId = null;
let detailsForPlaceId = null;
let filterMode = 'all';

const getTodayString = () => new Date().toISOString().slice(0, 10);

const getFilteredPlaces = () => {
  const today = getTodayString();
  if (filterMode === 'past') {
    return places.filter((place) => (place.departureDate || '') < today);
  }
  if (filterMode === 'upcoming') {
    return places.filter((place) => (place.departureDate || '') >= today);
  }
  return places;
};

const setFilterButtonsActive = () => {
  if (!elements.placesFilter) return;
  elements.placesFilter.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === filterMode);
  });
};

const refreshPlacesList = () => {
  setFilterButtonsActive();
  renderPlaces(getFilteredPlaces(), { totalCount: places.length });
};

const findPlaceById = (id) => places.find((place) => place.id === id) || null;

let destinationSuggestionsTimeout = null;

const debounce = (fn, ms) => {
  let timeout = null;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
};

const showDestinationSuggestions = (results) => {
  const el = elements.destinationSuggestions;
  if (!el) return;
  el.innerHTML = '';
  if (!results.length) {
    el.hidden = true;
    return;
  }
  results.forEach((result, index) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'destination-suggestion-item';
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', 'false');
    item.textContent = placeLabel(result);
    item.dataset.index = String(index);
    item.addEventListener('click', (e) => {
      e.preventDefault();
      if (elements.nameInput) elements.nameInput.value = placeLabel(result);
      el.hidden = true;
      el.innerHTML = '';
    });
    el.appendChild(item);
  });
  el.hidden = false;
};

const hideDestinationSuggestions = () => {
  const el = elements.destinationSuggestions;
  if (el) {
    el.hidden = true;
    el.innerHTML = '';
  }
};

const fetchDestinationSuggestions = async (query) => {
  const trimmed = (query || '').trim();
  if (trimmed.length < 2) {
    hideDestinationSuggestions();
    return;
  }
  try {
    const results = await searchPlaces(trimmed, { count: 10 });
    showDestinationSuggestions(results);
  } catch {
    hideDestinationSuggestions();
  }
};

const initDestinationAutocomplete = () => {
  if (!elements.nameInput || !elements.destinationSuggestions) return;
  const debouncedFetch = debounce(fetchDestinationSuggestions, 300);
  elements.nameInput.addEventListener('input', () => debouncedFetch(elements.nameInput.value));
  elements.nameInput.addEventListener('focus', () => {
    const v = (elements.nameInput.value || '').trim();
    if (v.length >= 2) debouncedFetch(v);
  });
  elements.nameInput.addEventListener('blur', () => {
    destinationSuggestionsTimeout = setTimeout(hideDestinationSuggestions, 150);
  });
  elements.destinationSuggestions.addEventListener('mousedown', (e) => {
    e.preventDefault();
    clearTimeout(destinationSuggestionsTimeout);
  });
};

const generateId = () => {
  // Used uuid library for generating unique IDs
  // UUID is imported as ES module from CDN
  return uuidv4();
};

const getFormValues = () => ({
  name: elements.nameInput.value,
  arrivalDate: elements.arrivalDateInput.value,
  departureDate: elements.departureDateInput.value,
  description: elements.descriptionInput.value,
});

const handleFormSubmit = (event) => {
  event.preventDefault();

  const values = getFormValues();
  const errors = validatePlace(values);

  showValidationErrors(errors);

  if (hasValidationErrors(errors)) {
    return;
  }

  const trimmed = {
    name: values.name.trim(),
    arrivalDate: values.arrivalDate,
    departureDate: values.departureDate,
    description: values.description.trim(),
  };

  if (editingPlaceId) {
    places = places.map((place) =>
      place.id === editingPlaceId ? { ...place, ...trimmed } : place,
    );

    const updated = findPlaceById(editingPlaceId);
    renderDetails(updated);
  } else {
    const newPlace = {
      id: generateId(),
      ...trimmed,
    };
    places = [...places, newPlace];
  }

  savePlaces(places);
  refreshPlacesList();

  resetForm();
  hideDestinationSuggestions();
  setFormMode('create');
  editingPlaceId = null;
};

const startEditPlace = (id) => {
  const place = findPlaceById(id);
  if (!place) return;

  editingPlaceId = id;
  fillFormForEdit(place);
  setFormMode('edit');
};

const cancelEdit = () => {
  editingPlaceId = null;
  resetForm();
  hideDestinationSuggestions();
  setFormMode('create');
};

const deletePlace = async (id) => {
  const place = findPlaceById(id);
  if (!place) return;

  const { isConfirmed } = await Swal.fire({
    title: 'Delete destination?',
    text: `Do you really want to delete "${place.name}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc2626',
  });
  if (!isConfirmed) return;

  places = places.filter((item) => item.id !== id);
  savePlaces(places);
  refreshPlacesList();

  if (selectedPlaceId === id) {
    selectedPlaceId = null;
    renderDetails(null);
  }
};

const handlePlacesClick = async (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const parentItem = button.closest('.place-item');
  if (!parentItem) return;

  const id = parentItem.dataset.id;
  const action = button.dataset.action;

  if (!id || !action) return;

  if (action === 'details') {
    // Toggle dropdown-style details panel under the clicked item
    if (detailsForPlaceId === id) {
      detailsForPlaceId = null;
      selectedPlaceId = null;
      renderDetails(null);
      return;
    }

    const place = findPlaceById(id);
    if (!place) {
      return;
    }

    detailsForPlaceId = id;
    selectedPlaceId = id;

    if (elements.detailsSection) {
      parentItem.insertAdjacentElement('afterend', elements.detailsSection);
    }

    renderDetails(place);
    fetchWeatherForPlace(place.name, place.arrivalDate); // ISSUE #1 - FIX
  } else if (action === 'edit') {
    startEditPlace(id);
  } else if (action === 'delete') {
    await deletePlace(id);
  }
};

const deleteAllPlaces = async () => {
  if (!places.length) return;

  const { isConfirmed } = await Swal.fire({
    title: 'Delete all destinations?',
    text: 'Do you really want to delete all destinations? This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete all',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc2626',
  });
  if (!isConfirmed) return;

  places = [];
  selectedPlaceId = null;
  detailsForPlaceId = null;
  editingPlaceId = null;
  clearPlaces();
  refreshPlacesList();
  renderDetails(null);
  resetForm();
  setFormMode('create');
};

const handleFilterClick = (event) => {
  const btn = event.target.closest('.filter-btn');
  if (!btn || !btn.dataset.filter) return;
  filterMode = btn.dataset.filter;
  refreshPlacesList();
};

const handleExport = () => {
  const dataStr = JSON.stringify(places, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'trip-planner-export.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/** Content key for deduplication: same name, arrival, departure, notes = same trip. */
const placeContentKey = (place) =>
  `${(place.name || '').trim()}|${place.arrivalDate || ''}|${place.departureDate || ''}|${(place.description || '').trim()}`;

/** Removes duplicate trips by content; keeps first occurrence. */
const deduplicateByContent = (placeList) => {
  const seen = new Set();
  return placeList.filter((place) => {
    const key = placeContentKey(place);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/** Ensures every place has a unique id; reassigns new UUIDs only when duplicates are found. */
const ensureUniquePlaceIds = (placeList) => {
  const ids = new Set(placeList.map((p) => p.id));
  if (ids.size === placeList.length) {
    return placeList;
  }
  const usedIds = new Set();
  return placeList.map((place) => {
    let id = place.id;
    if (usedIds.has(id)) {
      id = generateId();
    }
    usedIds.add(id);
    return { ...place, id };
  });
};

const isValidImportedPlace = (place) => {
  if (typeof place !== 'object' || place === null) {
    return false;
  }

  if (typeof place.id !== 'string' || typeof place.name !== 'string') {
    return false;
  }

  return (
    typeof place.arrivalDate === 'string' &&
    typeof place.departureDate === 'string' &&
    typeof place.description === 'string'
  );
};

const handleImportFileChange = (event) => {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (loadEvent) => {
    try {
      const parsed = JSON.parse(loadEvent.target.result);
      if (!Array.isArray(parsed) || !parsed.every(isValidImportedPlace)) {
        console.error('Invalid import format');
        return;
      }
      places = ensureUniquePlaceIds(deduplicateByContent(parsed));
      savePlaces(places);
      refreshPlacesList();
      renderDetails(null);
      resetForm();
      setFormMode('create');
    } catch (error) {
      console.error('Failed to import JSON', error);
    } finally {
      elements.importInput.value = '';
    }
  };

  reader.readAsText(file);
};

const handleImport = () => {
  elements.importInput.click();
};

const init = () => {
  places = loadPlaces();
  refreshPlacesList();
  renderDetails(null);
  setFormMode('create');

  initDestinationAutocomplete();

  elements.form.addEventListener('submit', handleFormSubmit);
  elements.cancelBtn.addEventListener('click', cancelEdit);
  elements.placesFilter?.addEventListener('click', handleFilterClick);
  elements.placesList.addEventListener('click', handlePlacesClick);
  elements.deleteListBtn.addEventListener('click', deleteAllPlaces);
  elements.exportBtn.addEventListener('click', handleExport);
  elements.importBtn.addEventListener('click', handleImport);
  elements.importInput.addEventListener('change', handleImportFileChange);
};

document.addEventListener('DOMContentLoaded', init);
