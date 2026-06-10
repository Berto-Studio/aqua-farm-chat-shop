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
import { useRequireAuthAction } from "@/hooks/useRequireAuthAction";

interface ProductCardProps {
  product: Product;
  size?: "default" | "sm";
}

export default function ProductCard({
  product,
  size = "default",
}: ProductCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const requireAuthAction = useRequireAuthAction();
  const isSmall = size === "sm";

  const imageRatio = isSmall ? 1 : 4 / 3;
  const contentPadding = isSmall ? "p-2 space-y-2" : "p-2 space-y-3";
  const titleClass = isSmall
    ? "text-xs font-semibold line-clamp-2"
    : "font-semibold line-clamp-2";

  const descriptionClass = isSmall
    ? "text-xs text-muted-foreground line-clamp-1"
    : "text-sm text-muted-foreground line-clamp-2";

  const buttonClass = isSmall ? "h-8 text-xs" : "";

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
      product_id: Number(product.id),
      quantity: 1,
    };

    if (
      !requireAuthAction({
        title: "Login required",
        description:
          "Please login or register to add this product to your cart.",
      })
    ) {
      return;
    }

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
    <Card className="group flex h-full w-full flex-col justify-between overflow-hidden border shadow-sm transition-all duration-300 hover:shadow-lg">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative overflow-hidden bg-muted">
          <AspectRatio ratio={imageRatio}>
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

        <CardContent className={contentPadding}>
          <div className="space-y-1">
            <h3
              className={`${titleClass} text-card-foreground group-hover:text-primary transition-colors`}
            >
              {product.title}
            </h3>
          </div>

          <p className={descriptionClass}>{product.description}</p>

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

            <div className="items-center text-amber-500 hidden md:flex">
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
          className={`w-full gap-2 group-hover:bg-primary/90 transition-colors ${buttonClass}`}
          onClick={AddCart}
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
