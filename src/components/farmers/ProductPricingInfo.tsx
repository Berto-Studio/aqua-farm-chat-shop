
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ProductPricingInfoProps {
  formData: {
    price: string;
    stock: string;
    weightPerUnit: string;
    discount: string;
  };
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
        <Label htmlFor="stock">Stock Quantity</Label>
        <Input
          id="stock"
          type="number"
          placeholder="100"
          value={formData.stock}
          onChange={(e) => onInputChange("stock", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="weightPerUnit">Weight per Unit</Label>
        <Input
          id="weightPerUnit"
          type="number"
          step="0.01"
          placeholder="1.5"
          value={formData.weightPerUnit}
          onChange={(e) => onInputChange("weightPerUnit", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="discount">Discount (%)</Label>
        <Input
          id="discount"
          type="number"
          placeholder="10"
          value={formData.discount}
          onChange={(e) => onInputChange("discount", e.target.value)}
        />
      </div>
    </div>
  );
}
