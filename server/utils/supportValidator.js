const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateSupportMessage = (data) => {
  const { name, email, message } = data;

  if (!name || !name.trim()) {
    return { valid: false, message: "Name is required" };
  }

  if (!email || !email.trim()) {
    return { valid: false, message: "Email is required" };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return { valid: false, message: "Please provide a valid email address" };
  }

  if (!message || !message.trim()) {
    return { valid: false, message: "Message is required" };
  }

  if (message.trim().length > 2000) {
    return { valid: false, message: "Message cannot exceed 2000 characters" };
  }

  return { valid: true };
};
