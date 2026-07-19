export const getCloudinaryUploadOptions = (folderName = "ff_products") => ({
  folder: folderName,
  transformation: [
    { width: 800, height: 800, crop: "limit" },
    { quality: "auto:good" },
    { fetch_format: "webp" }
  ]
});
