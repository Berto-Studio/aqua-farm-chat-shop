import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { id, name, price, image, category, age, discount, rating, stock } =
    product;

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GHS",
  }).format(price);

  const discountedPrice = discount
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "GHS",
      }).format(price * (1 - discount / 100))
    : null;

  const stockStatus =
    stock > 0 ? (stock > 50 ? "In Stock" : "Low Stock") : "Out of Stock";

  const stockVariant =
    stock > 0 ? (stock > 50 ? "success" : "secondary") : "destructive";

  const stockStatus =
    stock > 0 ? (stock > 50 ? "In Stock" : "Low Stock") : "Out of Stock";

  const stockVariant =
    stock > 0 ? (stock > 50 ? "default" : "secondary") : "destructive";

  return (
    <Card className="overflow-hidden h-[450px] flex flex-col transition-transform hover:scale-[1.02]">
      <Link to={`/products/${id}`} className="relative">
        <div className="h-48 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          <Badge variant="secondary" className="capitalize">
            {category}
          </Badge>
          <Badge variant="outline" className="bg-white capitalize">
            {age}
          </Badge>
          {discount && <Badge variant="destructive">{discount}% OFF</Badge>}
        </div>
      </Link>
      <CardContent className="pt-4 flex-grow">
        <Link to={`/products/${id}`}>
          <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            {discount ? (
              <div className="flex flex-col">
                <span className="text-muted-foreground line-through text-sm">
                  {formattedPrice}
                </span>
                <span className="font-bold text-primary">
                  {discountedPrice}
                </span>
              </div>
            ) : (
              <span className="font-bold">{formattedPrice}</span>
            )}
          </div>
          <div className="flex items-center text-amber-500">
            <span className="text-sm mr-1">{rating.toFixed(1)}</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
          </div>
        </div>
        <div className="mt-2">
          <Badge variant={stockVariant} className="text-xs">
            {stockStatus} ({stock})
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full gap-2" disabled={stock === 0}>
          <ShoppingCart className="h-4 w-4" />
          Buy now
        </Button>
      </CardFooter>
    </Card>
  );
}
