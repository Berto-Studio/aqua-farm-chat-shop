
interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

interface CloudinaryDeleteResponse {
  result: string;
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

export const deleteImageFromCloudinary = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract public_id from the Cloudinary URL
    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) {
      console.log('No valid public ID found in URL:', imageUrl);
      return false;
    }

    console.log('Deleting image from Cloudinary, public_id:', publicId);

    const cloudName = 'dquhjbcvq';
    const deleteUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('upload_preset', 'ml_default');

    const response = await fetch(deleteUrl, {
      method: 'POST',
      body: formData,
    });

    console.log('Cloudinary delete response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary delete error response:', errorText);
      return false;
    }

    const data: CloudinaryDeleteResponse = await response.json();
    console.log('Image deletion result:', data.result);
    
    return data.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

// Helper function to extract public_id from Cloudinary URL
const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
    // or: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{format}
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return null;
    
    // Get the part after 'upload', skipping version if present
    let publicIdPart = urlParts[uploadIndex + 1];
    if (publicIdPart && publicIdPart.startsWith('v') && /^v\d+$/.test(publicIdPart)) {
      // Skip version number
      publicIdPart = urlParts[uploadIndex + 2];
    }
    
    if (!publicIdPart) return null;
    
    // Remove file extension
    const publicId = publicIdPart.split('.')[0];
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return null;
  }
};
