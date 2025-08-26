import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash, Package, AlertTriangle } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { DeleteProduct, DeleteAllProducts } from "@/services/products";
import { Product } from "@/types/product";
import EditProductForm from "./EditProductForm";
import { ModalMessage } from "@/components/ui/modalMessage";
import { useQueryClient } from "@tanstack/react-query";

export default function ProductsList() {
  const { data: products, isLoading, error, refetch } = useProducts();
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<
    string | number | null
  >(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDeleteProduct = async (id: string | number) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    setShowDeleteModal(false);
    setDeletingId(productToDelete);
    try {
      const response = await DeleteProduct(productToDelete);
      if (response.success) {
        toast({
          title: "Market Item Deleted",
          description: "Market item has been successfully deleted.",
        });
        await queryClient.invalidateQueries({ queryKey: ["products"] });
        await queryClient.refetchQueries({ queryKey: ["farmer-stats"] });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete market item",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
      setProductToDelete(null);
    }
  };

  const handleDeleteAllProducts = () => {
    setShowDeleteAllModal(true);
  };

  const confirmDeleteAllProducts = async () => {
    setShowDeleteAllModal(false);
    setDeletingAll(true);
    try {
      const response = await DeleteAllProducts();
      if (response.success) {
        toast({
          title: "All Market Items Deleted",
          description: "All market items have been successfully deleted.",
        });
        refetch();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: "Delete All Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete all market items",
        variant: "destructive",
      });
    } finally {
      setDeletingAll(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleCloseEdit = () => {
    setEditingProduct(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Error loading products: {error.message}
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (editingProduct) {
    return (
      <EditProductForm product={editingProduct} onClose={handleCloseEdit} />
    );
  }

  if (!products || products?.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            No market items found. Add your first market item to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Market Items ({products?.length || 0})
        </h3>
        {products && products?.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteAllProducts}
            disabled={deletingAll}
          >
            {deletingAll ? "Deleting..." : "Delete All Market Items"}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Weight/Unit</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {product.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-green-600">
                        GHS {product.price.toFixed(2)}
                      </p>
                      {product.discount_percentage && (
                        <p className="text-xs text-muted-foreground">
                          {product.discount_percentage}% off
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{product.quantity} units</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{product.weight_per_unit}</p>
                  </TableCell>
                  <TableCell>
                    {product.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-medium">
                          {product.rating}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteProduct(product.id!)}
                        disabled={deletingId === product.id}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ModalMessage
        open={showDeleteModal}
        onConfirm={confirmDeleteProduct}
        onCancel={() => setShowDeleteModal(false)}
        title="Delete Market Item"
        message="Are you sure you want to delete this market item? This action cannot be undone and will remove it from your market."
        actionLabel="Delete Item"
        actionVariant="destructive"
        icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
      />

      <ModalMessage
        open={showDeleteAllModal}
        onConfirm={confirmDeleteAllProducts}
        onCancel={() => setShowDeleteAllModal(false)}
        title="Delete All Market Items"
        message="Are you sure you want to delete ALL market items? This action cannot be undone and will remove all items from your market."
        actionLabel="Delete All Items"
        actionVariant="destructive"
        icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
      />
    </div>
  );
}
