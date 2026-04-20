
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

export default function SearchDropdown() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  
  // Use the backend products data
  const { data: products = [], isLoading } = useProducts();
  const normalizedQuery = query.trim().toLowerCase();
  const hasSearchQuery = normalizedQuery.length > 0;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  const filteredProducts = !hasSearchQuery
    ? []
    : products.filter((product) =>
        product.title.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery)
      );

  const handleSelect = (productId: string) => {
    setOpen(false);
    setQuery("");
    navigate(`/products/${productId}`);
  };

  const handleFocus = () => {
    setOpen(true);
  };
  
  const clearSearch = () => {
    setQuery("");
  };

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products..."
          className="pl-9 pr-8"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={clearSearch}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
          <Command shouldFilter={false}>
            <CommandList>
              {isLoading ? (
                <div className="py-6 text-center text-sm">Loading products...</div>
              ) : !hasSearchQuery ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Start typing to search products.
                </div>
              ) : (
                <>
                  <CommandEmpty>No products found.</CommandEmpty>
                  <CommandGroup heading="Products">
                    {filteredProducts.map((product) => (
                      <CommandItem
                        key={product.id}
                        onSelect={() => handleSelect(String(product.id || ""))}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div className="h-8 w-8 overflow-hidden rounded-sm">
                          <img src={product.image_url || (typeof product.image === 'string' ? product.image : '')} alt={product.title} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{product.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
