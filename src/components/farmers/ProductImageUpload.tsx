
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ProductImageUploadProps {
  selectedImage: File | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProductImageUpload({
  selectedImage,
  onImageChange,
}: ProductImageUploadProps) {
  return (
    <div className="space-y-2">
      <Label>Product Image</Label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-sm text-gray-600">
          {selectedImage ? selectedImage.name : "Click to upload product image"}
        </p>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={onImageChange}
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <Button type="button" variant="outline" className="mt-2">
            Choose File
          </Button>
        </label>
      </div>
    </div>
  );
}
