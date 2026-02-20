import { apiRequest } from "@/hooks/useClient";
import { Product, ProductStatsResponse } from "@/types/product";
import { deleteImageFromCloudinary } from "./cloudinary";

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

export async function GetProduct(id: string | number): Promise<{
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
    const primaryImageUrl =
      product.image_urls?.[0] ||
      (typeof product.image === "string" ? product.image : undefined);

    // Prepare product data with proper field mapping
    const baseProductData = {
      title: product.title,
      description: product.description,
      price: Number(product.price),
      quantity: Number(product.quantity),
      category: product.category,
      image_url: primaryImageUrl,
      weight_per_unit: Number(product.weight_per_unit),
      rating: product.rating || 4.0,
      discount_percentage: product.discount_percentage
        ? Number(product.discount_percentage)
        : undefined,
      animal_type: product.animal_type
        ? Number(product.animal_type)
        : undefined,
      animal_stage: product.animal_stage
        ? Number(product.animal_stage)
        : undefined,
      is_alive:
        product.category === "Live Stock" || product.category === "Fish",
      is_fresh:
        product.category === "Vegetables" || product.category === "Fruits",
    };

    const hasExtendedMedia =
      Boolean(product.image_urls?.length) || Boolean(product.video_urls?.length);

    const extendedProductData = {
      ...baseProductData,
      ...(product.image_urls?.length ? { image_urls: product.image_urls } : {}),
      ...(product.video_urls?.length ? { video_urls: product.video_urls } : {}),
    };

    let response: ProductResponse;

    try {
      response = await apiRequest<ProductResponse>(
        "products/",
        "POST",
        extendedProductData
      );
    } catch (error) {
      if (!hasExtendedMedia) {
        throw error;
      }

      // Backward compatibility with APIs that only accept image_url.
      response = await apiRequest<ProductResponse>(
        "products/",
        "POST",
        baseProductData
      );
    }

    return {
      success: true,
      data: response.data,
      message: response.message || "Product created successfully",
      status: response.status || 201,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create product",
      status: 500,
    };
  }
}

export async function UpdateProduct(
  id: string | number,
  product: Partial<Product>
): Promise<{
  success: boolean;
  data?: Product;
  message: string;
  status: number;
}> {
  try {
    const primaryImageUrl =
      product.image_urls?.[0] ||
      product.image_url ||
      (typeof product.image === "string" ? product.image : undefined);

    const baseProductData = {
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
      image_url: primaryImageUrl,
    };

    const hasExtendedMedia =
      Boolean(product.image_urls?.length) || Boolean(product.video_urls?.length);

    const extendedProductData = {
      ...baseProductData,
      ...(product.image_urls?.length ? { image_urls: product.image_urls } : {}),
      ...(product.video_urls?.length ? { video_urls: product.video_urls } : {}),
    };

    let response: ProductResponse;

    try {
      response = await apiRequest<ProductResponse>(
        `products/${id}`,
        "PUT",
        extendedProductData
      );
    } catch (error) {
      if (!hasExtendedMedia) {
        throw error;
      }

      // Backward compatibility with APIs that only accept image_url.
      response = await apiRequest<ProductResponse>(
        `products/${id}`,
        "PUT",
        baseProductData
      );
    }

    return {
      success: true,
      data: response.data,
      message: response.message || "Product updated successfully",
      status: response.status || 200,
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

export async function DeleteProduct(id: string | number): Promise<{
  success: boolean;
  message: string;
  status: number;
}> {
  try {
    // First, get the product to retrieve image URLs
    const productResponse = await GetProduct(id);
    let imageUrls: string[] = [];

    if (productResponse.success && productResponse.data) {
      const product = productResponse.data;
      imageUrls = [
        ...(product.image_urls || []),
        ...(product.image_url ? [product.image_url] : []),
      ].filter((url, index, arr) => Boolean(url) && arr.indexOf(url) === index);
    }

    // Delete the product from the backend
    const response = await apiRequest<{ message: string; status: number }>(
      `products/${id}`,
      "DELETE"
    );

    // If product deletion was successful and there are images, delete them from Cloudinary
    if (imageUrls.length > 0) {
      console.log(
        `Attempting to delete ${imageUrls.length} product image(s) from Cloudinary`
      );
      await Promise.allSettled(
        imageUrls.map((imageUrl) => deleteImageFromCloudinary(imageUrl))
      );
    }

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
    // First, get all products to retrieve their image URLs
    const productsResponse = await GetProducts();
    const imageUrls: string[] = [];

    if (productsResponse.success && productsResponse.data) {
      productsResponse.data.forEach((product) => {
        if (product.image_urls?.length) {
          imageUrls.push(...product.image_urls);
        }
        if (product.image_url) {
          imageUrls.push(product.image_url);
        }
      });
    }

    // Delete all products from the backend
    const response = await apiRequest<{ message: string; status: number }>(
      "products/",
      "DELETE"
    );

    // If products deletion was successful, delete all images from Cloudinary
    const uniqueImageUrls = [...new Set(imageUrls.filter(Boolean))];

    if (uniqueImageUrls.length > 0) {
      console.log(
        `Attempting to delete ${uniqueImageUrls.length} images from Cloudinary`
      );

      const deletePromises = uniqueImageUrls.map((imageUrl) =>
        deleteImageFromCloudinary(imageUrl)
      );

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(
        (result) => result.status === "fulfilled" && result.value === true
      ).length;

      console.log(
        `Successfully deleted ${successCount}/${uniqueImageUrls.length} images from Cloudinary`
      );
    }

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
        error instanceof Error
          ? error.message
          : "Failed to delete all products",
      status: 500,
    };
  }
}

export async function GetFarmerStats(): Promise<{
  success: boolean;
  data: {
    totalProducts: number;
    recentProducts: number;
    percentageGrowth: string;
    monthlyRevenue: number;
  };
  message: string;
  status: number;
}> {
  try {
    const response = await apiRequest<ProductStatsResponse>(
      "products/stats/overview",
      "GET"
    );

    const { totalProducts, recentProducts, monthlyRevenue } = response.data;

    const percentageGrowth =
      totalProducts && recentProducts
        ? `+${(
            (recentProducts / (totalProducts - recentProducts || 1)) *
            100
          ).toFixed(1)}%`
        : "0%";

    return {
      success: true,
      data: {
        totalProducts,
        recentProducts,
        percentageGrowth,
        monthlyRevenue,
      },
      message: response.message || "Stats fetched successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching product stats:", error);
    return {
      success: false,
      data: {
        totalProducts: 0,
        recentProducts: 0,
        percentageGrowth: "0%",
        monthlyRevenue: 0,
      },
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch product stats",
      status: 500,
    };
  }
}
