/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_API_URL?: string;
  readonly VITE_SOCKET_URL?: string;
  readonly VITE_USE_DEV_PROXY?: string;
  readonly VITE_PAYSTACK_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type Category = {
  id: number;
  name: string;
  description: string;
};

type RequestResponse = {
  data: Category[] | null;
  message: string;
  status: number;
};

type ProductResponse = {
  data: {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    age: string;
    image: string;
    stock: number;
    weightPerUnit: string;
    rating: number;
    discount?: number;
    isFeatured?: boolean;
    animal_stage?: number;
  } | null;
  message: string;
  status: number;
};

type PromisTypes = {
  success: boolean;
  data?: Category[] | [];
  message?: string;
  status?: number;
};
