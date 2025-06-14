import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/product";

interface ProductPricingInfoProps {
  formData: Product;
  onInputChange: (field: string, value: string) => void;
}

export default function ProductPricingInfo({
  formData,
  onInputChange,
}: ProductPricingInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="price">Price (GHS)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          placeholder="25.00"
          value={formData.price}
          onChange={(e) => onInputChange("price", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="quantity">Stock Quantity</Label>
        <Input
          id="quantity"
          type="number"
          placeholder="100"
          value={formData.quantity}
          onChange={(e) => onInputChange("quantity", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="weight_per_unit">Weight per Unit</Label>
        <Input
          id="weight_per_unit"
          type="number"
          step="0.01"
          placeholder="1.5"
          value={formData.weight_per_unit}
          onChange={(e) => onInputChange("weight_per_unit", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="discount_percentage">Discount (%)</Label>
        <Input
          id="discount_percentage"
          type="number"
          placeholder="10"
          value={formData.discount_percentage}
          onChange={(e) => onInputChange("discount_percentage", e.target.value)}
        />
      </div>
    </div>
  );
}
