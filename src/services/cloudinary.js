/**
 * Cloudinary Image Upload Service
 * Note: For frontend-only apps, it's recommended to use Unsigned Uploads.
 * You need to enable "Unsigned Uploads" in your Cloudinary Dashboard Settings > Upload.
 * And create an upload preset (e.g., 'profile_uploads').
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
console.log("Cloud Name:", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
console.log("Preset:", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};
