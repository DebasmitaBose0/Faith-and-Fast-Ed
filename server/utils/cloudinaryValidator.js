const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const maxFileSize = 5 * 1024 * 1024; // 5MB

export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, message: "No file provided" };
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return {
      valid: false,
      message: `Invalid file format. Allowed formats: JPEG, PNG, WEBP, GIF. Got ${file.mimetype}`,
    };
  }

  if (file.size > maxFileSize) {
    return {
      valid: false,
      message: `File size exceeds the 5MB limit. Got ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    };
  }

  return { valid: true };
};
