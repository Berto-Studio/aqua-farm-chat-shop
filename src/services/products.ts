import { apiRequest } from "@/hooks/useClient";
import { Product } from "@/types/product";

interface ProductsResponse {
  data: Product[];
  message: string;
  status: number;
}

interface ProductResponse {
  data: Product;
  message: string;
  status: number;
}

export default async function GetProducts(): Promise<{
  success: boolean;
  data: Product[];
  message: string;
  status: number;
}> {
  try {
    const response = await apiRequest<ProductsResponse>("products/", "GET");

    return {
      success: true,
      data: response?.data,
      message: response.message || "Success",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      data: [],
      message:
        error instanceof Error ? error.message : "Failed to fetch products",
      status: 500,
    };
  }
}

export async function CreateProduct(product: Product): Promise<{
  success: boolean;
  data?: Product;
  message: string;
  status: number;
}> {
  try {
    // Create FormData to send file
    const formData = new FormData();
    
    // Add all product fields
    formData.append('title', product.title);
    formData.append('description', product.description);
    formData.append('price', product.price.toString());
    formData.append('quantity', product.quantity.toString());
    formData.append('category', product.category);
    formData.append('weight_per_unit', product.weight_per_unit.toString());
    formData.append('rating', (product.rating || 4.0).toString());
    
    if (product.discount_percentage) {
      formData.append('discount_percentage', product.discount_percentage.toString());
    }

    // Add animal_type if provided
    if (product.animal_type !== undefined) {
      formData.append('animal_type', product.animal_type.toString());
    }

    // Handle livestock and fish specific fields
    if (product.category === "Live Stock" || product.category === "Fish") {
      formData.append('is_live', 'true');
      if (product.animal_stage !== undefined) {
        formData.append('animal_stage', product.animal_stage.toString());
      }
    } else {
      formData.append('is_fresh', 'true');
    }

    // Add image file - this is the crucial part
    if (product.image && (product.image instanceof File || product.image instanceof Blob)) {
      formData.append('image', product.image);
      console.log("Image file added to FormData:", {
        name: product.image instanceof File ? product.image.name : 'blob',
        size: product.image.size,
        type: product.image.type
      });
    } else {
      throw new Error("Image file is required");
    }

    console.log("FormData entries:");
    for (const [key, value] of formData.entries()) {
      console.log(key, value instanceof File ? `File: ${value.name}` : value);
    }

    const response = await apiRequest<ProductResponse>(
      "products/",
      "POST",
      formData,
      true // isFormData = true
    );

    return {
      success: true,
      data: response.data,
      message: response.message || "Product created successfully",
      status: response.status || 201,
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create product",
      status: 500,
    };
  }
}

export async function UpdateProduct(product: Product): Promise<{
  success: boolean;
  data?: Product;
  message: string;
  status: number;
}> {
  try {
    const apiProduct: Product = {
      title: product.title,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      image: product.image,
      category: product.category,
      animal_type: product.animal_type,
      is_alive: product.is_alive,
      is_fresh: product.is_fresh,
      rating: product.rating || undefined,
      weight_per_unit: product.weight_per_unit,
      animal_stage: product.animal_stage || undefined,
      discount_percentage: product.discount_percentage || undefined,
    };

    const response = await apiRequest<ProductResponse>(
      `products/${product.id}`,
      "PUT",
      apiProduct
    );
    if (response.status !== 200) {
      return {
        success: false,
        message: response.message || "Failed to update product",
        status: response.status,
      };
    }
    const updatedProduct = response.data;

    return {
      success: true,
      data: updatedProduct,
      message: "Product updated successfully",
      status: response.status,
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update product",
      status: 500,
    };
  }
}
