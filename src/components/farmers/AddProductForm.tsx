
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import AddProduct, { AddProductRequest } from "@/services/addProduct";
import ProductBasicInfo from "./ProductBasicInfo";
import ProductPricingInfo from "./ProductPricingInfo";
import ProductCategoryFields from "./ProductCategoryFields";
import ProductImageUpload from "./ProductImageUpload";

interface AddProductFormProps {
  onClose: () => void;
}

export default function AddProductForm({ onClose }: AddProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    weightPerUnit: "",
    age: "",
    animalStage: "",
    discount: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { data: categoriesResponse, isLoading: categoriesLoading } = useCategories();

  const categories = categoriesResponse?.data || [];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Reset age when category changes
      if (field === "category") {
        newData.age = "";
      }
      
      return newData;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const selectedCategory = categories.find(cat => cat.id.toString() === formData.category);
      const categoryName = selectedCategory?.name?.toLowerCase();
      
      // Prepare the product data with proper typing
      const productData: AddProductRequest = {
        title: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.stock),
        type_id: parseInt(formData.category),
        weight_per_unit: parseFloat(formData.weightPerUnit) || undefined,
        discount_percentage: formData.discount ? parseFloat(formData.discount) : undefined,
        animal_stage: formData.animalStage || undefined,
        image: selectedImage || undefined,
      };

      // Set is_alive or is_fresh based on category and age
      if (categoryName === "livestock" || categoryName === "live stock") {
        productData.is_alive = parseInt(formData.age);
      } else if (categoryName === "fish") {
        productData.is_alive = parseInt(formData.age);
      } else {
        productData.is_fresh = parseInt(formData.age);
      }

      console.log("Adding product:", productData);
      
      const response = await AddProduct(productData);
      
      if (response.success) {
        toast({
          title: "Product Added Successfully!",
          description: "Your product is now available for sale.",
        });
        onClose();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Failed to Add Product",
        description: error instanceof Error ? error.message : "Please try again later.",
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
          />

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
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
