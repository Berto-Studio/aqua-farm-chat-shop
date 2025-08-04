import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GetOrder } from "@/services/orders";
import { useToast } from "@/hooks/use-toast";
import { Package, Calendar, CreditCard } from "lucide-react";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  orderId,
}: OrderDetailsModalProps) {
  const [order, setOrder] = useState<OrderProps | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const response = await GetOrder(orderId.toString());
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch order details",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      fetchOrderDetails();
    } else {
      setOrder(null);
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details #{orderId}
          </DialogTitle>
          <DialogDescription>
            View the complete details of your order including all items.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Order Date
                  </span>
                </div>
                <span className="text-sm">{formatDate(order.created_at)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    order.status === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : order.status === "Processing"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Total Amount
                  </span>
                </div>
                <span className="text-lg font-semibold">
                  GHS {order.total_price}
                </span>
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="font-semibold">Order Items</h3>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        GHS {(item.unit_price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        GHS {item.unit_price} each
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground text-center py-4">
                    No items found for this order.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load order details.</p>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}