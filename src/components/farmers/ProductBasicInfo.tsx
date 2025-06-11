
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductBasicInfoProps {
  formData: {
    name: string;
    description: string;
    category: string;
  };
  categories: Array<{ id: number; name: string }>;
  categoriesLoading: boolean;
  onInputChange: (field: string, value: string) => void;
}

export default function ProductBasicInfo({
  formData,
  categories,
  categoriesLoading,
  onInputChange,
}: ProductBasicInfoProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            placeholder="Fresh Tomatoes"
            value={formData.name}
            onChange={(e) => onInputChange("name", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select onValueChange={(value) => onInputChange("category", value)} disabled={categoriesLoading}>
            <SelectTrigger>
              <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your product..."
          value={formData.description}
          onChange={(e) => onInputChange("description", e.target.value)}
          rows={3}
          required
        />
      </div>
    </>
  );
}
