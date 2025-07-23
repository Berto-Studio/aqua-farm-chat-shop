import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { UpdateProduct } from "@/services/products";
import { useQueryClient } from "@tanstack/react-query";
import { uploadImageToCloudinary } from "@/services/cloudinary";
import ProductBasicInfo from "./ProductBasicInfo";
import ProductPricingInfo from "./ProductPricingInfo";
import ProductCategoryFields from "./ProductCategoryFields";
import ProductImageUpload from "./ProductImageUpload";
import { Product } from "@/types/product";

interface EditProductFormProps {
  product: Product;
  onClose: () => void;
}

export default function EditProductForm({
  product,
  onClose,
}: EditProductFormProps) {
  const [formData, setFormData] = useState<Product>(product);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categoriesResponse, isLoading: categoriesLoading } =
    useCategories();
  const categories = categoriesResponse?.data || [];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setFormData((prev) => ({ ...prev, image: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = formData.image_url; // Keep existing image URL by default

      // Upload new image to Cloudinary if selected
      if (selectedImage) {
        setIsUploadingImage(true);
        console.log("Uploading new image to Cloudinary...");
        imageUrl = await uploadImageToCloudinary(selectedImage);
        console.log("New image uploaded, URL:", imageUrl);
        setIsUploadingImage(false);
      }

      const productData: Partial<Product> = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        category: formData.category,
        weight_per_unit: Number(formData.weight_per_unit),
        rating: formData.rating || 4.0,
        image_url: imageUrl, // Send URL instead of file
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
          title: "Product Updated",
          description: "Your product has been successfully updated.",
        });

        // Invalidate and refetch products query
        queryClient.invalidateQueries({ queryKey: ["products"] });

        onClose();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Failed to Update Product",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsUploadingImage(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Edit Product</CardTitle>
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
            selectedImage={selectedImage}
            onImageChange={handleImageChange}
            onImageRemove={handleImageRemove}
            currentImageUrl={product.image_url}
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
              {isUploadingImage
                ? "Uploading Image..."
                : isLoading
                ? "Updating Product..."
                : "Update Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
