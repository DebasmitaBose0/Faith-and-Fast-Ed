const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const maxFileSize = 5 * 1024 * 1024; // 5MB

export const validateImageFile = (file) => {
  if (!file) return { valid: false, message: "No file provided" };
  if (!allowedMimeTypes.includes(file.mimetype))
    return { valid: false, message: "Invalid format. Allowed: JPEG, PNG, WEBP, GIF" };
  if (file.size > maxFileSize)
    return { valid: false, message: "File exceeds 5MB limit" };
  return { valid: true };
};
