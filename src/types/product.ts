export type ProductCategory = "Live Stock" | "Fish" | "Vegetables" | "Fruits";

export interface Product {
  id?: string | number;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  animal_type?: number; // 1=livestock, 2=vegetables, 3=fruits, 4=fish
  image?: Blob | File | string; // Allow both file uploads and URL strings
  quantity: number;
  weight_per_unit: string | number;
  rating?: number;
  discount_percentage?: number;
  isFeatured?: boolean;
  animal_stage?: number; // 0=young, 1=mature
  is_alive?: boolean;
  is_fresh?: boolean;
  image_url?: string;

  // Legacy/computed properties for backward compatibility
  name?: string; // Computed from title
  age?: "young" | "mature"; // Computed from animal_stage
  stock?: number; // Alias for quantity
  discount?: number; // Alias for discount_percentage
  weightPerUnit?: string; // Alias for weight_per_unit
}

export interface ProductStatsResponse {
  data: {
    totalProducts: number;
    recentProducts: number;
  };
  message: string;
  status: number;
}

export interface ResponseProps<T> {
  success: boolean;
  data?: T;
  message: string;
  status: number;
}
