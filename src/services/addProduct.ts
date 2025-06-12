
import { apiRequest } from "@/hooks/useClient";

export interface AddProductRequest {
  title: string;
  description: string;
  price: number;
  quantity: number;
  type_id: number;
  weight_per_unit?: number;
  is_live?: boolean;
  is_fresh?: boolean;
  animal_stage?: number;
  discount_percentage?: number;
  rating?: number;
  image: File;
}

export interface AddProductResponse {
  success: boolean;
  data?: any;
  message: string;
  status: number;
}

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default async function AddProduct(productData: AddProductRequest): Promise<AddProductResponse> {
  try {
    console.log("Starting to add product with image:", productData.image.name);
    
    // Convert image to base64
    const imageBase64 = await fileToBase64(productData.image);
    console.log("Image converted to base64, length:", imageBase64.length);
    
    // Prepare JSON payload with all possible properties
    const payload: {
      title: string;
      description: string;
      price: number;
      quantity: number;
      type_id: number;
      weight_per_unit: number;
      is_live: boolean;
      is_fresh: boolean;
      rating: number;
      image_base64: string;
      image_name: string;
      image_type: string;
      discount_percentage?: number;
      animal_stage?: number;
    } = {
      title: productData.title,
      description: productData.description,
      price: productData.price,
      quantity: productData.quantity,
      type_id: productData.type_id,
      weight_per_unit: productData.weight_per_unit || 1.0,
      is_live: productData.is_live || false,
      is_fresh: productData.is_fresh !== undefined ? productData.is_fresh : true,
      rating: productData.rating || 4.0,
      image_base64: imageBase64,
      image_name: productData.image.name,
      image_type: productData.image.type
    };

    // Add optional fields only if they exist
    if (productData.discount_percentage !== undefined && productData.discount_percentage !== null) {
      payload.discount_percentage = productData.discount_percentage;
    }
    
    if (productData.animal_stage !== undefined && productData.animal_stage !== null) {
      payload.animal_stage = productData.animal_stage;
    }

    console.log("Final payload being sent:", {
      ...payload,
      image_base64: `[BASE64 DATA - ${imageBase64.length} characters]`
    });
    
    // Send as JSON (isFormData = false)
    const response = await apiRequest<any>("products/", "POST", payload, false);
    
    console.log("API Response:", response);
    
    return { 
      success: true, 
      data: response, 
      message: "Product added successfully", 
      status: 201 
    };
  } catch (error) {
    console.error('Error adding product:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to add product", 
      status: 500 
    };
  }
}
