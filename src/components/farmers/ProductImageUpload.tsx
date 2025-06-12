
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface ProductImageUploadProps {
  selectedImage: File | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProductImageUpload({
  selectedImage,
  onImageChange,
}: ProductImageUploadProps) {
  const handleRemoveImage = () => {
    const input = document.getElementById('image-upload') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
    // Create a fake event to trigger the change handler with no file
    const fakeEvent = {
      target: { files: null }
    } as React.ChangeEvent<HTMLInputElement>;
    onImageChange(fakeEvent);
  };

  return (
    <div className="space-y-2">
      <Label>Product Image *</Label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        {selectedImage ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm text-gray-600">{selectedImage.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Size: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-gray-600">
              Click to upload product image
            </p>
          </>
        )}
        <input 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={onImageChange}
          id="image-upload"
          required
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <Button type="button" variant="outline" className="mt-2">
            {selectedImage ? "Change Image" : "Choose File"}
          </Button>
        </label>
      </div>
    </div>
  );
}
