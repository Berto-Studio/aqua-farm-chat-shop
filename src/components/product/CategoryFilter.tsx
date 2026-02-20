
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import {
  DEFAULT_PRODUCT_CATEGORIES,
  normalizeCategoryName,
} from "@/constants/categories";

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const { data: categories = [], isLoading } = useCategories();
  const normalizedActiveCategory = normalizeCategoryName(activeCategory);

  if (isLoading) {
    return (
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          <div className="h-9 w-24 bg-gray-200 animate-pulse rounded-md"></div>
          <div className="h-9 w-20 bg-gray-200 animate-pulse rounded-md"></div>
          <div className="h-9 w-28 bg-gray-200 animate-pulse rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-max">
        <Button
          variant={
            normalizedActiveCategory.toLowerCase() === "all"
              ? "default"
              : "outline"
          }
          size="sm"
          onClick={() => onCategoryChange("all")}
          className="capitalize"
        >
          All Products
        </Button>
        {(Array.isArray(categories) ? categories : DEFAULT_PRODUCT_CATEGORIES).map((category) => (
          <Button
            key={category.id}
            variant={
              normalizedActiveCategory.toLowerCase() ===
              category.name.toLowerCase()
                ? "default"
                : "outline"
            }
            size="sm"
            onClick={() => onCategoryChange(category.name)}
            className="capitalize"
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
