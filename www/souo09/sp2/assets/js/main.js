// Main application logic

import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.1';
import { elements } from './elements.js';
import { loadPlaces, savePlaces, clearPlaces } from './storage.js';
import { renderPlaces, renderDetails, fillFormForEdit, resetForm, setFormMode, showValidationErrors } from './renders.js';
import { validatePlace, hasValidationErrors } from './validation.js';
import { fetchWeatherForPlace } from './weather.js';

let places = [];
let selectedPlaceId = null;
let editingPlaceId = null;
let detailsForPlaceId = null;

const findPlaceById = (id) => places.find((place) => place.id === id) || null;

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
  renderPlaces(places);

  resetForm();
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
  setFormMode('create');
};

const deletePlace = (id) => {
  const place = findPlaceById(id);
  if (!place) return;

  places = places.filter((item) => item.id !== id);
  savePlaces(places);
  renderPlaces(places);

  if (selectedPlaceId === id) {
    selectedPlaceId = null;
    renderDetails(null);
  }
};

const handlePlacesClick = (event) => {
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
  } else if (action === 'edit') {
    startEditPlace(id);
  } else if (action === 'delete') {
    deletePlace(id);
  }
};

const deleteAllPlaces = () => {
  places = [];
  selectedPlaceId = null;
  detailsForPlaceId = null;
  editingPlaceId = null;
  clearPlaces();
  renderPlaces(places);
  renderDetails(null);
  resetForm();
  setFormMode('create');
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
      places = parsed;
      savePlaces(places);
      renderPlaces(places);
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

const handleWeatherClick = () => {
  const selected = findPlaceById(selectedPlaceId);
  if (!selected) {
    elements.weatherResult.textContent = 'Please choose a place from the list first.';
    return;
  }
  fetchWeatherForPlace(selected.name, selected.arrivalDate);
};

const init = () => {
  places = loadPlaces();
  renderPlaces(places);
  renderDetails(null);
  setFormMode('create');

  elements.form.addEventListener('submit', handleFormSubmit);
  elements.cancelBtn.addEventListener('click', cancelEdit);
  elements.placesList.addEventListener('click', handlePlacesClick);
  elements.deleteListBtn.addEventListener('click', deleteAllPlaces);
  elements.exportBtn.addEventListener('click', handleExport);
  elements.importBtn.addEventListener('click', handleImport);
  elements.importInput.addEventListener('change', handleImportFileChange);
  elements.weatherBtn.addEventListener('click', handleWeatherClick);
};

document.addEventListener('DOMContentLoaded', init);
