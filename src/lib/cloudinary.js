import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if credentials are provided
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a base64 or buffer image string to Cloudinary,
 * or safely falls back to returning the base64 URI for local dev.
 */
export async function uploadImage(fileData, folder = 'laundrymate') {
  if (!fileData) return null;

  if (isCloudinaryConfigured) {
    try {
      const uploadResult = await cloudinary.uploader.upload(fileData, {
        folder,
        resource_type: 'auto',
      });
      return uploadResult.secure_url;
    } catch (err) {
      console.warn('Cloudinary upload error, using local fallback:', err.message);
    }
  }

  // Safe development fallback: Return data URL or direct file reference
  return fileData;
}

export { isCloudinaryConfigured };
