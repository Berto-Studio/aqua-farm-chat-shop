import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  MessageCircle,
  Package,
  Ruler,
  ShoppingCart,
  Star,
} from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  getProductCareGuideSections,
  getProductDetailsSections,
} from "@/lib/productDetailContent";
import {
  getProductImageUrls,
  getProductPrimaryImageUrl,
} from "@/lib/productMedia";
import {
  GetProduct,
  GetProductFeedback,
  UpsertProductFeedback,
} from "@/services/products";
import { useUserStore } from "@/store/store";
import {
  Product,
  ProductFeedback,
  ProductFeedbackSummary,
} from "@/types/product";
import { AddToCart } from "@/services/cart";

const EMPTY_FEEDBACK_SUMMARY: ProductFeedbackSummary = {
  average_rating: 0,
  total_feedback: 0,
};

const formatFeedbackDate = (value?: string) => {
  if (!value) return "Recently";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
};

const FeedbackStars = ({
  rating,
  className = "h-4 w-4",
}: {
  rating: number;
  className?: string;
}) => (
  <div className="flex items-center text-amber-500">
    {[...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`${className} ${index < Math.round(rating) ? "fill-current" : ""}`}
      />
    ))}
  </div>
);

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");

  const [feedbackItems, setFeedbackItems] = useState<ProductFeedback[]>([]);
  const [feedbackSummary, setFeedbackSummary] =
    useState<ProductFeedbackSummary>(EMPTY_FEEDBACK_SUMMARY);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [draftRating, setDraftRating] = useState(5);
  const [draftFeedback, setDraftFeedback] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const fetchProductAndFeedback = async () => {
      if (!id) {
        setError("Product ID not found");
        setIsLoading(false);
        setIsFeedbackLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setIsFeedbackLoading(true);
        setError(null);
        setFeedbackError(null);

        const productResponse = await GetProduct(id);
        if (!productResponse.success || !productResponse.data) {
          if (!isCancelled) {
            setProduct(null);
            setError(productResponse.message || "Product not found");
            setFeedbackItems([]);
            setFeedbackSummary(EMPTY_FEEDBACK_SUMMARY);
          }
          return;
        }

        if (isCancelled) return;
        setProduct(productResponse.data);

        const feedbackResponse = await GetProductFeedback(id, { per_page: 20 });
        if (isCancelled) return;

        if (feedbackResponse.success) {
          setFeedbackItems(feedbackResponse.data);
          setFeedbackSummary(feedbackResponse.summary);
          setFeedbackError(null);
        } else {
          setFeedbackItems([]);
          setFeedbackSummary(EMPTY_FEEDBACK_SUMMARY);
          setFeedbackError(feedbackResponse.message);
        }
      } catch (fetchError) {
        if (!isCancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load product",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
          setIsFeedbackLoading(false);
        }
      }
    };

    void fetchProductAndFeedback();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  const productImages = useMemo(() => {
    if (!product) return [];

    const primaryImage = getProductPrimaryImageUrl(product);
    const galleryImages = getProductImageUrls(product);

    return [...new Set([primaryImage, ...galleryImages].filter(Boolean))];
  }, [product]);

  const detailSections = useMemo(
    () => (product ? getProductDetailsSections(product) : []),
    [product],
  );

  const careGuideSections = useMemo(
    () => (product ? getProductCareGuideSections(product) : []),
    [product],
  );

  useEffect(() => {
    if (!productImages.length) {
      setSelectedImage("");
      return;
    }

    setSelectedImage((currentImage) =>
      currentImage && productImages.includes(currentImage)
        ? currentImage
        : productImages[0],
    );
  }, [productImages]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="mb-4 text-2xl font-bold">Product Not Found</h1>
        <p className="mb-8">
          {error || "Sorry, we couldn't find the product you're looking for."}
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
    if (quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  //Add to cart handler
  const AddCart = async () => {
    const cartData: AddToCartPayload = {
      product_id: Number(product.id),
      quantity: quantity,
    };

    if (!isLoggedIn) {
      router("/login");
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

  const handleFeedbackSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!id) return;

    if (!isLoggedIn) {
      toast({
        title: "Login required",
        description: "Sign in first to leave feedback for this product.",
        variant: "destructive",
      });
      return;
    }

    const trimmedFeedback = draftFeedback.trim();
    if (trimmedFeedback.length < 3) {
      toast({
        title: "Feedback too short",
        description: "Please write at least 3 characters.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmittingFeedback(true);
      const response = await UpsertProductFeedback(id, {
        rating: draftRating,
        feedback: trimmedFeedback,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      const savedFeedback = response.data;
      setFeedbackItems((currentItems) => [
        savedFeedback,
        ...currentItems.filter(
          (item) =>
            item.id !== savedFeedback.id &&
            item.user_id !== savedFeedback.user_id,
        ),
      ]);
      setFeedbackSummary(response.summary);
      setProduct((currentProduct) =>
        currentProduct
          ? {
              ...currentProduct,
              rating:
                response.summary.total_feedback > 0
                  ? response.summary.average_rating
                  : currentProduct.rating,
            }
          : currentProduct,
      );
      setDraftFeedback("");

      toast({
        title: "Feedback saved",
        description: response.message,
        variant: "success",
      });
    } catch (submitError) {
      toast({
        title: "Unable to save feedback",
        description:
          submitError instanceof Error
            ? submitError.message
            : "Something went wrong while saving your feedback.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

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

  const productAge =
    product.animal_stage === 0
      ? "young"
      : product.animal_stage === 1
        ? "mature"
        : "general";

  const displayedRating =
    feedbackSummary.total_feedback > 0
      ? feedbackSummary.average_rating
      : Number(product.rating || 0);
  const reviewCount =
    feedbackSummary.total_feedback > 0 ? feedbackSummary.total_feedback : 0;

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

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="grid gap-4 md:grid-cols-[88px_minmax(0,1fr)] md:items-start">
          {productImages.length > 1 ? (
            <div className="order-2 flex gap-3 overflow-x-auto pb-1 md:order-1 md:flex-col md:overflow-visible">
              {productImages.map((imageUrl, index) => {
                const isActive = imageUrl === selectedImage;

                return (
                  <button
                    key={`${imageUrl}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(imageUrl)}
                    className={`shrink-0 overflow-hidden rounded-lg border bg-white transition-all ${
                      isActive
                        ? "border-primary ring-2 ring-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                    aria-label={`View product image ${index + 1}`}
                  >
                    <div className="h-20 w-20">
                      <img
                        src={imageUrl}
                        alt={`${product.title} thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="order-1 overflow-hidden rounded-lg bg-white shadow-sm md:order-2">
            <AspectRatio ratio={4 / 3}>
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
                  No image available
                </div>
              )}
            </AspectRatio>
          </div>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">
              {product.category}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {productAge}
            </Badge>
            {product.discount_percentage ? (
              <Badge variant="destructive">
                {product.discount_percentage}% OFF
              </Badge>
            ) : null}
          </div>

          <h1 className="mb-2 text-3xl font-bold">{product.title}</h1>

          <div className="mb-4 flex items-center">
            <div className="mr-2 flex items-center text-amber-500">
              <Star className="h-5 w-5 fill-current" />
              <span className="ml-1 font-medium">
                {displayedRating.toFixed(1)}
              </span>
            </div>
            <span className="text-muted-foreground">
              ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>

          <div className="mb-4">
            {product.discount_percentage ? (
              <div className="flex items-center">
                <span className="mr-2 text-sm text-muted-foreground line-through">
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

          <div className="mb-6 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span>
                <strong>Stock:</strong> {product.quantity} available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-muted-foreground" />
              <span>
                <strong>Unit:</strong> {product.weight_per_unit}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="mb-8 flex items-center gap-4">
            <div className="flex items-center rounded-md border">
              <button
                onClick={decrementQuantity}
                className="border-r px-3 py-2 transition-colors hover:bg-gray-100"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-4 py-2">{quantity}</span>
              <button
                onClick={incrementQuantity}
                className="border-l px-3 py-2 transition-colors hover:bg-gray-100"
                disabled={quantity >= product.quantity}
              >
                +
              </button>
            </div>

            <Button className="flex-1 gap-2" onClick={() => AddCart()}>
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>

          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-start">
                <AlertCircle className="mr-2 mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    Ordering {product.category} products?
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
          <TabsList className="grid w-full grid-cols-3 md:w-1/2 lg:w-1/3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="care">Care Guide</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <h3 className="mb-4 text-xl font-semibold">Product Details</h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {detailSections.map((section) => (
                <div key={section.title}>
                  <h4 className="mb-2 font-medium">{section.title}</h4>
                  <ul className="list-disc space-y-2 pl-5">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="care" className="mt-6">
            <h3 className="mb-4 text-xl font-semibold">Care Guide</h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {careGuideSections.map((section) => (
                <div key={section.title}>
                  <h4 className="mb-2 font-medium">{section.title}</h4>
                  <ul className="list-disc space-y-2 pl-5">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6 space-y-6">
            <div className="flex flex-col gap-4 rounded-lg border bg-card p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold">Customer Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Real feedback saved from the backend for this product.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <FeedbackStars rating={displayedRating} className="h-5 w-5" />
                <div className="text-sm">
                  <p className="font-semibold">
                    {displayedRating.toFixed(1)} / 5
                  </p>
                  <p className="text-muted-foreground">
                    {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-5">
                {isLoggedIn ? (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm font-medium">Your rating</p>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map((ratingValue) => (
                          <Button
                            key={ratingValue}
                            type="button"
                            variant={
                              draftRating === ratingValue
                                ? "default"
                                : "outline"
                            }
                            className="gap-2"
                            onClick={() => setDraftRating(ratingValue)}
                          >
                            <Star className="h-4 w-4" />
                            {ratingValue}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-sm font-medium">Your feedback</p>
                      <Textarea
                        value={draftFeedback}
                        onChange={(event) =>
                          setDraftFeedback(event.target.value)
                        }
                        placeholder="Tell other buyers what stood out about this product..."
                        className="min-h-28"
                      />
                    </div>

                    <Button type="submit" disabled={isSubmittingFeedback}>
                      {isSubmittingFeedback
                        ? "Saving feedback..."
                        : "Submit feedback"}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Sign in to leave a rating and written feedback for this
                      product.
                    </p>
                    <Button asChild variant="outline">
                      <Link to="/login">Login to leave feedback</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {feedbackError ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                {feedbackError}
              </div>
            ) : null}

            {isFeedbackLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index}>
                    <CardContent className="space-y-3 p-5">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : feedbackItems.length === 0 ? (
              <Card>
                <CardContent className="p-5 text-sm text-muted-foreground">
                  No feedback has been submitted for this product yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {feedbackItems.map((feedback) => (
                  <Card key={feedback.id}>
                    <CardContent className="space-y-3 p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold">{feedback.user_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFeedbackDate(
                              feedback.updated_at || feedback.created_at,
                            )}
                          </p>
                        </div>
                        <FeedbackStars rating={feedback.rating} />
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {feedback.feedback}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
