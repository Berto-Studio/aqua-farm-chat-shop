
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
  image_url?: string;
  rating?: number;
}

export interface AddProductResponse {
  success: boolean;
  data?: any;
  message: string;
  status: number;
}

export default async function AddProduct(productData: AddProductRequest): Promise<AddProductResponse> {
  try {
    const requestBody = {
      title: productData.title,
      description: productData.description,
      price: productData.price,
      quantity: productData.quantity,
      type_id: productData.type_id,
      weight_per_unit: productData.weight_per_unit || 1.0,
      is_live: productData.is_live || false,
      is_fresh: productData.is_fresh !== undefined ? productData.is_fresh : true,
      image_url: productData.image_url || "/products/placeholder.jpg",
      rating: productData.rating || 4.0,
      discount_percentage: productData.discount_percentage || null,
      animal_stage: productData.animal_stage || null,
    };

    console.log("Sending JSON data to API:", requestBody);
    
    const response = await apiRequest<any>("products/", "POST", requestBody, false);
    
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
