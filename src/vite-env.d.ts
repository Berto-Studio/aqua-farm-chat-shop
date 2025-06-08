/// <reference types="vite/client" />

type RequestResponse = {
  data: {
    id: number;
    name: string;
    description: string;
  } | null;
  message: string;
  status: number;
};

type PromisTypes = {
  success: boolean;
  data?: RequestResponse.data | [];
  message?: string;
  status?: number;
};
