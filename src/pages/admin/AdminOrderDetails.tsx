import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminOrder, useUpdateAdminOrderStatus } from "@/hooks/useAdminOrders";
import { useToast } from "@/hooks/use-toast";
import {
  getOrderItemName,
  getOrderItemUnitPrice,
  getOrderPaymentLabel,
  getOrderShippingAddress,
  getOrderStatusLabel,
  getOrderTotal,
} from "@/lib/adminTransformers";
import {
  getPaymentReference,
  getPaymentTrackingBadgeClass,
  getPaymentTrackingStatus,
} from "@/lib/paymentUtils";

const statusClass: Record<string, string> = {
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const statusOptions = ["pending", "processing", "delivered", "cancelled"];

const toStatusLabel = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export default function AdminOrderDetails() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, isError, error } = useAdminOrder(orderId);
  const { mutateAsync: updateStatusAsync, isPending: isUpdatingStatus } =
    useUpdateAdminOrderStatus();
  const [selectedStatus, setSelectedStatus] = useState("pending");

  const normalizedStatus = useMemo(
    () => String(getOrderStatusLabel(order)).toLowerCase(),
    [order]
  );
  const selectStatusValue = statusOptions.includes(normalizedStatus)
    ? normalizedStatus
    : undefined;
  const hasStatusChanged = selectedStatus !== (selectStatusValue || "pending");

  const formatDate = (value?: string) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : parsed.toLocaleString();
  };

  useEffect(() => {
    setSelectedStatus(selectStatusValue || "pending");
  }, [selectStatusValue]);

  const handleUpdateStatus = async () => {
    if (!order || !hasStatusChanged) return;

    try {
      await updateStatusAsync({
        orderId: order.id,
        status: selectedStatus,
      });

      toast({
        title: "Order Updated",
        description: `Order #${order.id} is now ${toStatusLabel(selectedStatus)}.`,
      });
    } catch (updateError) {
      toast({
        title: "Update Failed",
        description:
          updateError instanceof Error
            ? updateError.message
            : "Unable to update order status.",
        variant: "destructive",
      });
    }
  };

  if (!orderId) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" onClick={() => navigate("/admin/orders")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <Card>
          <CardContent className="p-6 text-destructive">Missing order id.</CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" onClick={() => navigate("/admin/orders")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <Card>
          <CardContent className="p-6 text-muted-foreground">Loading order...</CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" onClick={() => navigate("/admin/orders")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <Card>
          <CardContent className="p-6 text-destructive">
            {(error as Error)?.message || "Failed to load order."}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" onClick={() => navigate("/admin/orders")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <Card>
          <CardContent className="p-6 text-destructive">Order not found.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/admin/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order {order.id}</h1>
            <p className="text-sm text-muted-foreground">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate(`/admin/users/${order.user_id}`)}
        >
          <User className="mr-2 h-4 w-4" />
          View User
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items?.length ? (
              order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-semibold">{getOrderItemName(item)}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      ${getOrderItemUnitPrice(item).toFixed(2)} each
                    </p>
                    <p className="font-semibold">
                      ${(getOrderItemUnitPrice(item) * Number(item.quantity || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No order items available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Status
              </p>
              <div className="mt-2 space-y-2">
                <Badge
                  variant="outline"
                  className={statusClass[normalizedStatus] || ""}
                >
                  {toStatusLabel(normalizedStatus)}
                </Badge>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {toStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full"
                  disabled={!hasStatusChanged || isUpdatingStatus}
                  onClick={() => void handleUpdateStatus()}
                >
                  {isUpdatingStatus ? "Updating Status..." : "Update Status"}
                </Button>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Payment Method
              </p>
              <p className="mt-1 font-semibold">{getOrderPaymentLabel(order)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={getPaymentTrackingBadgeClass(
                    getPaymentTrackingStatus(order),
                  )}
                >
                  {getPaymentTrackingStatus(order)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {getPaymentReference(order)}
                </span>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Shipping Address
              </p>
              <p className="mt-1 text-sm">{getOrderShippingAddress(order)}</p>
            </div>

            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Total
              </p>
              <p className="mt-1 text-2xl font-bold">${getOrderTotal(order).toFixed(2)}</p>
            </div>

            {order.notes ? (
              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Notes
                </p>
                <p className="mt-1 text-sm">{order.notes}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
