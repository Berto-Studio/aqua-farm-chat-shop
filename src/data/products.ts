
import { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "catfish-fingerlings-1",
    name: "Catfish Fingerlings Pack",
    description: "Healthy catfish fingerlings, perfect for starting your fish farm. Each fingerling is 2-3 inches in length and ready for your pond or tank.",
    price: 25.99,
    category: "catfish",
    age: "young",
    image: "https://images.unsplash.com/photo-1545529468-42764ef8c85f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    stock: 500,
    weightPerUnit: "100 pieces",
    rating: 4.8,
    isFeatured: true
  },
  {
    id: "catfish-juvenile-1",
    name: "Juvenile Catfish",
    description: "Juvenile catfish for faster growth and better yield. Each fish is 5-6 inches in length, healthy and disease-free.",
    price: 45.99,
    category: "catfish",
    age: "young",
    image: "https://images.unsplash.com/photo-1531930420147-42242f345100?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    stock: 200,
    weightPerUnit: "50 pieces",
    rating: 4.6
  },
  {
    id: "catfish-mature-1",
    name: "Mature Catfish",
    description: "Fully grown catfish ready for harvest. Each fish weighs approximately 1-1.5 kg, perfect for commercial use or personal consumption.",
    price: 89.99,
    category: "catfish",
    age: "mature",
    image: "https://images.unsplash.com/photo-1593565429820-73c71c4e476d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    stock: 100,
    weightPerUnit: "10 pieces",
    rating: 4.9,
    isFeatured: true
  },
  {
    id: "tilapia-fingerlings-1",
    name: "Tilapia Fingerlings Pack",
    description: "Healthy tilapia fingerlings from premium genetic stock. Each fingerling is 1-2 inches in length, perfect for your aquaculture project.",
    price: 19.99,
    category: "tilapia",
    age: "young",
    image: "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    stock: 600,
    weightPerUnit: "100 pieces",
    rating: 4.7,
    isFeatured: true
  },
  {
    id: "tilapia-juvenile-1",
    name: "Juvenile Tilapia",
    description: "Juvenile tilapia fish for optimal growth. Each fish is 4-5 inches in length, bred for fast growth and disease resistance.",
    price: 35.99,
    category: "tilapia",
    age: "young",
    image: "https://images.unsplash.com/photo-1515735543535-12964cb8e58d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    stock: 300,
    weightPerUnit: "50 pieces",
    rating: 4.5
  },
  {
    id: "tilapia-mature-1",
    name: "Mature Tilapia",
    description: "Fully grown tilapia ready for harvest. Each fish weighs approximately 0.5-0.8 kg, perfect for immediate use.",
    price: 69.99,
    category: "tilapia",
    age: "mature",
    image: "https://images.unsplash.com/photo-1584689769272-c5a27caefbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    stock: 150,
    weightPerUnit: "10 pieces",
    rating: 4.8,
    isFeatured: true,
    discount: 10
  }
];

export const getFeaturedProducts = () => products.filter(product => product.isFeatured);

export const getProductsByCategory = (category: string) => 
  products.filter(product => product.category === category);

export const getProductsByAge = (age: string) => 
  products.filter(product => product.age === age);

export const getProductById = (id: string) => 
  products.find(product => product.id === id);
