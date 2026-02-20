
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const { data: categories = [], isLoading, error } = useCategories();

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

  if (error) {
    console.error('Error fetching categories:', error);
    // Fallback to default categories if API fails
    const fallbackCategories = [
      { id: 1, name: "fish" },
      { id: 2, name: "vegetable" },
      { id: 3, name: "fruit" },
      { id: 4, name: "livestock" },
    ];
    
    return (
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange("all")}
            className="capitalize"
          >
            All Products
          </Button>
          {fallbackCategories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.name ? "default" : "outline"}
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

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-max">
        <Button
          variant={activeCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange("all")}
          className="capitalize"
        >
          All Products
        </Button>
        {Array.isArray(categories) && categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.name ? "default" : "outline"}
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
