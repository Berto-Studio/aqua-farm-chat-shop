
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/types/product";

interface ProductCategoryFieldsProps {
  formData: Product;
  categories: Array<{ id: number; name: string }>;
  onInputChange: (field: string, value: string) => void;
}

export default function ProductCategoryFields({
  formData,
  categories,
  onInputChange,
}: ProductCategoryFieldsProps) {
  const getAnimalTypeOptions = () => {
    const selectedCategory = categories.find(
      (cat) => cat.id.toString() === formData.category
    );
    const categoryName = selectedCategory?.name?.toLowerCase();

    if (categoryName === "livestock" || categoryName === "live stock") {
      return [
        { value: "1", label: "Cow" },
        { value: "2", label: "Pig" },
        { value: "3", label: "Goat" },
        { value: "4", label: "Sheep" },
        { value: "5", label: "Chicken" },
        { value: "6", label: "Duck" },
      ];
    } else if (categoryName === "fish") {
      return [
        { value: "1", label: "Catfish" },
        { value: "2", label: "Tilapia" },
        { value: "3", label: "Salmon" },
        { value: "4", label: "Tuna" },
      ];
    }
    return [];
  };

  const getAnimalStageOptions = () => {
    return [
      { value: "0", label: "Young" },
      { value: "1", label: "Mature" },
    ];
  };

  const shouldShowAnimalFields = () => {
    const selectedCategory = categories.find(
      (cat) => cat.id.toString() === formData.category
    );
    const categoryName = selectedCategory?.name?.toLowerCase();
    return (
      categoryName === "livestock" ||
      categoryName === "live stock" ||
      categoryName === "fish"
    );
  };

  const getAnimalTypeLabel = () => {
    const selectedCategory = categories.find(
      (cat) => cat.id.toString() === formData.category
    );
    const categoryName = selectedCategory?.name?.toLowerCase();
    
    if (categoryName === "livestock" || categoryName === "live stock") {
      return "Animal Type";
    } else if (categoryName === "fish") {
      return "Fish Type";
    }
    return "Type";
  };

  if (!shouldShowAnimalFields()) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="animal_type">{getAnimalTypeLabel()}</Label>
        <Select
          onValueChange={(value) => onInputChange("animal_type", value)}
          disabled={!formData.category}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {getAnimalTypeOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="animal_stage">Animal Stage</Label>
        <Select onValueChange={(value) => onInputChange("animal_stage", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent>
            {getAnimalStageOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
