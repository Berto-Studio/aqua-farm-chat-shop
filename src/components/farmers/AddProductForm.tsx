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
  const { data: categoriesResponse, isLoading: categoriesLoading } =
    useCategories();

  const categories = categoriesResponse?.data || [];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
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
      // Map form data to API request format
      const productRequest: AddProductRequest = {
        title: formData.name,
        description: formData.description,
        price: Number(formData.price),
        type_id: Number(formData.category),
        quantity: Number(formData.stock),
        weight_per_unit: formData.weightPerUnit
          ? Number(formData.weightPerUnit)
          : 1.0,
        animal_stage: formData.animalStage
          ? Number(formData.animalStage)
          : undefined,
        discount_percentage: formData.discount
          ? Number(formData.discount)
          : undefined,
        rating: 4.0,
        image: selectedImage, // Pass the actual file
      };

      // Set livestock/fish specific fields based on category type_id
      // 1=livestock, 2=vegetables, 3=fruits, 4=fish
      const typeId = Number(formData.category);

      if (typeId === 1) {
        // livestock
        productRequest.is_live = true;
        productRequest.is_fresh = false;
      } else if (typeId === 4) {
        // fish
        productRequest.is_live = true;
        productRequest.is_fresh = true;
      } else {
        // vegetables (2) or fruits (3)
        productRequest.is_live = false;
        productRequest.is_fresh = true;
      }

      console.log("Submitting product data:", productRequest);

      const response = await AddProduct(productRequest);

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
