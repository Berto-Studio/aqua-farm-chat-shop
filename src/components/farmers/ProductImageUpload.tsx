import { useState, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Check,
  Film,
  GripVertical,
  ImageUp,
  Loader2,
  Package,
  Video,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadableMediaItem {
  id: string;
  name: string;
  previewUrl: string;
  sizeInBytes: number;
  uploadedUrl?: string;
  isUploading: boolean;
  uploadError?: string;
  isExisting?: boolean;
}

export type ProductImageItem = UploadableMediaItem;
export type ProductVideoItem = UploadableMediaItem;

interface ProductImageUploadProps {
  imageItems: ProductImageItem[];
  videoItems: ProductVideoItem[];
  onAddImages: (files: FileList | null) => void;
  onMoveImageToTop: (imageId: string) => void;
  onReorderImages: (draggedImageId: string, targetImageId: string) => void;
  onRemoveImage: (imageId: string) => void;
  onAddVideos: (files: FileList | null) => void;
  onRemoveVideo: (videoId: string) => void;
}

export default function ProductImageUpload({
  imageItems,
  videoItems,
  onAddImages,
  onMoveImageToTop,
  onReorderImages,
  onRemoveImage,
  onAddVideos,
  onRemoveVideo,
}: ProductImageUploadProps) {
  const [isImageDropActive, setIsImageDropActive] = useState(false);
  const [isVideoDropActive, setIsVideoDropActive] = useState(false);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);

  const formatFileSize = (sizeInBytes: number) => {
    if (!sizeInBytes) return "Uploaded media";
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    }
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleImageDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsImageDropActive(false);
    onAddImages(event.dataTransfer.files);
  };

  const handleVideoDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsVideoDropActive(false);
    onAddVideos(event.dataTransfer.files);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-base font-semibold">Upload Photos</Label>
        <Input
          id="image-files"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          className="hidden"
          onChange={(event) => {
            onAddImages(event.target.files);
            event.currentTarget.value = "";
          }}
        />
        <div
          className={cn(
            "rounded-lg border border-dashed px-6 py-10 text-center transition-colors",
            isImageDropActive ? "border-primary bg-primary/5" : "border-border"
          )}
          onDragOver={(event) => {
            event.preventDefault();
            setIsImageDropActive(true);
          }}
          onDragLeave={() => setIsImageDropActive(false)}
          onDrop={handleImageDrop}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <ImageUp className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm font-medium">
            Drop your image here, or{" "}
            <Label
              htmlFor="image-files"
              className="cursor-pointer text-primary underline-offset-4 hover:underline"
            >
              browse
            </Label>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Supports PNG, JPG, JPEG, WEBP
          </p>
        </div>
      </div>

      {imageItems.length > 0 && (
        <div className="space-y-3">
          {draggedImageId && imageItems.length > 1 && (
            <div
              className="rounded-md border border-dashed border-primary/50 bg-primary/5 px-3 py-2 text-xs font-medium text-primary"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                onMoveImageToTop(draggedImageId);
                setDraggedImageId(null);
              }}
            >
              Drop here to set as Primary (top image)
            </div>
          )}

          {imageItems.map((imageItem, index) => (
            <div
              key={imageItem.id}
              draggable={imageItems.length > 1}
              onDragStart={() => setDraggedImageId(imageItem.id)}
              onDragEnd={() => setDraggedImageId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (!draggedImageId || draggedImageId === imageItem.id) return;
                onReorderImages(draggedImageId, imageItem.id);
                setDraggedImageId(null);
              }}
              className={cn(
                "rounded-lg border p-3 transition-colors",
                draggedImageId === imageItem.id ? "border-primary/60 bg-primary/5" : ""
              )}
            >
              <div className="flex gap-3">
                <div className="relative h-28 w-36 overflow-hidden rounded-md border bg-muted">
                  {imageItem.isUploading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                  <img
                    src={imageItem.previewUrl}
                    alt={imageItem.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{imageItem.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(imageItem.sizeInBytes)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {imageItems.length > 1 && (
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      )}
                      {imageItem.isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : imageItem.uploadError ? (
                        <span className="text-xs font-medium text-destructive">Failed</span>
                      ) : (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onRemoveImage(imageItem.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        imageItem.uploadError
                          ? "w-full bg-destructive"
                          : imageItem.isUploading
                          ? "w-2/3 animate-pulse bg-primary/70"
                          : "w-full bg-primary"
                      )}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    {index === 0 ? (
                      <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        Primary
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">
                        Drag to top to make primary
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {imageItem.isUploading
                        ? "Uploading..."
                        : imageItem.uploadError
                        ? "Upload failed"
                        : "100%"}
                    </span>
                  </div>
                  {imageItem.uploadError && (
                    <p className="mt-1 text-xs text-destructive">{imageItem.uploadError}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {imageItems.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Package className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Add at least one product image.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-base font-semibold">Product Videos</Label>
        <Input
          id="video-files"
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={(event) => {
            onAddVideos(event.target.files);
            event.currentTarget.value = "";
          }}
        />
        <div
          className={cn(
            "rounded-lg border border-dashed px-6 py-8 text-center transition-colors",
            isVideoDropActive ? "border-primary bg-primary/5" : "border-border"
          )}
          onDragOver={(event) => {
            event.preventDefault();
            setIsVideoDropActive(true);
          }}
          onDragLeave={() => setIsVideoDropActive(false)}
          onDrop={handleVideoDrop}
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Video className="h-7 w-7 text-primary" />
          </div>
          <p className="text-sm font-medium">
            Drop your video here, or{" "}
            <Label
              htmlFor="video-files"
              className="cursor-pointer text-primary underline-offset-4 hover:underline"
            >
              browse
            </Label>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Supports MP4, MOV, WEBM and more
          </p>
        </div>
      </div>

      {videoItems.length > 0 ? (
        <div className="space-y-3">
          {videoItems.map((videoItem) => (
            <div key={videoItem.id} className="rounded-lg border p-3">
              <div className="flex items-start gap-3">
                <div className="relative h-36 w-56 overflow-hidden rounded-md border bg-muted">
                  {videoItem.isUploading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                  <video
                    src={videoItem.previewUrl}
                    controls
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{videoItem.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(videoItem.sizeInBytes)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Film className="h-4 w-4 text-muted-foreground" />
                      {videoItem.isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : videoItem.uploadError ? (
                        <span className="text-xs font-medium text-destructive">Failed</span>
                      ) : (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onRemoveVideo(videoItem.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        videoItem.uploadError
                          ? "w-full bg-destructive"
                          : videoItem.isUploading
                          ? "w-2/3 animate-pulse bg-primary/70"
                          : "w-full bg-primary"
                      )}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-end">
                    <span className="text-[10px] text-muted-foreground">
                      {videoItem.isUploading
                        ? "Uploading..."
                        : videoItem.uploadError
                        ? "Upload failed"
                        : "100%"}
                    </span>
                  </div>
                  {videoItem.uploadError && (
                    <p className="mt-1 text-xs text-destructive">{videoItem.uploadError}</p>
                  )}
                </div>
              </div>
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
