import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DeleteCartItem, GetAllCart, UpdateCartItem } from "@/services/cart";
import { useQueryClient } from "@tanstack/react-query";
import { ModalMessage } from "@/components/ui/modalMessage";
import { useCarts } from "@/hooks/useCart";

export default function Cart() {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartProps[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const queryClient = useQueryClient();
  const [refresh, setRefresh] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

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

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const result = await UpdateCartItem(id, newQuantity);
    if (result.success) {
      // Update UI state
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.cart_id === id
            ? {
                ...item,
                quantity: newQuantity,
                totalPrice: item.price * newQuantity,
              }
            : item
        )
      );

      // Optionally: refresh cart via react-query
      queryClient.invalidateQueries({ queryKey: ["carts"] });
    } else {
      toast({
        title: "Update failed",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const removeItem = async (id: number) => {
    const result = await DeleteCartItem(id);

    if (result.success) {
      console.log("Item removed successfully.");
      // Optionally: Refetch cart items or update UI state here

      // Invalidate and refetch products query
      queryClient.invalidateQueries({ queryKey: ["carts"] });
      setRefresh(!refresh);
    } else {
      console.error("Failed to remove item:", result.message);
    }

    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
      variant: "success",
    });
  };

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

  const handleCheckout = () => {
    toast({
      title: "Checkout initiated",
      description:
        "This is a demo. In a real app, you would be redirected to checkout.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ModalMessage
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={() => {
          if (selectedItemId !== null) {
            removeItem(selectedItemId);
            setSelectedItemId(null);
            setModalOpen(false);
          }
        }}
        title="Delete Item"
        message="Do you really want to delete this item from your cart?"
        actionLabel="Delete"
        actionVariant="destructive"
        icon={<Trash2 className="w-5 h-5 text-red-500" />}
      />
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item?.cart_id} className="overflow-hidden">
                  <CardContent className="p-2">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-20 md:h-20 h-40">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="flex-grow flex flex-col justify-between gap-3 md:gap-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              to={`/products/${item.cart_id}`}
                              className="font-semibold text-sm hover:text-primary transition-colors"
                            >
                              {item.name}
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedItemId(Number(item.cart_id));
                                setModalOpen(true);
                              }}
                              className="text-destructive hover:text-destructive/80 w-3 h-3"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          ${item.price.toFixed(2)} per unit
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={() =>
                                updateQuantity(item.cart_id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="mx-2 min-w-6 text-center text-xs">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={() =>
                                updateQuantity(item.cart_id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-bold text-xs">
                            ${item.totalPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" asChild>
                <Link to="/products">Continue Shopping</Link>
              </Button>
            </div>
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
                <Button onClick={handleCheckout} className="w-full" size="lg">
                  Proceed to Checkout
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
