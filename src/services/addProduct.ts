
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
  image: File; // Changed to File type
}

export interface AddProductResponse {
  success: boolean;
  data?: any;
  message: string;
  status: number;
}

export default async function AddProduct(productData: AddProductRequest): Promise<AddProductResponse> {
  try {
    // Create FormData to handle file upload
    const formData = new FormData();
    
    // Append all the product data
    formData.append('title', productData.title);
    formData.append('description', productData.description);
    formData.append('price', productData.price.toString());
    formData.append('quantity', productData.quantity.toString());
    formData.append('type_id', productData.type_id.toString());
    formData.append('weight_per_unit', (productData.weight_per_unit || 1.0).toString());
    formData.append('is_live', (productData.is_live || false).toString());
    formData.append('is_fresh', (productData.is_fresh !== undefined ? productData.is_fresh : true).toString());
    formData.append('rating', (productData.rating || 4.0).toString());
    
    // Append optional fields only if they exist
    if (productData.discount_percentage !== undefined && productData.discount_percentage !== null) {
      formData.append('discount_percentage', productData.discount_percentage.toString());
    }
    
    if (productData.animal_stage !== undefined && productData.animal_stage !== null) {
      formData.append('animal_stage', productData.animal_stage.toString());
    }
    
    // Append the image file
    formData.append('image', productData.image);

    console.log("Sending FormData to API");
    
    // Send FormData (isFormData = true)
    const response = await apiRequest<any>("products/", "POST", formData, true);
    
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
