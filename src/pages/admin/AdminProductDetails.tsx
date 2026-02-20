import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Package, Star, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { normalizeCategoryName } from "@/constants/categories";
import {
  getProductImageUrls,
  getProductPrimaryImageUrl,
  getProductVideoUrls,
} from "@/lib/productMedia";

export default function AdminProductDetails() {
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
          <CardContent className="p-6 text-muted-foreground">Loading product details...</CardContent>
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

  const quantity = Number(product.quantity) || 0;
  const imageUrls = getProductImageUrls(product);
  const videoUrls = getProductVideoUrls(product);
  const productImage = getProductPrimaryImageUrl(product);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.title}</h1>
            <p className="text-sm text-muted-foreground">
              Product ID: {product.id}
            </p>
          </div>
        </div>

        <Button onClick={() => navigate(`/admin/products/${product.id}/edit`)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Product
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-square w-full bg-muted">
                {productImage ? (
                  <img
                    src={productImage}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Package className="h-10 w-10" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {imageUrls.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Images ({imageUrls.length})</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2">
                {imageUrls.map((url, index) => (
                  <div key={`${url}-${index}`} className="aspect-square overflow-hidden rounded-md border">
                    <img
                      src={url}
                      alt={`${product.title} media ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {videoUrls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Videos ({videoUrls.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {videoUrls.map((url, index) => (
                  <div key={`${url}-${index}`} className="space-y-2">
                    <video
                      src={url}
                      controls
                      className="w-full rounded-md border bg-black/5"
                    />
                    <p className="flex items-center text-xs text-muted-foreground">
                      <Video className="mr-1 h-3 w-3" />
                      Video {index + 1}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {normalizeCategoryName(product.category)}
              </Badge>
              {product.discount_percentage ? (
                <Badge variant="secondary">
                  {product.discount_percentage}% Discount
                </Badge>
              ) : null}
              <Badge variant="outline">
                {quantity > 0 ? `${quantity} in stock` : "Out of stock"}
              </Badge>
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Price
                </p>
                <p className="mt-1 text-xl font-bold">
                  ${Number(product.price).toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Weight Per Unit
                </p>
                <p className="mt-1 text-xl font-bold">{product.weight_per_unit}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Category Type
                </p>
                <p className="mt-1 text-xl font-bold">
                  {product.is_alive
                    ? "Live Product"
                    : product.is_fresh
                    ? "Fresh Product"
                    : "Standard Product"}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Rating
                </p>
                <p className="mt-1 flex items-center text-xl font-bold">
                  <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {product.rating || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
