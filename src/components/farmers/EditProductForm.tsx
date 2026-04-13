import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { X, CheckCircle } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { UpdateProduct } from "@/services/products";
import { useQueryClient } from "@tanstack/react-query";
import {
  cleanupCloudinaryMediaInBackground,
  uploadProductImageToCloudinary,
  uploadProductVideoToCloudinary,
} from "@/services/cloudinary";
import ProductBasicInfo from "./ProductBasicInfo";
import ProductPricingInfo from "./ProductPricingInfo";
import ProductCategoryFields from "./ProductCategoryFields";
import ProductImageUpload, {
  ProductImageItem,
  ProductVideoItem,
} from "./ProductImageUpload";
import { Product } from "@/types/product";
import { ModalMessage } from "@/components/ui/modalMessage";
import { getProductImageUrls, getProductVideoUrls } from "@/lib/productMedia";

interface EditProductFormProps {
  product: Product;
  onClose: () => void;
}

const createMediaId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const getMediaNameFromUrl = (url: string, index: number) => {
  try {
    const parsedUrl = new URL(url, "http://localhost");
    const rawName = parsedUrl.pathname.split("/").pop();
    return rawName ? decodeURIComponent(rawName) : `media-${index + 1}`;
  } catch {
    return `media-${index + 1}`;
  }
};

const REUPLOAD_REQUIRED_MESSAGE = "Re-upload required after save failure.";

export default function EditProductForm({
  product,
  onClose,
}: EditProductFormProps) {
  const [formData, setFormData] = useState<Product>(product);
  const [imageItems, setImageItems] = useState<ProductImageItem[]>([]);
  const [videoItems, setVideoItems] = useState<ProductVideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const imagePreviewUrlsRef = useRef<string[]>([]);
  const videoPreviewUrlsRef = useRef<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  useEffect(() => {
    setFormData(product);

    imagePreviewUrlsRef.current.forEach((previewUrl) => {
      URL.revokeObjectURL(previewUrl);
    });
    videoPreviewUrlsRef.current.forEach((previewUrl) => {
      URL.revokeObjectURL(previewUrl);
    });
    imagePreviewUrlsRef.current = [];
    videoPreviewUrlsRef.current = [];

    const initialImageItems = getProductImageUrls(product).map((url, index) => ({
      id: createMediaId(),
      name: getMediaNameFromUrl(url, index),
      previewUrl: url,
      sizeInBytes: 0,
      uploadedUrl: url,
      isUploading: false,
      isExisting: true,
    }));

    const initialVideoItems = getProductVideoUrls(product).map((url, index) => ({
      id: createMediaId(),
      name: getMediaNameFromUrl(url, index),
      previewUrl: url,
      sizeInBytes: 0,
      uploadedUrl: url,
      isUploading: false,
      isExisting: true,
    }));

    setImageItems(initialImageItems);
    setVideoItems(initialVideoItems);
  }, [product]);

  useEffect(() => {
    return () => {
      imagePreviewUrlsRef.current.forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });
      videoPreviewUrlsRef.current.forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });
      imagePreviewUrlsRef.current = [];
      videoPreviewUrlsRef.current = [];
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (imageFiles.length === 0) return;

    const pendingItems: ProductImageItem[] = imageFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      imagePreviewUrlsRef.current.push(previewUrl);

      return {
        id: createMediaId(),
        name: file.name,
        previewUrl,
        sizeInBytes: file.size,
        isUploading: true,
      };
    });

    setImageItems((prev) => [...prev, ...pendingItems]);

    pendingItems.forEach((pendingItem, index) => {
      const file = imageFiles[index];
      void uploadProductImageToCloudinary(file)
        .then((uploadedUrl) => {
          setImageItems((prev) =>
            prev.map((imageItem) =>
              imageItem.id === pendingItem.id
                ? {
                    ...imageItem,
                    uploadedUrl,
                    isUploading: false,
                    uploadError: undefined,
                  }
                : imageItem
            )
          );
        })
        .catch((error) => {
          const uploadError =
            error instanceof Error
              ? error.message
              : "Failed to upload image to Cloudinary.";

          setImageItems((prev) =>
            prev.map((imageItem) =>
              imageItem.id === pendingItem.id
                ? {
                    ...imageItem,
                    isUploading: false,
                    uploadError,
                  }
                : imageItem
            )
          );

          toast({
            title: "Image Upload Failed",
            description: uploadError,
            variant: "destructive",
          });
        });
    });
  };

  const handleAddVideos = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const mediaFiles = Array.from(files).filter((file) =>
      file.type.startsWith("video/")
    );
    if (mediaFiles.length === 0) return;

    const pendingItems: ProductVideoItem[] = mediaFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      videoPreviewUrlsRef.current.push(previewUrl);

      return {
        id: createMediaId(),
        name: file.name,
        previewUrl,
        sizeInBytes: file.size,
        isUploading: true,
      };
    });

    setVideoItems((prev) => [...prev, ...pendingItems]);

    pendingItems.forEach((pendingItem, index) => {
      const file = mediaFiles[index];
      void uploadProductVideoToCloudinary(file)
        .then((uploadedUrl) => {
          setVideoItems((prev) =>
            prev.map((videoItem) =>
              videoItem.id === pendingItem.id
                ? {
                    ...videoItem,
                    uploadedUrl,
                    isUploading: false,
                    uploadError: undefined,
                  }
                : videoItem
            )
          );
        })
        .catch((error) => {
          const uploadError =
            error instanceof Error
              ? error.message
              : "Failed to upload video to Cloudinary.";

          setVideoItems((prev) =>
            prev.map((videoItem) =>
              videoItem.id === pendingItem.id
                ? {
                    ...videoItem,
                    isUploading: false,
                    uploadError,
                  }
                : videoItem
            )
          );

          toast({
            title: "Video Upload Failed",
            description: uploadError,
            variant: "destructive",
          });
        });
    });
  };

  const handleMoveImageToTop = (imageId: string) => {
    setImageItems((prev) => {
      const imageIndex = prev.findIndex((imageItem) => imageItem.id === imageId);
      if (imageIndex <= 0) return prev;

      const next = [...prev];
      const [movedImage] = next.splice(imageIndex, 1);
      next.unshift(movedImage);
      return next;
    });
  };

  const handleReorderImages = (draggedImageId: string, targetImageId: string) => {
    if (draggedImageId === targetImageId) return;

    setImageItems((prev) => {
      const draggedImageIndex = prev.findIndex(
        (imageItem) => imageItem.id === draggedImageId
      );
      const targetImageIndex = prev.findIndex(
        (imageItem) => imageItem.id === targetImageId
      );

      if (draggedImageIndex === -1 || targetImageIndex === -1) return prev;

      const next = [...prev];
      const [draggedImage] = next.splice(draggedImageIndex, 1);
      next.splice(targetImageIndex, 0, draggedImage);
      return next;
    });
  };

  const handleRemoveImage = (imageId: string) => {
    setImageItems((prev) => {
      const imageToRemove = prev.find((imageItem) => imageItem.id === imageId);
      if (imageToRemove?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
        imagePreviewUrlsRef.current = imagePreviewUrlsRef.current.filter(
          (previewUrl) => previewUrl !== imageToRemove.previewUrl
        );
      }

      return prev.filter((imageItem) => imageItem.id !== imageId);
    });
  };

  const handleRemoveVideo = (videoId: string) => {
    setVideoItems((prev) => {
      const videoToRemove = prev.find((videoItem) => videoItem.id === videoId);
      if (videoToRemove?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(videoToRemove.previewUrl);
        videoPreviewUrlsRef.current = videoPreviewUrlsRef.current.filter(
          (previewUrl) => previewUrl !== videoToRemove.previewUrl
        );
      }

      return prev.filter((videoItem) => videoItem.id !== videoId);
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (imageItems.length === 0) {
      toast({
        title: "Image Required",
        description: "Please keep or add at least one image for your product.",
        variant: "destructive",
      });
      return;
    }

    const hasUploadingMedia = [...imageItems, ...videoItems].some(
      (mediaItem) => mediaItem.isUploading
    );
    if (hasUploadingMedia) {
      toast({
        title: "Uploads In Progress",
        description: "Please wait for all media uploads to finish.",
        variant: "destructive",
      });
      return;
    }

    const hasMediaUploadErrors = [...imageItems, ...videoItems].some(
      (mediaItem) => mediaItem.uploadError
    );
    if (hasMediaUploadErrors) {
      toast({
        title: "Media Upload Error",
        description: "Remove failed media files and upload them again.",
        variant: "destructive",
      });
      return;
    }

    const uploadedImageUrls = imageItems
      .map((imageItem) => imageItem.uploadedUrl)
      .filter(Boolean) as string[];
    const uploadedVideoUrls = videoItems
      .map((videoItem) => videoItem.uploadedUrl)
      .filter(Boolean) as string[];

    if (uploadedImageUrls.length !== imageItems.length) {
      toast({
        title: "Image Upload Incomplete",
        description: "Some images are not ready yet. Please wait a moment.",
        variant: "destructive",
      });
      return;
    }

    if (uploadedVideoUrls.length !== videoItems.length) {
      toast({
        title: "Video Upload Incomplete",
        description: "Some videos are not ready yet. Please wait a moment.",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmUpdateProduct = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);

    try {
      const allImageUrls = imageItems
        .map((imageItem) => imageItem.uploadedUrl)
        .filter(Boolean) as string[];
      const allVideoUrls = videoItems
        .map((videoItem) => videoItem.uploadedUrl)
        .filter(Boolean) as string[];

      if (allImageUrls.length === 0) {
        throw new Error("Please upload at least one product image.");
      }

      const primaryImageUrl = allImageUrls[0];

      const productData: Partial<Product> = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        category: formData.category,
        weight_per_unit: Number(formData.weight_per_unit),
        rating: formData.rating || 4.0,
        image_url: primaryImageUrl,
        image_urls: allImageUrls,
        video_urls: allVideoUrls.length ? allVideoUrls : undefined,
        discount_percentage: formData.discount_percentage
          ? Number(formData.discount_percentage)
          : undefined,
        animal_type: formData.animal_type
          ? Number(formData.animal_type)
          : undefined,
        animal_stage: formData.animal_stage
          ? Number(formData.animal_stage)
          : undefined,
        is_alive:
          formData.category === "Live Stock" || formData.category === "Fish",
        is_fresh:
          formData.category === "Vegetables" || formData.category === "Fruits",
      };

      console.log("Updating product data with uploaded media URLs:", productData);

      const response = await UpdateProduct(product.id!, productData);

      if (response.success) {
        toast({
          title: "Market Item Updated",
          description: "Your market item has been successfully updated.",
        });

        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["farmer-stats"] });

        onClose();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const newUploadedImageUrls = imageItems
        .filter((imageItem) => !imageItem.isExisting && imageItem.uploadedUrl)
        .map((imageItem) => imageItem.uploadedUrl as string);
      const newUploadedVideoUrls = videoItems
        .filter((videoItem) => !videoItem.isExisting && videoItem.uploadedUrl)
        .map((videoItem) => videoItem.uploadedUrl as string);

      cleanupCloudinaryMediaInBackground({
        imageUrls: newUploadedImageUrls,
        videoUrls: newUploadedVideoUrls,
      });

      setImageItems((prev) =>
        prev.map((imageItem) =>
          imageItem.isExisting
            ? imageItem
            : {
                ...imageItem,
                uploadedUrl: undefined,
                uploadError: imageItem.uploadError ?? REUPLOAD_REQUIRED_MESSAGE,
              }
        )
      );
      setVideoItems((prev) =>
        prev.map((videoItem) =>
          videoItem.isExisting
            ? videoItem
            : {
                ...videoItem,
                uploadedUrl: undefined,
                uploadError: videoItem.uploadError ?? REUPLOAD_REQUIRED_MESSAGE,
              }
        )
      );

      console.error("Error updating product:", error);
      toast({
        title: "Failed to Update Market Item",
        description:
          error instanceof Error
            ? `${error.message} Re-upload media files before retrying.`
            : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isAnyMediaUploading = [...imageItems, ...videoItems].some(
    (mediaItem) => mediaItem.isUploading
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Edit Market Item</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <ProductBasicInfo
            formData={formData}
            categories={categories}
            categoriesLoading={categoriesLoading}
            onInputChange={handleInputChange}
          />

          <ProductPricingInfo
            formData={formData}
            onInputChange={handleInputChange}
          />

          <ProductCategoryFields
            formData={formData}
            categories={categories}
            onInputChange={handleInputChange}
          />

          <ProductImageUpload
            imageItems={imageItems}
            videoItems={videoItems}
            onAddImages={handleAddImages}
            onMoveImageToTop={handleMoveImageToTop}
            onReorderImages={handleReorderImages}
            onRemoveImage={handleRemoveImage}
            onAddVideos={handleAddVideos}
            onRemoveVideo={handleRemoveVideo}
          />

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isAnyMediaUploading}
              className="flex-1"
            >
              {isAnyMediaUploading
                ? "Uploading Media..."
                : isLoading
                ? "Updating Market Item..."
                : "Update Market Item"}
            </Button>
          </div>
        </form>
      </CardContent>

      <ModalMessage
        open={showConfirmModal}
        onConfirm={confirmUpdateProduct}
        onCancel={() => setShowConfirmModal(false)}
        title="Update Market Item"
        message="Are you sure you want to update this market item? Changes will be visible to buyers immediately."
        actionLabel="Update Item"
        actionVariant="default"
        icon={<CheckCircle className="w-5 h-5 text-primary" />}
      />
    </Card>
  );
}
