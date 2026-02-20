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
import {
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash,
  X,
} from "lucide-react";
import AddProductForm from "@/components/farmers/AddProductForm";
import { useProducts } from "@/hooks/useProducts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { normalizeCategoryName } from "@/constants/categories";

type StockFilter = "all" | "in-stock" | "low-stock" | "out-of-stock";
type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "stock-asc"
  | "stock-desc";
type ViewMode = "table" | "grid";

const LOW_STOCK_THRESHOLD = 10;

const getStockStatus = (quantity: number): Exclude<StockFilter, "all"> => {
  if (quantity <= 0) return "out-of-stock";
  if (quantity <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
};

const stockLabel: Record<Exclude<StockFilter, "all">, string> = {
  "in-stock": "In Stock",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
};

const stockBadgeClass: Record<Exclude<StockFilter, "all">, string> = {
  "in-stock": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "low-stock": "bg-amber-50 text-amber-700 border-amber-200",
  "out-of-stock": "bg-rose-50 text-rose-700 border-rose-200",
};

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const { data: products = [], isLoading, error } = useProducts();

  const categoryOptions = useMemo(() => {
    const uniqueCategories = new Set<string>();
    products.forEach((product) => {
      const category = normalizeCategoryName(product.category);
      if (category) uniqueCategories.add(category);
    });
    return Array.from(uniqueCategories).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const title = product.title?.toLowerCase() || "";
      const category = normalizeCategoryName(product.category);
      const stockState = getStockStatus(Number(product.quantity) || 0);

      const matchesSearch =
        query.length === 0 ||
        title.includes(query) ||
        category.toLowerCase().includes(query);
      const matchesCategory =
        categoryFilter === "all" || category === categoryFilter;
      const matchesStock = stockFilter === "all" || stockState === stockFilter;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, categoryFilter, stockFilter]);

  const displayedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    sorted.sort((a, b) => {
      const aName = a.title?.toLowerCase() || "";
      const bName = b.title?.toLowerCase() || "";
      const aPrice = Number(a.price) || 0;
      const bPrice = Number(b.price) || 0;
      const aStock = Number(a.quantity) || 0;
      const bStock = Number(b.quantity) || 0;

      switch (sortOption) {
        case "name-desc":
          return bName.localeCompare(aName);
        case "price-asc":
          return aPrice - bPrice;
        case "price-desc":
          return bPrice - aPrice;
        case "stock-asc":
          return aStock - bStock;
        case "stock-desc":
          return bStock - aStock;
        case "name-asc":
        default:
          return aName.localeCompare(bName);
      }
    });
    return sorted;
  }, [filteredProducts, sortOption]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    categoryFilter !== "all" ||
    stockFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStockFilter("all");
    setSortOption("name-asc");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage inventory, filter products quickly, and switch between table
            and grid views.
          </p>
        </div>

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

      <Card className="border shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_220px_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by product name or category"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={stockFilter}
              onValueChange={(value) => setStockFilter(value as StockFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Stock status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Levels</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOption}
              onValueChange={(value) => setSortOption(value as SortOption)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                <SelectItem value="stock-asc">Stock (Low to High)</SelectItem>
                <SelectItem value="stock-desc">Stock (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              Showing {displayedProducts.length} of {products.length} products
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <List className="mr-2 h-4 w-4" />
                Table
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Grid
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === "table" ? (
        <div className="border rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Loading products...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && error && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-destructive">
                    {error.message || "Failed to load products"}
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !error && displayedProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No products match your current filters.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                !error &&
                displayedProducts.map((product) => {
                  const quantity = Number(product.quantity) || 0;
                  const status = getStockStatus(quantity);

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
                          {normalizeCategoryName(product.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${Number(product.price).toFixed(2)}
                        {product.discount_percentage && (
                          <span className="ml-2 text-xs text-red-500">
                            -{product.discount_percentage}%
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{quantity} units</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={stockBadgeClass[status]}>
                          {stockLabel[status]}
                        </Badge>
                      </TableCell>
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
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading &&
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="border shadow-sm">
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-40 rounded-md bg-muted" />
                    <div className="h-4 w-2/3 rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                    <div className="h-4 w-1/3 rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))}

          {!isLoading && error && (
            <Card className="col-span-full border shadow-sm">
              <CardContent className="py-10 text-center text-destructive">
                {error.message || "Failed to load products"}
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && displayedProducts.length === 0 && (
            <Card className="col-span-full border shadow-sm">
              <CardContent className="py-10 text-center text-muted-foreground">
                No products match your current filters.
              </CardContent>
            </Card>
          )}

          {!isLoading &&
            !error &&
            displayedProducts.map((product) => {
              const quantity = Number(product.quantity) || 0;
              const status = getStockStatus(quantity);

              return (
                <Card key={product.id} className="border shadow-sm">
                  <CardContent className="p-4 space-y-4">
                    <div className="h-44 w-full overflow-hidden rounded-md bg-muted">
                      <img
                        src={
                          product.image_url ||
                          (typeof product.image === "string" ? product.image : "")
                        }
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-1 text-base font-semibold">
                          {product.title}
                        </h3>
                        <Badge variant="outline" className="capitalize">
                          {normalizeCategoryName(product.category)}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold">
                          ${Number(product.price).toFixed(2)}
                        </p>
                        <Badge variant="outline" className={stockBadgeClass[status]}>
                          {stockLabel[status]}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {quantity} units available
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button size="sm" variant="outline">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}
