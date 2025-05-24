import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: "all", name: "All Products" },
  { id: "fish", name: "fish" },
  { id: "vegetable", name: "Vegetables" },
  { id: "fruit", name: "Fruits" },
  { id: "livestock", name: "Livestock" },
];

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-max">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className="capitalize"
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
