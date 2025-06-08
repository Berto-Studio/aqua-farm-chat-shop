
import { useQuery } from "@tanstack/react-query";
import GetCategories from "@/services/products/categories";

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: GetCategories,
  });
};
