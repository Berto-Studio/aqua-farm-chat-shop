import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Package, Pencil, Plus, Trash } from "lucide-react";
import AddProductForm from "@/components/farmers/AddProductForm";
import { useProducts } from "@/hooks/useProducts";

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: products = [], isLoading, error } = useProducts();

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const title = product.title?.toLowerCase() || "";
        const category = product.category?.toLowerCase() || "";
        const query = searchTerm.toLowerCase();

        return title.includes(query) || category.includes(query);
      }),
    [products, searchTerm]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products Management</h1>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:max-w-4xl max-h-[95dvh] overflow-y-auto p-0">
            {/* Reuse farmer flow so admin creation uses identical fields + payload mapping */}
            <AddProductForm onClose={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-md">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Age</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading products...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && error && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-destructive">
                  {error.message || "Failed to load products"}
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !error && filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !error &&
              filteredProducts.map((product) => {
                const productAge =
                  product.animal_stage === 0
                    ? "young"
                    : product.animal_stage === 1
                    ? "mature"
                    : "N/A";

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                        <img
                          src={
                            product.image_url ||
                            (typeof product.image === "string" ? product.image : "")
                          }
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {productAge}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${Number(product.price).toFixed(2)}
                      {product.discount_percentage && (
                        <span className="text-red-500 text-xs ml-2">
                          -{product.discount_percentage}%
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{product.quantity} units</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="ghost">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
