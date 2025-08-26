import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DeleteCartItem, UpdateCartItem } from "@/services/cart";
import { useToast } from "@/hooks/use-toast";
import { ModalMessage } from "../ui/modalMessage";

interface CartItems {
  cartItems: CartProps[];
  setCartItems: (
    items: CartProps[] | ((prevItems: CartProps[]) => CartProps[])
  ) => void;
}

export default function Carts({ cartItems, setCartItems }: CartItems) {
  const queryClient = useQueryClient();
  const [refresh, setRefresh] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const { toast } = useToast();

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
  return (
    <div>
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
      <div className="">
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
    </div>
  );
}
