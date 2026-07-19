const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-().]{7,20}$/;

const validators = {
  name(value) {
    if (!value || !value.trim()) {
      return "Name is required";
    }
    if (value.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    if (value.trim().length > 100) {
      return "Name cannot exceed 100 characters";
    }
    return null;
  },

  email(value) {
    if (!value || !value.trim()) {
      return "Email is required";
    }
    if (!EMAIL_REGEX.test(value.trim())) {
      return "Please provide a valid email address";
    }
    return null;
  },

  phone(value) {
    if (value && value.trim() && !PHONE_REGEX.test(value.trim())) {
      return "Please provide a valid phone number";
    }
    return null;
  },

  message(value) {
    if (!value || !value.trim()) {
      return "Message is required";
    }
    if (value.trim().length < 10) {
      return "Message must be at least 10 characters";
    }
    if (value.trim().length > 2000) {
      return "Message cannot exceed 2000 characters";
    }
    return null;
  },
};

export const validateField = (field, value) => {
  const validator = validators[field];
  if (!validator) return null;
  return validator(value);
};

export const validateSupportMessage = (data) => {
  const errors = {};

  for (const [field, validator] of Object.entries(validators)) {
    const error = validator(data[field]);
    if (error) {
      errors[field] = error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
