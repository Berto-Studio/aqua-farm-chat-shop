
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { CreateProduct } from "@/services/products";
import ProductBasicInfo from "./ProductBasicInfo";
import ProductPricingInfo from "./ProductPricingInfo";
import ProductCategoryFields from "./ProductCategoryFields";
import ProductImageUpload from "./ProductImageUpload";
import { Product } from "@/types/product";

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

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
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
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setFormData(prev => ({ ...prev, image: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedImage) {
      toast({
        title: "Image Required",
        description: "Please select an image for your product.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const productData: Product = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        category: formData.category,
        image: selectedImage,
        weight_per_unit: Number(formData.weight_per_unit),
        rating: formData.rating || 4.0,
        discount_percentage: formData.discount_percentage ? Number(formData.discount_percentage) : undefined,
        animal_type: formData.animal_type ? Number(formData.animal_type) : undefined,
        animal_stage: formData.animal_stage ? Number(formData.animal_stage) : undefined,
        is_alive: formData.category === "Live Stock" || formData.category === "Fish",
        is_fresh: formData.category === "Vegetables" || formData.category === "Fruits",
      };

      console.log("Submitting product data:", productData);

      const response = await CreateProduct(productData);

      if (response.success) {
        toast({
          title: "Product Added",
          description: "Your product has been successfully added.",
        });
        onClose();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Failed to Add Product",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Add New Product</CardTitle>
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
              {isLoading ? "Adding Product..." : "Add Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
