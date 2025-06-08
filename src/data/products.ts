import { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "0",
    name: "CatFish Fingerlings Pack",
    description:
      "Healthy catFish fingerlings, perfect for starting your Fish farm. Each fingerling is 2-3 inches in length and ready for your pond or tank.",
    price: 25.99,
    category: "Fish",
    age: "young",
    image: "/products/Fish/catFish/catFish-fingerlings.avif",
    stock: 500,
    weightPerUnit: "100 pieces",
    rating: 4.8,
    isFeatured: true,
  },
  {
    id: "1",
    name: "Juvenile CatFish",
    description:
      "Juvenile catFish for faster growth and better yield. Each Fish is 5-6 inches in length, healthy and disease-free.",
    price: 45.99,
    category: "Fish",
    age: "young",
    image:
      "https://images.unsplash.com/photo-1531930420147-42242f345100?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    stock: 200,
    weightPerUnit: "50 pieces",
    rating: 4.6,
  },
  {
    id: "2",
    name: "Mature CatFish",
    description:
      "Fully grown catFish ready for harvest. Each Fish weighs approximately 1-1.5 kg, perfect for commercial use or personal consumption.",
    price: 89.99,
    category: "Fish",
    age: "mature",
    image: "/products/Fish/catFish/catFish-mature.jpeg",
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
    category: "Fish",
    age: "young",
    image: "/products/Fish/tilapia/tilapia-fingerlings.jpeg",
    stock: 600,
    weightPerUnit: "100 pieces",
    rating: 4.7,
    isFeatured: true,
  },
  {
    id: "4",
    name: "Juvenile Tilapia",
    description:
      "Juvenile tilapia Fish for optimal growth. Each Fish is 4-5 inches in length, bred for fast growth and disease resistance.",
    price: 35.99,
    category: "Fish",
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
      "Fully grown tilapia ready for harvest. Each Fish weighs approximately 0.5-0.8 kg, perfect for immediate use.",
    price: 69.99,
    category: "Fish",
    age: "mature",
    image: "/products/Fish/tilapia/tilapia-mature.jpg",
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
    category: "Vegetables",
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
    category: "Vegetables",
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
    category: "Fruits",
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
    category: "Fruits",
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
    category: "Live Stock",
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
    category: "Live Stock",
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
