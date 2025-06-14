
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Trash, Eye, MoreHorizontal, Package } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProducts } from "@/hooks/useProducts";
import { DeleteProduct, DeleteAllProducts } from "@/services/products";
import { Product } from "@/types/product";

export default function ProductsList() {
  const { data: products, isLoading, error, refetch } = useProducts();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const { toast } = useToast();

  const handleDeleteProduct = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await DeleteProduct(id);
      if (response.success) {
        toast({
          title: "Product Deleted",
          description: "Product has been successfully deleted.",
        });
        refetch();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAllProducts = async () => {
    setDeletingAll(true);
    try {
      const response = await DeleteAllProducts();
      if (response.success) {
        toast({
          title: "All Products Deleted",
          description: "All products have been successfully deleted.",
        });
        refetch();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: "Delete All Failed",
        description: error instanceof Error ? error.message : "Failed to delete all products",
        variant: "destructive",
      });
    } finally {
      setDeletingAll(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Error loading products: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No products found. Add your first product to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Products ({products.length})</h3>
        {products.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteAllProducts}
            disabled={deletingAll}
          >
            {deletingAll ? "Deleting..." : "Delete All"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product: Product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base line-clamp-2">{product.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Product
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteProduct(product.id!)}
                      disabled={deletingId === product.id}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      {deletingId === product.id ? "Deleting..." : "Delete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {product.category}
                  </Badge>
                  {product.animal_stage !== undefined && (
                    <Badge variant="secondary">
                      {product.animal_stage === 0 ? "Young" : "Mature"}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-green-600">
                      GHS {product.price.toFixed(2)}
                    </p>
                    {product.discount_percentage && (
                      <p className="text-xs text-muted-foreground">
                        {product.discount_percentage}% off
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{product.quantity} units</p>
                    <p className="text-xs text-muted-foreground">
                      {product.weight_per_unit} per unit
                    </p>
                  </div>
                </div>

                {product.rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
