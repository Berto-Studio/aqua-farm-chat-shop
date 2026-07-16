import GetProducts, {
  GetProductsByCategories,
  GetProductsByCategory,
} from "@/services/products";
import { useQuery } from "@tanstack/react-query";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await GetProducts();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useProductByCategoryFingerlings = (categoryName: string) => {
  return useQuery({
    queryKey: ["product-category-fingerlings"],
    queryFn: async () => {
      const response = await GetProductsByCategory(categoryName);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useProductByCategoryCatfishTilapia = (categoryName: string) => {
  return useQuery({
    queryKey: ["product-category-catfish-tilapia"],
    queryFn: async () => {
      const response = await GetProductsByCategories(categoryName);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useProductByCategoryFarmEquipment = (categoryName: string) => {
  return useQuery({
    queryKey: ["product-category-farm-equipment"],
    queryFn: async () => {
      const response = await GetProductsByCategory(categoryName);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useProductByCategoryFishFeed = (categoryName: string) => {
  return useQuery({
    queryKey: ["product-category-fish-feed"],
    queryFn: async () => {
      const response = await GetProductsByCategory(categoryName);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
