import { apiRequest } from "@/hooks/useClient";
import { Product } from "@/types/product";

interface ProductsResponse {
  data: Product[];
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
    const apiProduct: Product = {
      title: product.title,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      image: product.image,
      category: product.category,
      animaltype: product.animaltype,
      is_alive: product.is_alive,
      is_fresh: product.is_fresh,
      rating: product.rating || undefined,
      weight_per_unit: product.weight_per_unit,
      animal_stage: product.animal_stage || undefined,
      discount_percentage: product.discount_percentage || undefined,
    };

    const response = await apiRequest<ProductsResponse>(
      "products/",
      "POST",
      apiProduct
    );

    if (response.status !== 201) {
      return {
        success: false,
        message: "Failed to create product",
        status: response.status,
      };
    }

    const createdProduct = response.data[0];

    return {
      success: true,
      data: createdProduct,
      message: "Product created successfully",
      status: response.status,
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
      animaltype: product.animaltype,
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
    const updatedProduct = response.data[0];

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
