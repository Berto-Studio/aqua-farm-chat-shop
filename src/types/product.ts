export type ProductCategory = "livestock" | "fish" | "vegetable" | "fruit";
export type ProductAge = "young" | "mature";

export interface Product {
  id: string;
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
}
