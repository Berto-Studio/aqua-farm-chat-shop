import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { X, Package } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { CreateProduct } from "@/services/products";
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

interface AddProductFormProps {
  onClose: () => void;
}

export default function AddProductForm({ onClose }: AddProductFormProps) {
  const [formData, setFormData] = useState<Product>({
    title: "",
    description: "",
    category: "Live Stock",
    price: 0,
    quantity: 0,
    weight_per_unit: 0,
    rating: 4.0,
    discount_percentage: 0,
    animal_type: undefined,
    animal_stage: undefined,
    is_alive: false,
    is_fresh: false,
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedImages.length === 0) {
      toast({
        title: "Image Required",
        description: "Please add at least one image for your product.",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmCreateProduct = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);
    setIsUploadingMedia(true);

    try {
      // Upload media to Cloudinary first
      const [uploadedImageUrls, uploadedVideoUrls] = await Promise.all([
        Promise.all(selectedImages.map((file) => uploadImageToCloudinary(file))),
        Promise.all(selectedVideos.map((file) => uploadVideoToCloudinary(file))),
      ]);

      const primaryImageUrl = uploadedImageUrls[0];

      setIsUploadingMedia(false);

      // Prepare product data with image URL
      const productData: Product = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        category: formData.category,
        image: primaryImageUrl,
        image_url: primaryImageUrl,
        image_urls: uploadedImageUrls,
        video_urls: uploadedVideoUrls,
        weight_per_unit: Number(formData.weight_per_unit),
        rating: formData.rating || 4.0,
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

      console.log("Submitting product data with image URL:", productData);

      const response = await CreateProduct(productData);

      if (response.success) {
        toast({
          title: "Market Item Created",
          description: "Your market item has been successfully added.",
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
      console.error("Error adding product:", error);
      toast({
        title: "Failed to Create Market Item",
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
        <CardTitle>Add New Market Item</CardTitle>
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
            onAddImages={handleAddImages}
            onAddVideos={handleAddVideos}
            onRemoveSelectedImage={handleRemoveSelectedImage}
            onRemoveSelectedVideo={handleRemoveSelectedVideo}
            onRemoveExistingImage={() => {}}
            onRemoveExistingVideo={() => {}}
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
                ? "Creating Market Item..."
                : "Create Market Item"}
            </Button>
          </div>
        </form>
      </CardContent>

      <ModalMessage
        open={showConfirmModal}
        onConfirm={confirmCreateProduct}
        onCancel={() => setShowConfirmModal(false)}
        title="Create Market Item"
        message="Are you sure you want to add this item to your market? This will make it visible to potential buyers."
        actionLabel="Create Item"
        actionVariant="default"
        icon={<Package className="w-5 h-5 text-primary" />}
      />
    </Card>
  );
}
