import { apiRequest } from "@/hooks/useClient";
import { Product } from "@/types/product";

interface ApiProduct {
  title: string;
  description: string;
  price: number;
  quantity: number;
  image_url: string;
  type_id: number;
  is_alive?: number;
  is_fresh?: number;
  farmer_id: string;
  created_at: string;
  updated_at: string;
  rating?: number; // Add rating field from API
  weight_per_unit?: number; // Add weight_per_unit field from API
  animal_stage?: string; // Optional field for live stock
  discount_percentage?: number; // Add discount_percentage field from API
}

interface ProductsResponse {
  data: ApiProduct[];
  message: string;
  status: number;
}

// Transform API product to our Product interface
const transformApiProduct = (apiProduct: ApiProduct): Product => {
  // Map type_id to category
  const getCategoryFromTypeId = (typeId: number): Product["category"] => {
    switch (typeId) {
      case 1:
        return "Live Stock";
      case 2:
        return "Vegetables";
      case 3:
        return "Fruits";
      default:
        return "Fish";
    }
  };

  // Determine age based on is_alive/is_fresh or default to mature
  const getAge = (apiProduct: ApiProduct): Product["age"] => {
    // For live stock, if is_alive is 1, consider it young, otherwise mature
    if (apiProduct.is_alive === 1) {
      return "young";
    }
    // For fresh products, if is_fresh is 1, consider it young, otherwise mature
    if (apiProduct.is_fresh === 1) {
      return "young";
    }
    return "mature";
  };

  return {
    name: apiProduct.title,
    description: apiProduct.description,
    price: apiProduct.price,
    category: getCategoryFromTypeId(apiProduct.type_id),
    age: getAge(apiProduct),
    image: apiProduct.image_url,
    stock: apiProduct.quantity,
    weightPerUnit: apiProduct.weight_per_unit
      ? `${apiProduct.weight_per_unit} unit`
      : "1 unit",
    rating: apiProduct.rating || 4.5, // Use actual rating from API, fallback to 4.5
    discount: apiProduct.discount_percentage || undefined,
    animal_stage: apiProduct.animal_stage
      ? parseInt(apiProduct.animal_stage, 10)
      : undefined, // Convert animal_stage to number if present
    isFeatured: (apiProduct.rating || 0) >= 4.8, // Set featured based on rating
  };
};

export default async function GetProducts(): Promise<{
  success: boolean;
  data: Product[];
  message: string;
  status: number;
}> {
  try {
    const response = await apiRequest<ProductsResponse>("products/", "GET");

    // Transform API products to our Product interface
    const transformedProducts = response.data?.map(transformApiProduct) || [];

    return {
      success: true,
      data: transformedProducts,
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
    const apiProduct: ApiProduct = {
      title: product.name,
      description: product.description,
      price: product.price,
      quantity: product.stock,
      image_url: product.image,
      type_id: (() => {
        switch (product.category) {
          case "Live Stock":
            return 1;
          case "Vegetables":
            return 2;
          case "Fruits":
            return 3;
          default:
            return 4; // Fish
        }
      })(),
      is_alive: product.age === "young" ? 1 : 0,
      is_fresh: product.age === "young" ? 1 : 0,
      farmer_id: "", // Set farmer_id as needed
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      rating: product.rating || undefined,
      weight_per_unit: parseFloat(product.weightPerUnit),
      animal_stage: product.animal_stage?.toString() || undefined,
      discount_percentage: product.discount || undefined,
    };

    const response = await apiRequest<ProductsResponse>(
      "products/",
      "POST",
      apiProduct
    );

    if (response.status !== 201) {
      return {
        success: false,
        message: response.message || "Failed to create product",
        status: response.status,
      };
    }

    const createdProduct = transformApiProduct(response.data[0]);

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

export async function UpdateProduct(
  product: Product
): Promise<{
  success: boolean;
  data?: Product;
  message: string;
  status: number;
}> {
  try {
    const apiProduct: ApiProduct = {
      title: product.name,
      description: product.description,
      price: product.price,
      quantity: product.stock,
      image_url: product.image,
      type_id: (() => {
        switch (product.category) {
          case "Live Stock":
            return 1;
          case "Vegetables":
            return 2;
          case "Fruits":
            return 3;
          default:
            return 4; // Fish
        }
      })(),
      is_alive: product.age === "young" ? 1 : 0,
      is_fresh: product.age === "young" ? 1 : 0,
      farmer_id: "", // Set farmer_id as needed
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      rating: product.rating || undefined,
      weight_per_unit: parseFloat(product.weightPerUnit),
      animal_stage: product.animal_stage?.toString() || undefined,
      discount_percentage: product.discount || undefined,
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
    const updatedProduct = transformApiProduct(response.data[0]);

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
