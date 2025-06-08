
/// <reference types="vite/client" />

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

type PromisTypes = {
  success: boolean;
  data?: Category[] | [];
  message?: string;
  status?: number;
};
