export const validateContactForm = (form) => {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!form.name || !form.name.trim()) {
    errors.name = "Name is required";
  }
  if (!form.email || !form.email.trim()) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(form.email.trim())) {
    errors.email = "Please enter a valid email address";
  }
  if (!form.message || !form.message.trim()) {
    errors.message = "Message is required";
  } else if (form.message.trim().length > 2000) {
    errors.message = "Message cannot exceed 2000 characters";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
