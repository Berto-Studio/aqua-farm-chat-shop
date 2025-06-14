
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

export async function GetProduct(id: string): Promise<{
  success: boolean;
  data?: Product;
  message: string;
  status: number;
}> {
  try {
    const response = await apiRequest<ProductResponse>(`products/${id}`, "GET");

    return {
      success: true,
      data: response.data,
      message: response.message || "Product retrieved successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch product",
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
    // Prepare product data with proper field mapping
    const productData = {
      title: product.title,
      description: product.description,
      price: Number(product.price),
      quantity: Number(product.quantity),
      category: product.category,
      image_url: product.image, // Send the Cloudinary URL as image_url
      weight_per_unit: Number(product.weight_per_unit),
      rating: product.rating || 4.0,
      discount_percentage: product.discount_percentage ? Number(product.discount_percentage) : undefined,
      animal_type: product.animal_type ? Number(product.animal_type) : undefined,
      animal_stage: product.animal_stage ? Number(product.animal_stage) : undefined,
      is_alive: product.category === "Live Stock" || product.category === "Fish",
      is_fresh: product.category === "Vegetables" || product.category === "Fruits",
    };

    console.log("Sending product data to backend:", productData);

    const response = await apiRequest<ProductResponse>(
      "products/",
      "POST",
      productData
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

export async function UpdateProduct(id: string, product: Partial<Product>): Promise<{
  success: boolean;
  data?: Product;
  message: string;
  status: number;
}> {
  try {
    // Check if we need to send as FormData (if image is a File/Blob)
    const hasImageFile = product.image && (product.image instanceof File || product.image instanceof Blob);
    
    if (hasImageFile) {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all product fields
      if (product.title) formData.append('title', product.title);
      if (product.description) formData.append('description', product.description);
      if (product.price !== undefined) formData.append('price', product.price.toString());
      if (product.quantity !== undefined) formData.append('quantity', product.quantity.toString());
      if (product.category) formData.append('category', product.category);
      if (product.weight_per_unit !== undefined) formData.append('weight_per_unit', product.weight_per_unit.toString());
      if (product.rating !== undefined) formData.append('rating', product.rating.toString());
      
      if (product.discount_percentage !== undefined) {
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
      } else if (product.category === "Vegetables" || product.category === "Fruits") {
        formData.append('is_fresh', 'true');
      }

      // Add image file
      if (product.image && (product.image instanceof File || product.image instanceof Blob)) {
        formData.append('image', product.image);
      }

      const response = await apiRequest<ProductResponse>(
        `products/${id}`,
        "PUT",
        formData,
        true // isFormData = true
      );

      return {
        success: true,
        data: response.data,
        message: response.message || "Product updated successfully",
        status: response.status || 200,
      };
    } else {
      // Send as JSON for non-file updates
      const apiProduct = {
        title: product.title,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        category: product.category,
        animal_type: product.animal_type,
        is_alive: product.is_alive,
        is_fresh: product.is_fresh,
        rating: product.rating,
        weight_per_unit: product.weight_per_unit,
        animal_stage: product.animal_stage,
        discount_percentage: product.discount_percentage,
      };

      const response = await apiRequest<ProductResponse>(
        `products/${id}`,
        "PUT",
        apiProduct
      );

      return {
        success: true,
        data: response.data,
        message: response.message || "Product updated successfully",
        status: response.status || 200,
      };
    }
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

export async function DeleteProduct(id: string): Promise<{
  success: boolean;
  message: string;
  status: number;
}> {
  try {
    const response = await apiRequest<{ message: string; status: number }>(
      `products/${id}`,
      "DELETE"
    );

    return {
      success: true,
      message: response.message || "Product deleted successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete product",
      status: 500,
    };
  }
}

export async function DeleteAllProducts(): Promise<{
  success: boolean;
  message: string;
  status: number;
}> {
  try {
    const response = await apiRequest<{ message: string; status: number }>(
      "products/",
      "DELETE"
    );

    return {
      success: true,
      message: response.message || "All products deleted successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error deleting all products:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete all products",
      status: 500,
    };
  }
}
