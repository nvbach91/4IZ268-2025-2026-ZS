// DOM element selections and helpers

import { formatDate } from './date.js';

export const elements = {
  app: document.getElementById('app'),
  form: document.getElementById('place-form'),
  nameInput: document.getElementById('place-name'),
  arrivalDateInput: document.getElementById('place-arrival'),
  departureDateInput: document.getElementById('place-departure'),
  descriptionInput: document.getElementById('place-description'),
  submitBtn: document.getElementById('submit-btn'),
  cancelBtn: document.getElementById('cancel-btn'),
  deleteListBtn: document.getElementById('delete-btn'),
  placesList: document.getElementById('places-list'),
  emptyState: document.getElementById('empty-state'),
  detailsSection: document.querySelector('.details-section'),
  details: {
    name: document.getElementById('detail-name'),
    arrival: document.getElementById('detail-arrival'),
    departure: document.getElementById('detail-departure'),
    notes: document.getElementById('detail-notes'),
  },
  weatherBtn: document.getElementById('weather-btn'),
  weatherResult: document.getElementById('weather-result'),
  importBtn: document.getElementById('import-btn'),
  exportBtn: document.getElementById('export-btn'),
  importInput: document.getElementById('import-input'),
  spinnerOverlay: document.getElementById('spinner-overlay'),
  errors: {
    name: document.getElementById('name-error'),
    arrivalDate: document.getElementById('arrival-error'),
    departureDate: document.getElementById('departure-error'),
    description: document.getElementById('description-error'),
  },
};

export const createPlaceElement = (place) => {
  const item = document.createElement('article');
  item.className = 'place-item';
  item.dataset.id = place.id;

  const content = document.createElement('div');
  content.className = 'place-item-content';
  const arrival = formatDate(place.arrivalDate);
  const departure = formatDate(place.departureDate);
  content.textContent = `${place.name} • ${arrival} → ${departure}`;

  const actions = document.createElement('div');
  actions.className = 'place-item-actions';

  const detailsBtn = document.createElement('button');
  detailsBtn.type = 'button';
  detailsBtn.className = 'btn-details';
  detailsBtn.textContent = 'Details';
  detailsBtn.dataset.action = 'details';

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'btn-edit-item';
  editBtn.textContent = 'Edit';
  editBtn.dataset.action = 'edit';

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'btn-edit-item';
  deleteBtn.textContent = 'Delete';
  deleteBtn.dataset.action = 'delete';

  actions.append(detailsBtn, editBtn, deleteBtn);
  item.append(content, actions);

  return item;
};

export const toggleSpinner = (visible) => {
  if (!elements.spinnerOverlay) return;
  elements.spinnerOverlay.style.display = visible ? 'flex' : 'none';
};

// DOM element selections
