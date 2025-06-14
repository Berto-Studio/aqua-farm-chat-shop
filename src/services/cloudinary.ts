
interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default'); // You may need to create an unsigned upload preset in Cloudinary
  
  // Using the upload URL for your cloud name (removed extra space)
  const cloudName = 'dquhjbcvq';
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    console.log('Uploading image to Cloudinary...');
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    console.log('Upload URL:', uploadUrl);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    console.log('Cloudinary response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary error response:', errorText);
      
      if (response.status === 400) {
        throw new Error(`Upload failed: Invalid upload preset or configuration. Please check your Cloudinary settings. Error: ${errorText}`);
      }
      
      throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
    }

    const data: CloudinaryUploadResponse = await response.json();
    console.log('Image uploaded successfully:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload image to Cloudinary');
  }
};
