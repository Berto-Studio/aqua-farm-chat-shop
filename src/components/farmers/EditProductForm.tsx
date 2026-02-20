import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { X, CheckCircle } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { UpdateProduct } from "@/services/products";
import { useQueryClient } from "@tanstack/react-query";
import {
  uploadImageToCloudinary,
  uploadVideoToCloudinary,
} from "@/services/cloudinary";
import ProductBasicInfo from "./ProductBasicInfo";
import ProductPricingInfo from "./ProductPricingInfo";
import ProductCategoryFields from "./ProductCategoryFields";
import ProductImageUpload from "./ProductImageUpload";
import { Product } from "@/types/product";
import { ModalMessage } from "@/components/ui/modalMessage";
import { getProductImageUrls, getProductVideoUrls } from "@/lib/productMedia";

interface EditProductFormProps {
  product: Product;
  onClose: () => void;
}

export default function EditProductForm({
  product,
  onClose,
}: EditProductFormProps) {
  const [formData, setFormData] = useState<Product>(product);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [existingVideoUrls, setExistingVideoUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  useEffect(() => {
    setExistingImageUrls(getProductImageUrls(product));
    setExistingVideoUrls(getProductVideoUrls(product));
  }, [product]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setSelectedImages((prev) => [...prev, ...Array.from(files)]);
  };

  const handleAddVideos = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setSelectedVideos((prev) => [...prev, ...Array.from(files)]);
  };

  const handleRemoveSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleRemoveSelectedVideo = (index: number) => {
    setSelectedVideos((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImageUrls((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleRemoveExistingVideo = (index: number) => {
    setExistingVideoUrls((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (existingImageUrls.length + selectedImages.length === 0) {
      toast({
        title: "Image Required",
        description: "Please keep or add at least one image for your product.",
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
      setIsUploadingMedia(true);

      const [uploadedImageUrls, uploadedVideoUrls] = await Promise.all([
        Promise.all(selectedImages.map((file) => uploadImageToCloudinary(file))),
        Promise.all(selectedVideos.map((file) => uploadVideoToCloudinary(file))),
      ]);

      const allImageUrls = [...existingImageUrls, ...uploadedImageUrls];
      const allVideoUrls = [...existingVideoUrls, ...uploadedVideoUrls];
      const primaryImageUrl = allImageUrls[0];

      setIsUploadingMedia(false);

      const productData: Partial<Product> = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        category: formData.category,
        weight_per_unit: Number(formData.weight_per_unit),
        rating: formData.rating || 4.0,
        image_url: primaryImageUrl,
        image_urls: allImageUrls.length ? allImageUrls : undefined,
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

      console.log("Updating product data:", productData);

      const response = await UpdateProduct(product.id!, productData);

      if (response.success) {
        toast({
          title: "Market Item Updated",
          description: "Your market item has been successfully updated.",
        });

        // Invalidate and refetch products query
        queryClient.invalidateQueries({ queryKey: ["products"] });
        //Refetch farmer stats
        queryClient.invalidateQueries({ queryKey: ["farmer-stats"] });

        onClose();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Failed to Update Market Item",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsUploadingMedia(false);
    }
  };

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
            selectedImages={selectedImages}
            selectedVideos={selectedVideos}
            existingImageUrls={existingImageUrls}
            existingVideoUrls={existingVideoUrls}
            onAddImages={handleAddImages}
            onAddVideos={handleAddVideos}
            onRemoveSelectedImage={handleRemoveSelectedImage}
            onRemoveSelectedVideo={handleRemoveSelectedVideo}
            onRemoveExistingImage={handleRemoveExistingImage}
            onRemoveExistingVideo={handleRemoveExistingVideo}
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
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isUploadingMedia
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
