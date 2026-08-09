import sharp from 'sharp';

export const getCloudinaryUploadOptions = (folderName = 'ff_products') => ({
  folder: folderName,
  transformation: [
    { width: 1200, height: 1200, crop: 'limit' },
    { quality: 'auto:good' },
    { fetch_format: 'webp' },
  ],
});

export const processImage = async (buffer) => {
  try {
    const processedBuffer = await sharp(buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();
    return processedBuffer;
  } catch (error) {
    console.error('Sharp processing error:', error);
    // fallback to original if sharp fails
    return buffer;
  }
};
