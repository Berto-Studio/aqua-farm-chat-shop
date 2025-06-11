
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductCategoryFieldsProps {
  formData: {
    category: string;
    age: string;
    animalStage: string;
  };
  categories: Array<{ id: number; name: string }>;
  onInputChange: (field: string, value: string) => void;
}

export default function ProductCategoryFields({
  formData,
  categories,
  onInputChange,
}: ProductCategoryFieldsProps) {
  const getAgeOptions = () => {
    const selectedCategory = categories.find(cat => cat.id.toString() === formData.category);
    const categoryName = selectedCategory?.name?.toLowerCase();
    
    if (categoryName === "livestock" || categoryName === "live stock") {
      return [
        { value: "1", label: "Young" },
        { value: "0", label: "Mature" }
      ];
    } else if (categoryName === "fish") {
      return [
        { value: "1", label: "Fingerlings" },
        { value: "0", label: "Mature" }
      ];
    } else {
      return [
        { value: "1", label: "Fresh" },
        { value: "0", label: "Not Fresh" }
      ];
    }
  };

  const getAnimalStageOptions = () => {
    return [
      { value: "0", label: "Young" },
      { value: "1", label: "Mature" }
    ];
  };

  const shouldShowAnimalStage = () => {
    const selectedCategory = categories.find(cat => cat.id.toString() === formData.category);
    const categoryName = selectedCategory?.name?.toLowerCase();
    return categoryName === "livestock" || categoryName === "live stock";
  };

  const getAgeLabel = () => {
    const selectedCategory = categories.find(cat => cat.id.toString() === formData.category);
    const categoryName = selectedCategory?.name?.toLowerCase();
    
    if (categoryName === "fish") {
      return "Fish Stage";
    } else if (categoryName === "livestock" || categoryName === "live stock") {
      return "Animal Stage";
    } else {
      return "Freshness";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="age">{getAgeLabel()}</Label>
        <Select onValueChange={(value) => onInputChange("age", value)} disabled={!formData.category}>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            {getAgeOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {shouldShowAnimalStage() && (
        <div className="space-y-2">
          <Label htmlFor="animalStage">Animal Maturity</Label>
          <Select onValueChange={(value) => onInputChange("animalStage", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select maturity" />
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
      )}
    </div>
  );
}
