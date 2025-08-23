import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Star, ShoppingCart } from "lucide-react";
import { Product } from "@/types/product";
import { Link } from "react-router-dom";
import { AddToCart } from "@/services/cart";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.price);

  const discountedPrice = product.discount_percentage
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(product.price * (1 - product.discount_percentage / 100))
    : null;

  const AddCart = async () => {
    const cartData: AddToCartPayload = {
      product_id: product.id,
      quantity: 1,
    };

    try {
      const response = await AddToCart(cartData);

      if (response.success) {
        toast({
          title: "Success",
          description: "Cart successfully added.",
          variant: "success",
        });
        // Invalidate and refetch products query
        queryClient.invalidateQueries({ queryKey: ["carts"] });
      } else {
        toast({
          title: "Error",
          description: "Error adding cart.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  return (
    <Card className="group overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 w-[300px] flex flex-col justify-between">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative overflow-hidden bg-muted">
          <AspectRatio ratio={4 / 3}>
            <img
              src={
                product.image_url ||
                (typeof product.image === "string" ? product.image : "")
              }
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </AspectRatio>
          <div className="absolute top-2 left-2 flex flex-col items-start gap-2">
            {product.discount_percentage && (
              <Badge className=" bg-destructive text-destructive-foreground">
                -{product.discount_percentage}% OFF
              </Badge>
            )}
            <Badge variant="outline" className="text-xs capitalize bg-gray-100">
              {product.category}
            </Badge>
          </div>
        </div>

        <CardContent className="p-2 space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
              {product.title}
            </h3>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {product.discount_percentage ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground line-through">
                    {formattedPrice}
                  </span>
                  <span className="font-bold text-primary">
                    {discountedPrice}
                  </span>
                </div>
              ) : (
                <span className="font-bold text-card-foreground">
                  {formattedPrice}
                </span>
              )}
            </div>

            <div className="flex items-center text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="ml-1 text-sm font-medium">
                {product.rating?.toFixed(1) || "4.0"}
              </span>
            </div>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="p-2 pt-0">
        <Button
          className="w-full gap-2 group-hover:bg-primary/90 transition-colors"
          onClick={AddCart}
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
