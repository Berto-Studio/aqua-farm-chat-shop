import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Film, Image as ImageIcon, Package, X } from "lucide-react";

interface ProductImageUploadProps {
  selectedImages: File[];
  selectedVideos: File[];
  existingImageUrls?: string[];
  existingVideoUrls?: string[];
  onAddImages: (files: FileList | null) => void;
  onAddVideos: (files: FileList | null) => void;
  onRemoveSelectedImage: (index: number) => void;
  onRemoveSelectedVideo: (index: number) => void;
  onRemoveExistingImage: (index: number) => void;
  onRemoveExistingVideo: (index: number) => void;
}

export default function ProductImageUpload({
  selectedImages,
  selectedVideos,
  existingImageUrls = [],
  existingVideoUrls = [],
  onAddImages,
  onAddVideos,
  onRemoveSelectedImage,
  onRemoveSelectedVideo,
  onRemoveExistingImage,
  onRemoveExistingVideo,
}: ProductImageUploadProps) {
  const selectedImagePreviews = useMemo(
    () =>
      selectedImages.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [selectedImages]
  );

  const selectedVideoPreviews = useMemo(
    () =>
      selectedVideos.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [selectedVideos]
  );

  useEffect(() => {
    return () => {
      selectedImagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
      selectedVideoPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedImagePreviews, selectedVideoPreviews]);

  const totalImages = existingImageUrls.length + selectedImagePreviews.length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="image-files">Product Images</Label>
        <p className="text-sm text-muted-foreground">
          Upload multiple images. The first image will be used in product table
          and grid cards.
        </p>
        <Input
          id="image-files"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            onAddImages(e.target.files);
            e.currentTarget.value = "";
          }}
        />
      </div>

      {totalImages > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {existingImageUrls.map((url, index) => (
            <div key={`existing-image-${url}-${index}`} className="relative">
              <div className="aspect-square overflow-hidden rounded-md border">
                <img
                  src={url}
                  alt={`Product image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              {index === 0 && (
                <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  Primary
                </span>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -right-2 -top-2 h-6 w-6"
                onClick={() => onRemoveExistingImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {selectedImagePreviews.map((preview, index) => (
            <div key={`selected-image-${preview.name}-${index}`} className="relative">
              <div className="aspect-square overflow-hidden rounded-md border">
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="h-full w-full object-cover"
                />
              </div>
              {existingImageUrls.length === 0 && index === 0 && (
                <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  Primary
                </span>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -right-2 -top-2 h-6 w-6"
                onClick={() => onRemoveSelectedImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <ImageIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Add at least one product image.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="video-files">Product Videos</Label>
        <p className="text-sm text-muted-foreground">
          Optional: add one or more videos to showcase your product.
        </p>
        <Input
          id="video-files"
          type="file"
          accept="video/*"
          multiple
          onChange={(e) => {
            onAddVideos(e.target.files);
            e.currentTarget.value = "";
          }}
        />
      </div>

      {existingVideoUrls.length + selectedVideoPreviews.length > 0 ? (
        <div className="space-y-3">
          {existingVideoUrls.map((url, index) => (
            <div
              key={`existing-video-${url}-${index}`}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              <Film className="h-4 w-4 text-muted-foreground" />
              <video src={url} controls className="h-20 w-full rounded-md border" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-7 w-7"
                onClick={() => onRemoveExistingVideo(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {selectedVideoPreviews.map((preview, index) => (
            <div
              key={`selected-video-${preview.name}-${index}`}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              <Film className="h-4 w-4 text-muted-foreground" />
              <video
                src={preview.url}
                controls
                className="h-20 w-full rounded-md border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-7 w-7"
                onClick={() => onRemoveSelectedVideo(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <Package className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No videos added yet.</p>
        </div>
      )}
    </div>
  );
}
