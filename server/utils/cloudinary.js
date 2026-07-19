import { v2 as cloudinary } from "cloudinary";

const uploadImage = async (image, options = {}) => {
  try {
    if (!image || !image.buffer) {
      throw new Error("No image buffer provided for upload.");
    }

    const buffer = image.buffer;

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || "ff",
          resource_type: options.resource_type || "auto",
          ...(options.transformation && { transformation: options.transformation }),
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            return reject(new Error("Image upload failed."));
          }
          resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    return uploadResult;
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

const deleteImage = async (public_id) => {
  try {
    if (!public_id) {
      throw new Error("Public ID is required for image deletion.");
    }

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result !== "ok") {
      throw new Error("Failed to delete image from Cloudinary.");
    }

    return result;
  } catch (error) {
    throw new Error(`Image delete failed: ${error.message}`);
  }
};

export { uploadImage, deleteImage };
