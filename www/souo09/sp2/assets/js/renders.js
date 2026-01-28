// Rendering functions for UI components

import { elements, createPlaceElement } from './elements.js';
import { formatDate } from './date.js';

export const renderPlaces = (places) => {
  elements.placesList.innerHTML = '';

  if (!places.length) {
    elements.emptyState.style.display = 'block';
    return;
  }

  elements.emptyState.style.display = 'none';

  const fragment = document.createDocumentFragment();
  places
    .slice()
    .sort((a, b) => (a.arrivalDate || '').localeCompare(b.arrivalDate || ''))
    .forEach((place) => {
      const item = createPlaceElement(place);
      fragment.appendChild(item);
    });

  elements.placesList.appendChild(fragment);
};

export const renderDetails = (place) => {
  if (!elements.detailsSection) {
    return;
  }

  if (!place) {
    elements.detailsSection.style.display = 'none';
    elements.details.name.textContent = '-';
    elements.details.arrival.textContent = '-';
    elements.details.departure.textContent = '-';
    elements.details.notes.textContent = '-';
    elements.weatherResult.textContent = '*API Result Here*';
    return;
  }

  elements.detailsSection.style.display = 'block';

  elements.details.name.textContent = place.name;
  elements.details.arrival.textContent = formatDate(place.arrivalDate);
  elements.details.departure.textContent = formatDate(place.departureDate);
  elements.details.notes.textContent = place.description || '-';
  elements.weatherResult.textContent = '*API Result Here*';
};

export const fillFormForEdit = (place) => {
  elements.nameInput.value = place.name;
  elements.arrivalDateInput.value = place.arrivalDate || '';
  elements.departureDateInput.value = place.departureDate || '';
  elements.descriptionInput.value = place.description || '';
};

export const resetForm = () => {
  elements.form.reset();
};

export const setFormMode = (mode) => {
  if (mode === 'edit') {
    elements.submitBtn.textContent = 'Save';
    elements.cancelBtn.style.display = 'inline-block';
  } else {
    elements.submitBtn.textContent = 'Add';
    elements.cancelBtn.style.display = 'none';
  }
};

export const showValidationErrors = (errors) => {
  elements.errors.name.textContent = errors.name || '';
  elements.errors.arrivalDate.textContent = errors.arrivalDate || '';
  elements.errors.departureDate.textContent = errors.departureDate || '';
  elements.errors.description.textContent = errors.description || '';
};
