
import { apiRequest } from "@/hooks/useClient";

export interface AddProductRequest {
  title: string;
  description: string;
  price: number;
  quantity: number;
  type_id: number;
  weight_per_unit?: number;
  is_alive?: number;
  is_fresh?: number;
  animal_stage?: string;
  discount_percentage?: number;
  image?: File;
}

export interface AddProductResponse {
  success: boolean;
  data?: any;
  message: string;
  status: number;
}

export default async function AddProduct(productData: AddProductRequest): Promise<AddProductResponse> {
  try {
    const formData = new FormData();
    
    // Add all product fields to FormData
    formData.append('title', productData.title);
    formData.append('description', productData.description);
    formData.append('price', productData.price.toString());
    formData.append('quantity', productData.quantity.toString());
    formData.append('type_id', productData.type_id.toString());
    
    if (productData.weight_per_unit !== undefined) {
      formData.append('weight_per_unit', productData.weight_per_unit.toString());
    }
    
    if (productData.is_alive !== undefined) {
      formData.append('is_alive', productData.is_alive.toString());
    }
    
    if (productData.is_fresh !== undefined) {
      formData.append('is_fresh', productData.is_fresh.toString());
    }
    
    if (productData.animal_stage) {
      formData.append('animal_stage', productData.animal_stage);
    }
    
    if (productData.discount_percentage !== undefined && productData.discount_percentage > 0) {
      formData.append('discount_percentage', productData.discount_percentage.toString());
    }
    
    if (productData.image) {
      formData.append('image', productData.image);
    }

    console.log("Sending FormData to API...");
    
    const response = await apiRequest<any>("products/", "POST", formData, true);
    
    console.log("API Response:", response);
    
    return { 
      success: true, 
      data: response, 
      message: "Product added successfully", 
      status: 200 
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
