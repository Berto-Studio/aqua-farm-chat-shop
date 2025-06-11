export type ProductCategory = "Live Stock" | "Fish" | "Vegetables" | "Fruits";
export type ProductAge = "young" | "mature";

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  age: ProductAge;
  image: string;
  stock: number;
  weightPerUnit: string;
  rating: number;
  discount?: number;
  isFeatured?: boolean;
  animal_stage?: number;
}
