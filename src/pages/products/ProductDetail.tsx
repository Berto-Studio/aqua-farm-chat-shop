import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  ShoppingCart,
  Star,
  Package,
  Ruler,
  AlertCircle,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { getProductById } from "@/data/products";

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const product = getProductById(productId || "");
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-8">
          Sorry, we couldn't find the product you're looking for.
        </p>
        <Button asChild>
          <Link to="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Products
          </Link>
        </Button>
      </div>
    );
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.price);

  const discountedPrice = product.discount
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(product.price * (1 - product.discount / 100))
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/products"
          className="inline-flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to products
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <AspectRatio ratio={4 / 3}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </AspectRatio>
        </div>

        <div>
          <div className="flex gap-2 mb-2">
            <Badge variant="secondary" className="capitalize">
              {product.category}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {product.age}
            </Badge>
            {product.discount && (
              <Badge variant="destructive">{product.discount}% OFF</Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          <div className="flex items-center mb-4">
            <div className="flex items-center text-amber-500 mr-2">
              <Star className="w-5 h-5 fill-current" />
              <span className="ml-1 font-medium">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-muted-foreground">
              ({Math.floor(product.rating * 10)} reviews)
            </span>
          </div>

          <div className="mb-4">
            {product.discount ? (
              <div className="flex items-center">
                <span className="text-muted-foreground line-through text-sm mr-2">
                  {formattedPrice}
                </span>
                <span className="text-2xl font-bold text-primary">
                  {discountedPrice}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold">{formattedPrice}</span>
            )}
          </div>

          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span>
                <strong>Stock:</strong> {product.stock} available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-muted-foreground" />
              <span>
                <strong>Unit:</strong> {product.weightPerUnit}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border rounded-md">
              <button
                onClick={decrementQuantity}
                className="px-3 py-2 border-r hover:bg-gray-100 transition-colors"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-4 py-2">{quantity}</span>
              <button
                onClick={incrementQuantity}
                className="px-3 py-2 border-l hover:bg-gray-100 transition-colors"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>

            <Button className="gap-2 flex-1">
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>

          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-start">
                <AlertCircle className="mr-2 h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    Ordering {product.category} fish?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You will be added to our queue and we will contact you when
                    your order is ready for pickup or delivery.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <Link to="/chat" className="text-primary hover:underline">
              Have questions? Chat with our specialists
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid grid-cols-3 w-full md:w-1/2 lg:w-1/3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="care">Care Guide</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-6">
            <h3 className="font-semibold text-xl mb-4">Product Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium mb-2">Specifications</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Species:{" "}
                    {product.category === "fish"
                      ? "Clarias gariepinus (African Catfish)"
                      : "Oreochromis niloticus (Nile Tilapia)"}
                  </li>
                  <li>
                    Age Group:{" "}
                    {product.age === "young"
                      ? "Juvenile (2-6 months)"
                      : "Adult (6+ months)"}
                  </li>
                  <li>
                    Typical Size:{" "}
                    {product.age === "young" ? "2-6 inches" : "8-12 inches"}
                  </li>
                  <li>Packaging: {product.weightPerUnit}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Farming Information</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Farm-raised in controlled environments</li>
                  <li>Fed with high-quality, nutritious feed</li>
                  <li>Regular health checks and testing</li>
                  <li>Sustainably farmed with minimal environmental impact</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="care" className="mt-6">
            <h3 className="font-semibold text-xl mb-4">Care Guide</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Water Parameters</h4>
                <p>
                  Maintain water temperature between 25-30°C (77-86°F) for
                  optimal growth. Keep pH levels between 6.5 and 8.0.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Feeding</h4>
                <p>
                  Feed 2-3 times daily with high-quality fish feed at
                  approximately 3-5% of fish body weight.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Space Requirements</h4>
                <p>
                  For {product.category} farming, allow at least 2-3 square feet
                  of pond space per adult fish.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Water Quality Management</h4>
                <p>
                  Regular water changes (10-15% weekly) and proper filtration
                  are essential for maintaining healthy fish.
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <h3 className="font-semibold text-xl mb-4">Customer Reviews</h3>
            <div className="space-y-6">
              <div className="border-b pb-4">
                <div className="flex items-center mb-2">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating) ? "fill-current" : ""
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-muted-foreground">
                    John D. - April 30, 2025
                  </span>
                </div>
                <p>
                  Excellent quality fish! They arrived in perfect health and are
                  growing exceptionally well in my farm.
                </p>
              </div>
              <div className="border-b pb-4">
                <div className="flex items-center mb-2">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < product.rating - 0.5 ? "fill-current" : ""
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-muted-foreground">
                    Sarah M. - April 25, 2025
                  </span>
                </div>
                <p>
                  Very happy with my purchase. The fish were all healthy and the
                  delivery was prompt. I'll definitely be ordering more!
                </p>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < product.rating - 1 ? "fill-current" : ""
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-muted-foreground">
                    Michael P. - April 18, 2025
                  </span>
                </div>
                <p>
                  Great value for money. My pond is thriving with these fish and
                  they're growing faster than expected.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
