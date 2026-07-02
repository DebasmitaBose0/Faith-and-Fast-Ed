// Cloudinary optimization parameters config helper
export const getCloudinaryUploadOptions = (folderName = "ff_products") => {
  return {
    folder: folderName,
    transformation: [
      { width: 800, height: 800, crop: "limit" },
      { quality: "auto:good" },
      { fetch_format: "webp" }
    ]
  };
};
