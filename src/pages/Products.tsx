
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowDownUp, Filter } from "lucide-react";
import { products as allProducts } from "@/data/products";
import ProductGrid from "@/components/product/ProductGrid";
import SearchDropdown from "@/components/layout/SearchDropdown";
import CategoryFilter from "@/components/product/CategoryFilter";

const ITEMS_PER_PAGE = 8;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loadedItems, setLoadedItems] = useState(ITEMS_PER_PAGE);
  
  // Get category from URL params
  const categoryParam = searchParams.get("category") || "all";
  
  // Filter states
  const [sortOption, setSortOption] = useState("featured");

  // Filter products by category
  const filteredProducts = allProducts.filter(product => {
    if (categoryParam === "all") return true;
    return product.category === categoryParam;
  });

  // Sort products based on selected option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "featured":
      default:
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    }
  });

  // Products to display after pagination
  const displayedProducts = sortedProducts.slice(0, loadedItems);
  
  // Handle category change
  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", category);
    setSearchParams(params);
  };

  // Load more products
  const handleLoadMore = () => {
    setLoadedItems(prev => prev + ITEMS_PER_PAGE);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Browse our selection of fish and agricultural products</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3">
            <SearchDropdown />
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <ArrowDownUp className="h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category filters */}
        <CategoryFilter 
          activeCategory={categoryParam} 
          onCategoryChange={handleCategoryChange} 
        />

        {/* Active filters */}
        <div className="flex flex-wrap gap-2">
          {categoryParam !== "all" && (
            <Badge 
              variant="secondary" 
              className="px-3 py-1 capitalize flex items-center gap-1"
            >
              {categoryParam}
              <button 
                className="ml-1 hover:text-destructive" 
                onClick={() => handleCategoryChange("all")}
              >
                ×
              </button>
            </Badge>
          )}
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {displayedProducts.length} of {filteredProducts.length} products
        </div>

        {/* Product grid */}
        <ProductGrid products={displayedProducts} />
          
        {/* Load more button */}
        {loadedItems < filteredProducts.length && (
          <div className="flex justify-center mt-8">
            <Button onClick={handleLoadMore} variant="outline">
              Load More Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
