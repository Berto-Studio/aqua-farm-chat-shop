
interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default'); // You may need to create an unsigned upload preset in Cloudinary
  
  // Using the upload URL for your cloud name
  const cloudName = 'dquhjbcvq';
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    console.log('Uploading image to Cloudinary...');
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data: CloudinaryUploadResponse = await response.json();
    console.log('Image uploaded successfully:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
};
