// Cloudinary Upload Service for React Native

const CLOUD_NAME = "dydkxcdcd";
const UPLOAD_PRESET = "ml_default";

export const uploadImage = async (localUri) => {
  if (!localUri) return null;

  try {
    const formData = new FormData();
    
    // Get file extension from URI
    const uriParts = localUri.split('.');
    const fileType = uriParts[uriParts.length - 1] || 'jpg';
    
    // React Native FormData file object structure
    formData.append('file', {
      uri: localUri,
      name: `upload_${Date.now()}.${fileType}`,
      type: `image/${fileType === 'png' ? 'png' : 'jpeg'}`,
    });
    
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Cloudinary upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary RN Upload Error:', error);
    throw error;
  }
};
