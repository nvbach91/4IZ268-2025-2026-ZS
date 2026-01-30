// Form validation using validator.js

const trimValue = (value) => value.trim();

export const validatePlace = ({ name, arrivalDate, departureDate, description }) => {
  const errors = {
    name: '',
    arrivalDate: '',
    departureDate: '',
    description: '',
  };

  const trimmedName = trimValue(name);
  const trimmedDescription = trimValue(description);

  if (validator.isEmpty(trimmedName)) {
    errors.name = 'Destination is required.';
  } else if (!validator.isLength(trimmedName, { max: 80 })) {
    errors.name = 'Destination must be at most 80 characters.';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let arrivalDateObj = null;
  let departureDateObj = null;

  if (validator.isEmpty(arrivalDate || '')) {
    errors.arrivalDate = 'Arrival date is required.';
  } else {
    arrivalDateObj = new Date(arrivalDate);
    if (Number.isNaN(arrivalDateObj.getTime())) {
      errors.arrivalDate = 'Arrival date is not valid.';
    }
  }

  if (validator.isEmpty(departureDate || '')) {
    errors.departureDate = 'Departure date is required.';
  } else {
    departureDateObj = new Date(departureDate);
    if (Number.isNaN(departureDateObj.getTime())) {
      errors.departureDate = 'Departure date is not valid.';
    }
  }

  if (arrivalDateObj && departureDateObj && departureDateObj < arrivalDateObj) {
    errors.departureDate = 'Departure date cannot be before arrival date.';
  }

  if (!validator.isEmpty(trimmedDescription) && !validator.isLength(trimmedDescription, { max: 500 })) {
    errors.description = 'Notes must be at most 500 characters.';
  }

  return errors;
};

export const hasValidationErrors = (errors) =>
  Boolean(errors.name || errors.arrivalDate || errors.departureDate || errors.description);

