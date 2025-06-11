
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { X, Upload } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import AddProduct from "@/services/addProduct";

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

  const getAgeOptions = () => {
    const selectedCategory = categories.find(cat => cat.id.toString() === formData.category);
    const categoryName = selectedCategory?.name?.toLowerCase();
    
    if (categoryName === "livestock" || categoryName === "live stock") {
      return [
        { value: "1", label: "Young" },
        { value: "0", label: "Mature" }
      ];
    } else if (categoryName === "fish") {
      return [
        { value: "1", label: "Fingerlings" },
        { value: "0", label: "Mature" }
      ];
    } else {
      return [
        { value: "1", label: "Fresh" },
        { value: "0", label: "Not Fresh" }
      ];
    }
  };

  const getAnimalStageOptions = () => {
    return [
      { value: "0", label: "Young" },
      { value: "1", label: "Mature" }
    ];
  };

  const shouldShowAnimalStage = () => {
    const selectedCategory = categories.find(cat => cat.id.toString() === formData.category);
    const categoryName = selectedCategory?.name?.toLowerCase();
    return categoryName === "livestock" || categoryName === "live stock";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const selectedCategory = categories.find(cat => cat.id.toString() === formData.category);
      const categoryName = selectedCategory?.name?.toLowerCase();
      
      // Prepare the product data
      const productData = {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                placeholder="Fresh Tomatoes"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => handleInputChange("category", value)} disabled={categoriesLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your product..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (GHS)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="25.00"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                placeholder="100"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weightPerUnit">Weight per Unit</Label>
              <Input
                id="weightPerUnit"
                type="number"
                step="0.01"
                placeholder="1.5"
                value={formData.weightPerUnit}
                onChange={(e) => handleInputChange("weightPerUnit", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">
                {formData.category && categories.find(cat => cat.id.toString() === formData.category)?.name?.toLowerCase() === "fish" 
                  ? "Fish Stage" 
                  : formData.category && (categories.find(cat => cat.id.toString() === formData.category)?.name?.toLowerCase().includes("livestock") || categories.find(cat => cat.id.toString() === formData.category)?.name?.toLowerCase().includes("live stock"))
                  ? "Animal Stage"
                  : "Freshness"}
              </Label>
              <Select onValueChange={(value) => handleInputChange("age", value)} disabled={!formData.category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  {getAgeOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {shouldShowAnimalStage() && (
              <div className="space-y-2">
                <Label htmlFor="animalStage">Animal Maturity</Label>
                <Select onValueChange={(value) => handleInputChange("animalStage", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select maturity" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAnimalStageOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                placeholder="10"
                value={formData.discount}
                onChange={(e) => handleInputChange("discount", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Product Image</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600">
                {selectedImage ? selectedImage.name : "Click to upload product image"}
              </p>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange}
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Button type="button" variant="outline" className="mt-2">
                  Choose File
                </Button>
              </label>
            </div>
          </div>

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
