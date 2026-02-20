import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProducts } from "@/hooks/useProducts";
import EditProductForm from "@/components/farmers/EditProductForm";

export default function AdminProductEdit() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const { data: products = [], isLoading, error } = useProducts();

  const product = useMemo(
    () => products.find((item) => String(item.id) === String(productId)),
    [products, productId]
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-muted-foreground">Loading product for editing...</CardContent>
        </Card>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" onClick={() => navigate("/admin/products")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        <Card>
          <CardContent className="p-6 text-destructive">
            {error?.message || "Product not found."}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate(`/admin/products/${product.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Product
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-sm text-muted-foreground">{product.title}</p>
        </div>
      </div>

      <EditProductForm
        product={product}
        onClose={() => navigate(`/admin/products/${product.id}`)}
      />
    </div>
  );
}
