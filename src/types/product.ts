export type ProductCategory = "Live Stock" | "Fish" | "Vegetables" | "Fruits";
export type ProductAge = "young" | "mature";

export interface Product {
  id?: string; // Changed from number to string
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  animaltype?: string;
  image?: Blob | File;
  quantity: number;
  weight_per_unit: string | number;
  rating?: number;
  discount_percentage?: number;
  isFeatured?: boolean;
  animal_stage?: number;
  is_alive?: boolean;
  is_fresh?: boolean;
  image_url?: string;
}
