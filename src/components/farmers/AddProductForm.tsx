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
    image: null,
    animaltype: "",
    is_alive: false,
    is_fresh: false,
    rating: 4.0,
    weight_per_unit: 0,
    animal_stage: 0,
    discount_percentage: 0,
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
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
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
      const selectedCategory = categories.find(
        (c) => c.id.toString() === formData.category
      );

      const productData: Product = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        quantity: formData.quantity,
        category: formData.category,
        image: selectedImage,
        animaltype: formData.animaltype,
        animal_stage: formData.animal_stage,
        weight_per_unit: formData.weight_per_unit?.toString() ?? "0",
        rating: formData.rating || 4.0,
        discount_percentage: formData.discount_percentage || 0,
        is_alive: formData.is_alive,
        is_fresh: formData.is_fresh,
      };

      const response = await CreateProduct(productData);

      if (response.success) {
        toast({
          title: "Product Added",
          description: "Your product has been successfully added.",
          variant: "success",
        });
        onClose();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
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
