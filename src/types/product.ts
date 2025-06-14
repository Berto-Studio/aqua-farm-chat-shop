
export type ProductCategory = "Live Stock" | "Fish" | "Vegetables" | "Fruits";
export type ProductAge = "young" | "mature";

export interface Product {
  id?: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  animal_type?: number; // 1=livestock, 2=vegetables, 3=fruits, 4=fish
  image?: Blob | File;
  quantity: number;
  weight_per_unit: string | number;
  rating?: number;
  discount_percentage?: number;
  isFeatured?: boolean;
  animal_stage?: number; // 0=young, 1=mature
  is_alive?: boolean;
  is_fresh?: boolean;
  image_url?: string;
}
