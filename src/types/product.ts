
export type ProductCategory = 'catfish' | 'tilapia' | 'vegetable' | 'fruit' | 'livestock';
export type ProductAge = 'young' | 'mature';

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

