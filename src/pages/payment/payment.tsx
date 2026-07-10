import PaystackPop from "@paystack/inline-js";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { InitializePayment, VerifyPayment } from "@/services/payments";
import Carts from "@/components/payment/cart";
import Checkout, {
  CheckoutFormData,
  ShippingMethod,
} from "@/components/payment/checkout";
import { CheckoutSteps } from "@/components/payment/paymentStepsHeading";
import type { PaymentRecord } from "@/types/payments";
import { useUserStore } from "@/store/store";
import { useAuthPromptStore } from "@/store/authPromptStore";

type Step = "cart" | "checkout" | "payment";

type PendingOnlinePayment = {
  orderId: number;
  reference: string;
  cartItemIds: number[];
  createdAt: string;
};

type VerifyPaymentOptions = {
  replaceUrl?: boolean;
};

const defaultCheckoutForm: CheckoutFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  region: "",
  postalCode: "0233",
  shippingMethod: "",
};

const PENDING_ONLINE_PAYMENTS_STORAGE_KEY = "pending-online-payments";
const PAYSTACK_PUBLIC_KEY = String(
  import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
).trim();

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

const formatStatusLabel = (value?: string | null) => {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "Unknown";

  return rawValue
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const isSuccessfulGatewayPayment = (status?: string | null) => {
  const normalizedStatus = String(status || "")
    .trim()
    .toLowerCase();

  return ["success", "paid", "completed"].includes(normalizedStatus);
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
    "Payment tracking: Secure online payment through Paystack.",
  ].join("\n");

const buildGatewayMetadata = (form: CheckoutFormData, orderId: number) => {
  const customerName =
    `${form.firstName.trim()} ${form.lastName.trim()}`.trim();

  return {
    checkout_payment_method: "paystack",
    shipping_method: form.shippingMethod,
    customer_name: customerName,
    phone: form.phone.trim(),
    custom_fields: [
      {
        display_name: "Order ID",
        variable_name: "order_id",
        value: String(orderId),
      },
      {
        display_name: "Shipping method",
        variable_name: "shipping_method",
        value: formatShippingMethodLabel(form.shippingMethod),
      },
    ],
  };
};

const getStoredPendingOnlinePayments = () => {
  if (typeof window === "undefined")
    return {} as Record<string, PendingOnlinePayment>;

  try {
    const rawValue = window.sessionStorage.getItem(
      PENDING_ONLINE_PAYMENTS_STORAGE_KEY,
    );

    if (!rawValue) {
      return {} as Record<string, PendingOnlinePayment>;
    }

    const parsed = JSON.parse(rawValue) as Record<string, PendingOnlinePayment>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {} as Record<string, PendingOnlinePayment>;
  }
};

const setStoredPendingOnlinePayments = (
  payments: Record<string, PendingOnlinePayment>,
) => {
  if (typeof window === "undefined") return;

  try {
    if (Object.keys(payments).length === 0) {
      window.sessionStorage.removeItem(PENDING_ONLINE_PAYMENTS_STORAGE_KEY);
      return;
    }

    window.sessionStorage.setItem(
      PENDING_ONLINE_PAYMENTS_STORAGE_KEY,
      JSON.stringify(payments),
    );
  } catch {
    // Ignore session storage errors in restricted browsers.
  }
};

const rememberPendingOnlinePayment = (payment: PendingOnlinePayment) => {
  const currentPayments = getStoredPendingOnlinePayments();
  currentPayments[payment.reference] = payment;
  setStoredPendingOnlinePayments(currentPayments);
};

const getPendingOnlinePayment = (reference: string) =>
  getStoredPendingOnlinePayments()[reference];

const clearPendingOnlinePayment = (reference: string) => {
  const currentPayments = getStoredPendingOnlinePayments();
  delete currentPayments[reference];
  setStoredPendingOnlinePayments(currentPayments);
};

const getMostRecentPendingOnlinePayment = () => {
  const pendingPayments = Object.values(getStoredPendingOnlinePayments());

  if (pendingPayments.length === 0) return undefined;

  return [...pendingPayments].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  )[0];
};

const buildPaymentCallbackUrl = () => {
  if (typeof window === "undefined") return undefined;
  return new URL("/cart", window.location.origin).toString();
};

export default function PaymentProccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const openAuthPrompt = useAuthPromptStore((state) => state.openPrompt);
  const [cartItems, setCartItems] = useState<CartProps[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [step, setStep] = useState<Step>("cart");
  const [checkoutForm, setCheckoutForm] =
    useState<CheckoutFormData>(defaultCheckoutForm);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [verificationAttempt, setVerificationAttempt] = useState(0);
  const [pendingOnlineOrderId, setPendingOnlineOrderId] = useState<
    number | null
  >(null);
  const [verifiedPayment, setVerifiedPayment] = useState<PaymentRecord | null>(
    null,
  );
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(
    null,
  );

  const { cartItems: serverCartItems } = useCarts({ enabled: isLoggedIn });
  const paymentReference = searchParams.get("reference")?.trim() || "";

  useEffect(() => {
    if (!isLoggedIn) {
      openAuthPrompt({
        title: "Login required",
        description:
          "Please login or register to view your cart and continue to checkout.",
      });
    }
  }, [isLoggedIn, openAuthPrompt]);

  useEffect(() => {
    setCartItems(serverCartItems);
  }, [serverCartItems]);

  useEffect(() => {
    if (paymentReference) return;

    const pendingPayment = getMostRecentPendingOnlinePayment();
    if (pendingPayment) {
      setPendingOnlineOrderId(pendingPayment.orderId);
    }
  }, [paymentReference]);

  const subtotal = cartItems.reduce(
    (total, item) => total + item.totalPrice,
    0,
  );
  const delivery = subtotal > 100 ? 0 : 15;
  const discount = 0;
  const total = subtotal - discount;

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
      if (!checkoutForm.address || !checkoutForm.city || !checkoutForm.region) {
        toast({
          title: "Address required",
          description: "Please complete the shipping address details.",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const validatePaymentForm = () => {
    if (!PAYSTACK_PUBLIC_KEY) {
      toast({
        title: "Paystack not configured",
        description:
          "Add your Paystack public key to VITE_PAYSTACK_PUBLIC_KEY before starting online payments.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const resetCheckoutState = () => {
    setCartItems([]);
    setCheckoutForm(defaultCheckoutForm);
    setCouponCode("");
    setStep("cart");
    setPendingOnlineOrderId(null);
  };

  const cleanUpCartItems = async (cartItemIds: number[]) => {
    if (cartItemIds.length === 0) {
      return { hasIssues: false };
    }

    const cleanupResults = await Promise.allSettled(
      cartItemIds.map((cartId) => DeleteCartItem(cartId)),
    );

    const hasIssues = cleanupResults.some(
      (result) => result.status === "rejected" || !result.value.success,
    );

    return { hasIssues };
  };

  const verifyCompletedPayment = async (
    reference: string,
    options: VerifyPaymentOptions = {},
  ) => {
    const pendingPayment = getPendingOnlinePayment(reference);

    setIsVerifyingPayment(true);
    setPaymentErrorMessage(null);

    try {
      const response = await VerifyPayment(reference);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Unable to verify payment.");
      }

      const payment = response.data;
      setVerifiedPayment(payment);

      if (!isSuccessfulGatewayPayment(payment.status)) {
        clearPendingOnlinePayment(reference);
        setPendingOnlineOrderId(pendingPayment?.orderId || null);
        setPaymentErrorMessage(
          payment.gateway_response ||
            `Payment status is ${formatStatusLabel(payment.status)}.`,
        );

        toast({
          title: "Payment not completed",
          description:
            payment.gateway_response ||
            `The payment returned with status ${formatStatusLabel(payment.status)}.`,
          variant: "destructive",
        });

        if (options.replaceUrl) {
          navigate("/cart", { replace: true });
        }

        return false;
      }

      const cleanupSummary = await cleanUpCartItems(
        pendingPayment?.cartItemIds || [],
      );

      clearPendingOnlinePayment(reference);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["carts"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
      ]);

      resetCheckoutState();

      toast({
        title: "Payment successful",
        description: cleanupSummary.hasIssues
          ? `Payment ${payment.reference} was verified, but some cart items may still appear until the next refresh.`
          : `Payment ${payment.reference} was verified successfully.`,
        variant: "success",
      });

      if (options.replaceUrl) {
        navigate("/cart", { replace: true });
      }

      return true;
    } catch (error) {
      setPaymentErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to verify your payment right now.",
      );

      toast({
        title: "Verification failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to verify your payment right now.",
        variant: "destructive",
      });

      return false;
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  useEffect(() => {
    if (!paymentReference) return;
    void verifyCompletedPayment(paymentReference, { replaceUrl: true });
  }, [navigate, paymentReference, queryClient, toast, verificationAttempt]);

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

    setIsSubmittingOrder(true);
    setPaymentErrorMessage(null);
    setVerifiedPayment(null);

    let shouldStaySubmitting = false;
    let activeOrderId: number | null = null;

    try {
      let orderId = pendingOnlineOrderId;

      if (!orderId) {
        const orderResult = await CreateOrder({
          items: cartItems.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
          payment_method: "paystack",
          shipping_address: buildShippingAddress(checkoutForm),
          notes: buildOrderNotes(checkoutForm),
        });

        if (!orderResult.success || !orderResult.data?.id) {
          throw new Error(orderResult.message || "Unable to create order.");
        }

        orderId = Number(orderResult.data.id);
        setPendingOnlineOrderId(orderId);
      }

      activeOrderId = orderId;

      const paymentResult = await InitializePayment({
        order_id: orderId,
        email: checkoutForm.email.trim(),
        callback_url: buildPaymentCallbackUrl(),
        metadata: buildGatewayMetadata(checkoutForm, orderId),
      });

      if (!paymentResult.success || !paymentResult.data) {
        throw new Error(
          paymentResult.message || "Unable to initialize payment.",
        );
      }

      const accessCode = paymentResult.data.access_code?.trim();
      const authorizationUrl = paymentResult.data.authorization_url?.trim();
      const reference = paymentResult.data.reference?.trim();

      if (!reference) {
        throw new Error(
          "Payment gateway response is missing a payment reference.",
        );
      }

      if (accessCode && PAYSTACK_PUBLIC_KEY) {
        const paystackPopup = new PaystackPop();

        toast({
          title: "Continue in Paystack",
          description:
            "Your order was created. Complete the payment in the secure Paystack popup.",
          variant: "success",
        });

        paystackPopup.resumeTransaction(accessCode, {
          onSuccess: ({ reference: completedReference }) => {
            void verifyCompletedPayment(
              completedReference?.trim() || reference,
            );
          },
          onCancel: () => {
            clearPendingOnlinePayment(reference);
            setPendingOnlineOrderId(null);
            setPaymentErrorMessage(
              `Payment was cancelled for order #${orderId}. You can try again when you are ready.`,
            );
            toast({
              title: "Payment cancelled",
              description:
                "The payment was cancelled, and no pending payment will be kept for this checkout.",
              variant: "destructive",
            });
          },
          onError: ({ message }) => {
            clearPendingOnlinePayment(reference);
            setPendingOnlineOrderId(null);
            const description =
              message?.trim() || "Unable to open Paystack checkout right now.";

            if (authorizationUrl) {
              toast({
                title: "Opening Paystack redirect",
                description:
                  "The inline popup could not load, so we are sending you to Paystack directly.",
                variant: "success",
              });
              window.location.assign(authorizationUrl);
              return;
            }

            setPaymentErrorMessage(description);
            toast({
              title: "Paystack failed to load",
              description,
              variant: "destructive",
            });
          },
        });

        return;
      }

      if (authorizationUrl) {
        shouldStaySubmitting = true;

        toast({
          title: "Redirecting to payment",
          description:
            "Your order was created. Complete the payment on the secure Paystack page.",
          variant: "success",
        });

        window.location.assign(authorizationUrl);
        return;
      }

      throw new Error(
        "Payment gateway response is missing Paystack checkout details.",
      );
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Unable to continue with payment right now.";

      setPaymentErrorMessage(description);

      toast({
        title: "Payment could not start",
        description: activeOrderId
          ? `${description} Order #${activeOrderId} is still waiting for payment, and the same payment button will retry it instead of creating a duplicate.`
          : description,
        variant: "destructive",
      });
    } finally {
      if (!shouldStaySubmitting) {
        setIsSubmittingOrder(false);
      }
    }
  };

  const renderPaymentPanel = () => {
    const deliveryAddress =
      checkoutForm.shippingMethod === "pickup"
        ? "Pickup selected"
        : [checkoutForm.address, checkoutForm.city, checkoutForm.region]
            .map((value) => value.trim())
            .filter(Boolean)
            .join(", ") || "Not provided";

    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-bold">Secure Paystack Checkout</h2>
            <p className="text-sm text-muted-foreground">
              After you continue, Paystack will open a secure checkout so you
              can complete the payment safely.
            </p>
            {!PAYSTACK_PUBLIC_KEY ? (
              <p className="text-sm text-destructive">
                Paystack public key is missing. Add{" "}
                <code>VITE_PAYSTACK_PUBLIC_KEY</code> to enable online payments.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">Your checkout summary</h2>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">
                  {`${checkoutForm.firstName} ${checkoutForm.lastName}`.trim() ||
                    "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">
                  {checkoutForm.email.trim() || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">
                  {checkoutForm.phone.trim() || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Delivery method</p>
                <p className="font-medium">
                  {formatShippingMethodLabel(checkoutForm.shippingMethod)}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{deliveryAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const actionLabel =
    step === "cart"
      ? "Proceed to Checkout"
      : step === "checkout"
        ? "Proceed to Payment"
        : pendingOnlineOrderId
          ? "Resume Secure Payment"
          : "Continue to Secure Payment";

  const actionHandler =
    step === "payment" ? handleCompletePayment : handleProceed;

  const paymentStatusCard =
    isVerifyingPayment ||
    paymentErrorMessage ||
    verifiedPayment ||
    pendingOnlineOrderId ? (
      <Card className="mb-6">
        <CardContent className="space-y-4 p-6">
          {isVerifyingPayment ? (
            <div className="space-y-1">
              <h2 className="font-semibold">Verifying payment...</h2>
              <p className="text-sm text-muted-foreground">
                We are confirming your Paystack transaction now.
              </p>
            </div>
          ) : null}

          {!isVerifyingPayment && verifiedPayment ? (
            <div className="space-y-1">
              <h2 className="font-semibold">
                Payment {formatStatusLabel(verifiedPayment.status)}
              </h2>
              <p className="text-sm text-muted-foreground">
                Reference: {verifiedPayment.reference}
              </p>
            </div>
          ) : null}

          {!isVerifyingPayment && paymentErrorMessage ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <h2 className="font-semibold text-destructive">
                  Payment needs attention
                </h2>
                <p className="text-sm text-muted-foreground">
                  {paymentErrorMessage}
                </p>
              </div>
              {paymentReference ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setVerificationAttempt((value) => value + 1)}
                  >
                    Retry Verification
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/cart", { replace: true })}
                  >
                    Return to Cart
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {!isVerifyingPayment &&
          !paymentErrorMessage &&
          pendingOnlineOrderId &&
          !paymentReference ? (
            <div className="space-y-1">
              <h2 className="font-semibold">Pending online payment</h2>
              <p className="text-sm text-muted-foreground">
                Order #{pendingOnlineOrderId} is waiting for online payment.
                Continuing will reuse that order instead of creating a
                duplicate.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    ) : null;

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-lg text-center">
          <CardContent className="space-y-4 p-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary/50">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">
                Login to view your cart
              </h1>
              <p className="text-sm text-muted-foreground">
                Please login or register before reviewing your cart and
                completing checkout.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={() =>
                  openAuthPrompt({
                    title: "Login required",
                    description:
                      "Please login or register to view your cart and continue to checkout.",
                  })
                }
              >
                Login or register
              </Button>
              <Button asChild variant="outline">
                <Link to="/products">Continue shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutSteps step={step} setStep={setStep} />
      {paymentStatusCard}

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
                    <span>
                      {new Intl.NumberFormat("en-GH", {
                        style: "currency",
                        currency: "GHS",
                      }).format(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>To Be Negotiated</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-green-600">
                        -
                        {new Intl.NumberFormat("en-GH", {
                          style: "currency",
                          currency: "GHS",
                        }).format(discount)}
                      </span>
                    </div>
                  )}
                  <Separator className="my-4" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>
                      {new Intl.NumberFormat("en-GH", {
                        style: "currency",
                        currency: "GHS",
                      }).format(total)}
                    </span>
                  </div>
                </div>

                {step !== "cart" && (
                  <div className="mt-6 rounded-md border p-3">
                    <p className="text-sm font-medium">Secure payment</p>
                    <p className="text-sm text-muted-foreground">
                      Paystack will handle the checkout securely after you
                      continue.
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
                  disabled={isSubmittingOrder || isVerifyingPayment}
                >
                  {isSubmittingOrder
                    ? "Preparing payment..."
                    : isVerifyingPayment
                      ? "Verifying payment..."
                      : actionLabel}
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
