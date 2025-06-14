
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, Package } from "lucide-react";

interface ProductImageUploadProps {
  selectedImage: File | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
  currentImageUrl?: string;
}

export default function ProductImageUpload({
  selectedImage,
  onImageChange,
  onImageRemove,
  currentImageUrl
}: ProductImageUploadProps) {
  const hasImage = selectedImage || currentImageUrl;
  const imageUrl = selectedImage ? URL.createObjectURL(selectedImage) : currentImageUrl;

  return (
    <div className="space-y-4">
      <Label htmlFor="image">Product Image</Label>
      
      {hasImage ? (
        <div className="relative">
          <div className="aspect-square w-48 rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25">
            <img
              src={imageUrl}
              alt="Product preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={onImageRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Upload a product image
            </p>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="max-w-xs mx-auto"
            />
          </div>
        </div>
      )}
      
      {hasImage && (
        <div className="flex gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="max-w-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
