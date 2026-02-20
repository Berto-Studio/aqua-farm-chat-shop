import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminOrderById } from "@/data/adminDashboard";

const statusClass: Record<string, string> = {
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Processing: "bg-blue-50 text-blue-700 border-blue-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function AdminOrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();

  const order = useMemo(
    () => (orderId ? getAdminOrderById(orderId) : undefined),
    [orderId]
  );

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
            <p className="text-sm text-muted-foreground">Placed on {order.date}</p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate(`/admin/customers/${order.customerId}`)}
        >
          <User className="mr-2 h-4 w-4" />
          View Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-semibold">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    ${item.unitPrice.toFixed(2)} each
                  </p>
                  <p className="font-semibold">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
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
              <Badge
                variant="outline"
                className={`mt-2 ${statusClass[order.status] || ""}`}
              >
                {order.status}
              </Badge>
            </div>

            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Payment Method
              </p>
              <p className="mt-1 font-semibold">{order.payment}</p>
            </div>

            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Shipping Address
              </p>
              <p className="mt-1 text-sm">{order.shippingAddress}</p>
            </div>

            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Total
              </p>
              <p className="mt-1 text-2xl font-bold">${order.total.toFixed(2)}</p>
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
