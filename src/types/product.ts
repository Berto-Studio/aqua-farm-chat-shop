export type ProductCategory =
  | "Live Stock"
  | "Fish"
  | "Vegetables"
  | "Fruits"
  | "Farm Equipment";

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
  image_urls?: string[];
  video_urls?: string[];

  // Legacy/computed properties for backward compatibility
  name?: string; // Computed from title
  age?: "young" | "mature"; // Computed from animal_stage
  stock?: number; // Alias for quantity
  discount?: number; // Alias for discount_percentage
  weightPerUnit?: string; // Alias for weight_per_unit
}

export interface ProductFeedback {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  feedback: string;
  created_at: string;
  updated_at?: string;
}

export interface ProductFeedbackSummary {
  average_rating: number;
  total_feedback: number;
}

export interface ProductFeedbackPaginationMeta {
  page: number;
  per_page: number;
  total: number;
  pages: number;
}

export interface ProductStatsResponse {
  data: {
    totalProducts: number;
    recentProducts: number;
    monthlyRevenue: number;
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
