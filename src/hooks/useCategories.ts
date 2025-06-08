import GetCategories from "@/services/categories";
import { useQuery } from "@tanstack/react-query";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: GetCategories,
  });
};
