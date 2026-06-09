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
  onInputChange,
}: ProductCategoryFieldsProps) {
  const FingerlingsType = [
    { label: "Catfish", value: "catfish" },
    { label: "Tilapia", value: "tilapia" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="animal_type">Fingerlings Fish Type</Label>
        <Select
          value={formData.animal_type?.toString() || ""}
          onValueChange={(value) => onInputChange("animal_type", value)}
          disabled={!formData.category}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {FingerlingsType.map((option) => (
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
