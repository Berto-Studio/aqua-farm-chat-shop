import { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "0",
    name: "Catfish Fingerlings Pack",
    description:
      "Healthy catfish fingerlings, perfect for starting your fish farm. Each fingerling is 2-3 inches in length and ready for your pond or tank.",
    price: 25.99,
    category: "fish",
    age: "young",
    image: "/products/fish/catfish/catfish-fingerlings.avif",
    stock: 500,
    weightPerUnit: "100 pieces",
    rating: 4.8,
    isFeatured: true,
  },
  {
    id: "1",
    name: "Juvenile Catfish",
    description:
      "Juvenile catfish for faster growth and better yield. Each fish is 5-6 inches in length, healthy and disease-free.",
    price: 45.99,
    category: "fish",
    age: "young",
    image:
      "https://images.unsplash.com/photo-1531930420147-42242f345100?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    stock: 200,
    weightPerUnit: "50 pieces",
    rating: 4.6,
  },
  {
    id: "2",
    name: "Mature Catfish",
    description:
      "Fully grown catfish ready for harvest. Each fish weighs approximately 1-1.5 kg, perfect for commercial use or personal consumption.",
    price: 89.99,
    category: "fish",
    age: "mature",
    image: "/products/fish/catfish/catfish-mature.jpeg",
    stock: 100,
    weightPerUnit: "10 pieces",
    rating: 4.9,
    isFeatured: true,
  },
  {
    id: "3",
    name: "Tilapia Fingerlings Pack",
    description:
      "Healthy tilapia fingerlings from premium genetic stock. Each fingerling is 1-2 inches in length, perfect for your aquaculture project.",
    price: 19.99,
    category: "fish",
    age: "young",
    image: "/products/fish/tilapia/tilapia-fingerlings.jpeg",
    stock: 600,
    weightPerUnit: "100 pieces",
    rating: 4.7,
    isFeatured: true,
  },
  {
    id: "4",
    name: "Juvenile Tilapia",
    description:
      "Juvenile tilapia fish for optimal growth. Each fish is 4-5 inches in length, bred for fast growth and disease resistance.",
    price: 35.99,
    category: "fish",
    age: "young",
    image:
      "https://images.unsplash.com/photo-1515735543535-12964cb8e58d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    stock: 300,
    weightPerUnit: "50 pieces",
    rating: 4.5,
  },
  {
    id: "5",
    name: "Mature Tilapia",
    description:
      "Fully grown tilapia ready for harvest. Each fish weighs approximately 0.5-0.8 kg, perfect for immediate use.",
    price: 69.99,
    category: "fish",
    age: "mature",
    image: "/products/fish/tilapia/tilapia-mature.jpg",
    stock: 150,
    weightPerUnit: "10 pieces",
    rating: 4.8,
    isFeatured: true,
    discount: 10,
  },
  {
    id: "6",
    name: "Organic Tomatoes",
    description:
      "Fresh, organically grown tomatoes. Perfect for salads, sauces, and culinary uses.",
    price: 3.99,
    category: "vegetable",
    age: "mature",
    image:
      "https://images.unsplash.com/photo-1524593166156-312f362cada0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    stock: 250,
    weightPerUnit: "1 kg",
    rating: 4.7,
  },
  {
    id: "7",
    name: "Fresh Cucumbers",
    description:
      "Crisp and refreshing cucumbers, grown with sustainable farming practices.",
    price: 2.99,
    category: "vegetable",
    age: "mature",
    image:
      "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    stock: 180,
    weightPerUnit: "500g",
    rating: 4.5,
    discount: 5,
  },
  {
    id: "apple-red-1",
    name: "Red Apples",
    description:
      "Sweet and crunchy red apples, perfect for snacking or baking.",
    price: 4.99,
    category: "fruit",
    age: "mature",
    image:
      "https://images.unsplash.com/photo-1567306226681-6a1e63fc2ebc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    stock: 300,
    weightPerUnit: "1 kg",
    rating: 4.8,
    isFeatured: true,
  },
  {
    id: "orange-juicy-1",
    name: "Juicy Oranges",
    description:
      "Vitamin-rich oranges with a perfect balance of sweetness and tanginess.",
    price: 5.49,
    category: "fruit",
    age: "mature",
    image:
      "https://images.unsplash.com/photo-1557800636-894a64c1696f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    stock: 200,
    weightPerUnit: "1 kg",
    rating: 4.6,
  },
  {
    id: "chicken-broiler-1",
    name: "Broiler Chickens",
    description:
      "Healthy broiler chickens raised in a free-range environment, perfect for meat production.",
    price: 12.99,
    category: "livestock",
    age: "young",
    image:
      "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    stock: 50,
    weightPerUnit: "1 bird",
    rating: 4.7,
    isFeatured: true,
  },
  {
    id: "goat-dairy-1",
    name: "Dairy Goats",
    description:
      "Healthy dairy goats from quality breeding stock, excellent for milk production.",
    price: 199.99,
    category: "livestock",
    age: "mature",
    image:
      "https://images.unsplash.com/photo-1560598822-8ae46255e8e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    stock: 10,
    weightPerUnit: "1 goat",
    rating: 4.9,
  },
];

export const getFeaturedProducts = () =>
  products.filter((product) => product.isFeatured);

export const getProductsByCategory = (category: string) =>
  products.filter((product) => product.category === category);

export const getProductsByAge = (age: string) =>
  products.filter((product) => product.age === age);

export const getProductById = (id: string) =>
  products.find((product) => product.id === id);
