import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCarts } from "@/hooks/useCart";
import { DeleteCartItem } from "@/services/cart";
import { CreateOrder } from "@/services/orders";
import Carts from "@/components/payment/cart";
import Checkout, {
  CheckoutFormData,
  ShippingMethod,
} from "@/components/payment/checkout";
import { CheckoutSteps } from "@/components/payment/paymentStepsHeading";
import {
  formatPaymentMethodLabel,
  isPhysicalPaymentMethodValue,
} from "@/lib/paymentUtils";

type Step = "cart" | "checkout" | "payment";
type MobileProvider = "mtn" | "airteltigo" | "telecel" | "";

const defaultCheckoutForm: CheckoutFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  region: "",
  postalCode: "",
  shippingMethod: "",
  paymentMethod: "",
};

const formatShippingMethodLabel = (method: ShippingMethod | "") => {
  switch (method) {
    case "standard":
      return "Standard";
    case "express":
      return "Express";
    case "pickup":
      return "Pickup";
    default:
      return "Not selected";
  }
};

const buildShippingAddress = (form: CheckoutFormData) => {
  if (form.shippingMethod === "pickup") return undefined;

  return [form.address, form.city, form.region, form.postalCode]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(", ");
};

const buildOrderNotes = (form: CheckoutFormData) =>
  [
    `Customer: ${form.firstName.trim()} ${form.lastName.trim()}`,
    `Email: ${form.email.trim()}`,
    `Phone: ${form.phone.trim()}`,
    `Shipping method: ${formatShippingMethodLabel(form.shippingMethod)}`,
    `Payment method: ${formatPaymentMethodLabel(form.paymentMethod)}`,
    ...(isPhysicalPaymentMethodValue(form.paymentMethod)
      ? ["Payment tracking: Physical payment selected for delivery or pickup."]
      : []),
  ].join("\n");

export default function PaymentProccess() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartProps[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [step, setStep] = useState<Step>("cart");
  const [checkoutForm, setCheckoutForm] = useState<CheckoutFormData>(
    defaultCheckoutForm
  );

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [mobileProvider, setMobileProvider] = useState<MobileProvider>("");
  const [mobileNumber, setMobileNumber] = useState("");

  const [paypalEmail, setPaypalEmail] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const { cartItems: serverCartItems } = useCarts();

  useEffect(() => {
    setCartItems(serverCartItems);
  }, [serverCartItems]);

  const subtotal = cartItems.reduce((total, item) => total + item.totalPrice, 0);
  const delivery = subtotal > 100 ? 0 : 15;
  const discount = 0;
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

  const validateCheckoutData = () => {
    if (!checkoutForm.firstName || !checkoutForm.lastName) {
      toast({
        title: "Missing details",
        description: "Please provide first and last name.",
        variant: "destructive",
      });
      return false;
    }

    if (!checkoutForm.email || !checkoutForm.phone) {
      toast({
        title: "Missing contact",
        description: "Please provide email and phone number.",
        variant: "destructive",
      });
      return false;
    }

    if (!checkoutForm.shippingMethod) {
      toast({
        title: "Shipping required",
        description: "Please select a shipping method.",
        variant: "destructive",
      });
      return false;
    }

    if (checkoutForm.shippingMethod !== "pickup") {
      if (
        !checkoutForm.address ||
        !checkoutForm.city ||
        !checkoutForm.region ||
        !checkoutForm.postalCode
      ) {
        toast({
          title: "Address required",
          description: "Please complete the shipping address details.",
          variant: "destructive",
        });
        return false;
      }
    }

    if (!checkoutForm.paymentMethod) {
      toast({
        title: "Payment method required",
        description: "Please select your payment method.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const validatePaymentForm = () => {
    const paymentMethod = checkoutForm.paymentMethod;

    if (!paymentMethod) {
      toast({
        title: "Payment method required",
        description: "Please go back to checkout and select a payment method.",
        variant: "destructive",
      });
      return false;
    }

    if (paymentMethod === "card") {
      const digitsOnly = cardNumber.replace(/\D/g, "");
      if (!cardName || digitsOnly.length < 12 || !cardExpiry || cardCvv.length < 3) {
        toast({
          title: "Card details incomplete",
          description: "Please provide valid card holder name and card details.",
          variant: "destructive",
        });
        return false;
      }
      return true;
    }

    if (paymentMethod === "mobile") {
      if (!mobileProvider || !mobileNumber) {
        toast({
          title: "Mobile money details incomplete",
          description: "Select provider and enter mobile money number.",
          variant: "destructive",
        });
        return false;
      }
      return true;
    }

    if (paymentMethod === "paypal") {
      if (!paypalEmail) {
        toast({
          title: "PayPal email required",
          description: "Please enter your PayPal email.",
          variant: "destructive",
        });
        return false;
      }
      return true;
    }

    return true;
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
      return;
    }

    if (step === "checkout") {
      if (!validateCheckoutData()) return;
      setStep("payment");
    }
  };

  const resetCheckoutState = () => {
    setCartItems([]);
    setCheckoutForm(defaultCheckoutForm);
    setCardName("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setMobileProvider("");
    setMobileNumber("");
    setPaypalEmail("");
    setCouponCode("");
    setStep("cart");
  };

  const handleCompletePayment = async () => {
    if (step !== "payment") return;
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before placing an order.",
        variant: "destructive",
      });
      return;
    }
    if (!validatePaymentForm()) return;

    const paymentMethod = checkoutForm.paymentMethod;
    if (!paymentMethod) return;

    setIsSubmittingOrder(true);

    try {
      const orderResult = await CreateOrder({
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        payment_method: paymentMethod,
        shipping_address: buildShippingAddress(checkoutForm),
        notes: buildOrderNotes(checkoutForm),
      });

      if (!orderResult.success) {
        throw new Error(orderResult.message || "Unable to create order.");
      }

      const cartCleanupResults = await Promise.allSettled(
        cartItems.map((item) => DeleteCartItem(Number(item.cart_id)))
      );
      const hasCartCleanupIssues = cartCleanupResults.some(
        (result) => result.status === "rejected" || !result.value.success
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["carts"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
      ]);

      resetCheckoutState();

      const orderReference = orderResult.data?.id
        ? `Order #${orderResult.data.id}`
        : "Your order";

      toast({
        title: "Order placed",
        description: hasCartCleanupIssues
          ? `${orderReference} was created, but some cart items may still appear until the next refresh.`
          : `${orderReference} was created with ${formatPaymentMethodLabel(paymentMethod)}.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Order creation failed:", error);
      toast({
        title: "Order failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to create your order right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const renderPaymentPanel = () => {
    const paymentMethod = checkoutForm.paymentMethod;

    if (!paymentMethod) {
      return (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              No payment method selected. Go back to checkout and choose one.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (paymentMethod === "card") {
      return (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-bold">Pay with Card</h2>
            <div>
              <Label className="mb-2 block">Card Holder Name</Label>
              <Input
                placeholder="Name on card"
                value={cardName}
                onChange={(event) => setCardName(event.target.value)}
              />
            </div>
            <div>
              <Label className="mb-2 block">Card Number</Label>
              <Input
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(event) => setCardNumber(event.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Expiry</Label>
                <Input
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(event) => setCardExpiry(event.target.value)}
                />
              </div>
              <div>
                <Label className="mb-2 block">CVV</Label>
                <Input
                  type="password"
                  placeholder="123"
                  value={cardCvv}
                  onChange={(event) => setCardCvv(event.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (paymentMethod === "mobile") {
      return (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-bold">Pay with Mobile Money</h2>
            <div>
              <Label className="mb-2 block">Provider</Label>
              <Select
                value={mobileProvider}
                onValueChange={(value: MobileProvider) => setMobileProvider(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mtn">MTN</SelectItem>
                  <SelectItem value="airteltigo">AirtelTigo</SelectItem>
                  <SelectItem value="telecel">Telecel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Mobile Number</Label>
              <Input
                placeholder="e.g. 024xxxxxxx"
                value={mobileNumber}
                onChange={(event) => setMobileNumber(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      );
    }

    if (paymentMethod === "paypal") {
      return (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-bold">Pay with PayPal</h2>
            <div>
              <Label className="mb-2 block">PayPal Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={paypalEmail}
                onChange={(event) => setPaypalEmail(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          <h2 className="text-xl font-bold">Physical Payment</h2>
          <p className="text-sm text-muted-foreground">
            Pay physically when your order is delivered or when you collect it.
            Admin will be able to track this payment inside the app.
          </p>
        </CardContent>
      </Card>
    );
  };

  const actionLabel =
    step === "cart"
      ? "Proceed to Checkout"
      : step === "checkout"
      ? "Proceed to Payment"
      : "Place Order";

  const actionHandler = step === "payment" ? handleCompletePayment : handleProceed;

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutSteps step={step} setStep={setStep} />

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {step === "cart" && (
              <Carts cartItems={cartItems} setCartItems={setCartItems} />
            )}
            {step === "checkout" && (
              <Checkout
                value={checkoutForm}
                onChange={(updates) =>
                  setCheckoutForm((prev) => ({ ...prev, ...updates }))
                }
                onBackToCart={() => setStep("cart")}
              />
            )}
            {step === "payment" && renderPaymentPanel()}
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{delivery === 0 ? "Free" : `$${delivery.toFixed(2)}`}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-green-600">-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="my-4" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {step !== "cart" && (
                  <div className="mt-6 space-y-2 rounded-md border p-3">
                    <p className="text-sm font-medium">Selected Payment Method</p>
                    <p className="text-sm text-muted-foreground">
                      {checkoutForm.paymentMethod
                        ? formatPaymentMethodLabel(checkoutForm.paymentMethod)
                        : "Not selected"}
                    </p>
                  </div>
                )}

                <div className="mt-6">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value)}
                    />
                    <Button onClick={applyCoupon} variant="outline">
                      Apply
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-6 pb-6 pt-0">
                <Button
                  onClick={actionHandler}
                  className="w-full"
                  size="lg"
                  disabled={isSubmittingOrder}
                >
                  {isSubmittingOrder ? "Placing order..." : actionLabel}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-secondary/50 p-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="mb-4 text-2xl font-semibold">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Button asChild size="lg">
            <Link to="/products">Start Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
