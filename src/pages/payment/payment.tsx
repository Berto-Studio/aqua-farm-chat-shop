import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCarts } from "@/hooks/useCart";
import Carts from "@/components/payment/cart";
import Checkout from "@/components/payment/checkout";
import { CheckoutSteps } from "@/components/payment/paymentStepsHeading";

export default function PaymentProccess() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartProps[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [step, setStep] = useState<"cart" | "checkout" | "payment">("cart");
  const { cartItems: serverCartItems } = useCarts();

  useEffect(() => {
    setCartItems(serverCartItems);
  }, [serverCartItems]);

  // Calculate totals
  const subtotal = cartItems.reduce(
    (total, item) => total + item?.totalPrice,
    0
  );
  const delivery = subtotal > 100 ? 0 : 15;
  const discount = 0; // This would be calculated based on coupon code
  const total = subtotal + delivery - discount;

  const applyCoupon = () => {
    if (couponCode.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter a coupon code.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Invalid coupon",
      description: "The coupon code you entered is invalid or expired.",
      variant: "destructive",
    });
  };

  const handleProceed = () => {
    if (step === "cart") {
      if (cartItems.length === 0) {
        toast({
          title: "Error",
          description: "Your cart is empty.",
          variant: "destructive",
        });
        return;
      }
      setStep("checkout");
    } else if (step === "checkout") {
      setStep("payment");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutSteps step={step} setStep={setStep} />

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === "cart" && (
              <Carts cartItems={cartItems} setCartItems={setCartItems} />
            )}
            {step === "checkout" && <Checkout />}
            {step === "payment" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Payment</h2>
                {/* later add your payment form / redirect button here */}
              </div>
            )}
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>
                      {delivery === 0 ? "Free" : `$${delivery.toFixed(2)}`}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-green-600">
                        -${discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <Separator className="my-4" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button onClick={applyCoupon} variant="outline">
                      Apply
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-6 pb-6 pt-0">
                <Button onClick={handleProceed} className="w-full" size="lg">
                  {step === "cart"
                    ? "Proceed to Checkout"
                    : "Proceed to Payment"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto bg-secondary/50 p-6 rounded-full w-24 h-24 flex items-center justify-center mb-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button asChild size="lg">
            <Link to="/products">Start Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
