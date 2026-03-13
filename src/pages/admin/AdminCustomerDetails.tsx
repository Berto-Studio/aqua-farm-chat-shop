import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Mail,
  MapPin,
  Package,
  Phone,
  Receipt,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminUser, useAdminUserOrders } from "@/hooks/useAdminUsers";
import {
  getOrderItemName,
  getOrderItemUnitPrice,
  getOrderItemsCount,
  getOrderPaymentLabel,
  getOrderShippingAddress,
  getOrderStatusLabel,
  getOrderTotal,
  getUserDisplayName,
  getUserJoinedAt,
  getUserLocation,
  getUserOrderCount,
  getUserStatusLabel,
  getUserTotalSpent,
} from "@/lib/adminTransformers";
import type { AdminOrderRecord } from "@/types/admin";

const orderStatusClass: Record<string, string> = {
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  processing: "border-blue-200 bg-blue-50 text-blue-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "U";

export default function AdminCustomerDetails() {
  const navigate = useNavigate();
  const { userId, customerId } = useParams<{
    userId?: string;
    customerId?: string;
  }>();
  const resolvedUserId = userId || customerId;

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useAdminUser(resolvedUserId);
  const { data: orders = [], isLoading: isOrdersLoading } =
    useAdminUserOrders(resolvedUserId);

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          new Date(b.created_at || "").getTime() -
          new Date(a.created_at || "").getTime(),
      ),
    [orders],
  );

  const formatDate = (value?: string) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };

  const formatRelativeDate = (value?: string) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : formatDistanceToNow(date, { addSuffix: true });
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  const computedOrders = getUserOrderCount(user) || orders.length;
  const computedSpent =
    getUserTotalSpent(user) ||
    orders.reduce((sum, order) => sum + getOrderTotal(order), 0);
  const averageOrderValue =
    computedOrders > 0 ? computedSpent / computedOrders : 0;
  const totalItemsPurchased = sortedOrders.reduce(
    (sum, order) => sum + getOrderItemsCount(order),
    0,
  );
  const latestOrder = sortedOrders[0];
  const recentOrders = sortedOrders.slice(0, 5);
  const latestOrderItems = latestOrder?.items?.slice(0, 4) || [];
  const customerName = getUserDisplayName(user);
  const customerInitials = getInitials(customerName);
  const deliveredOrders = sortedOrders.filter(
    (order) => getOrderStatusLabel(order).toLowerCase() === "delivered",
  ).length;
  const openOrders = sortedOrders.filter((order) => {
    const status = getOrderStatusLabel(order).toLowerCase();
    return status === "pending" || status === "processing";
  }).length;
  const biggestOrder = sortedOrders.reduce<AdminOrderRecord | undefined>(
    (largest, order) => {
      if (!largest || getOrderTotal(order) > getOrderTotal(largest)) {
        return order;
      }

      return largest;
    },
    undefined,
  );

  if (!resolvedUserId) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <Card>
          <CardContent className="p-6 text-destructive">
            Missing user id.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isUserLoading) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <Card>
          <CardContent className="p-6 text-muted-foreground">
            Loading user...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isUserError) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <Card>
          <CardContent className="p-6 text-destructive">
            {(userError as Error)?.message || "Failed to load user."}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <Card>
          <CardContent className="p-6 text-destructive">
            User not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{customerName}</h1>
          <p className="text-sm text-muted-foreground">
            Customer #{user.id} · {user.email}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {latestOrder ? (
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/orders/${latestOrder.id}`)}
            >
              <ArrowUpRight className="mr-2 h-4 w-4" />
              View Latest Order
            </Button>
          ) : null}
          <Button onClick={() => navigate(`/admin/users/${user.id}/message`)}>
            <Mail className="mr-2 h-4 w-4" />
            Message User
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20 border shadow-sm">
                    <AvatarImage
                      src={user.profile_image_url}
                      alt={customerName}
                    />
                    <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                      {customerInitials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            getUserStatusLabel(user) === "Active"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {getUserStatusLabel(user)}
                        </Badge>
                        <Badge variant="outline">Customer #{user.id}</Badge>
                      </div>
                      <div>
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                          {customerName}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{getUserLocation(user)}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <span>{user.phone || "Phone not provided"}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <span>Joined {formatDate(getUserJoinedAt(user))}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2">
                        <Clock3 className="h-4 w-4 text-primary" />
                        <span>
                          {latestOrder
                            ? `Last purchase ${formatRelativeDate(latestOrder.created_at)}`
                            : "No purchases yet"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-4 lg:min-w-[280px]">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Customer Snapshot
                  </p>
                  <div className="mt-3 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        Preferred delivery
                      </span>
                      <span className="max-w-[11rem] text-right font-medium">
                        {latestOrder
                          ? getOrderShippingAddress(latestOrder)
                          : getUserLocation(user)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        Latest payment
                      </span>
                      <span className="font-medium">
                        {latestOrder
                          ? getOrderPaymentLabel(latestOrder)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        Largest order
                      </span>
                      <span className="font-medium">
                        {biggestOrder
                          ? formatCurrency(getOrderTotal(biggestOrder))
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Total Orders
                  </p>
                  <p className="mt-1 text-3xl font-semibold">
                    {computedOrders}
                  </p>
                </div>
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Lifetime Spend
                  </p>
                  <p className="mt-1 text-3xl font-semibold">
                    {formatCurrency(computedSpent)}
                  </p>
                </div>
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Average Order
                  </p>
                  <p className="mt-1 text-3xl font-semibold">
                    {formatCurrency(averageOrderValue)}
                  </p>
                </div>
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Items Purchased
                  </p>
                  <p className="mt-1 text-3xl font-semibold">
                    {totalItemsPurchased}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.5fr)]">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt className="h-5 w-5 text-primary" />
                Latest Purchase
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestOrder ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Order #{latestOrder.id}
                        </p>
                        <p className="mt-1 text-2xl font-semibold">
                          {formatCurrency(getOrderTotal(latestOrder))}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          orderStatusClass[
                            getOrderStatusLabel(latestOrder).toLowerCase()
                          ] || ""
                        }
                      >
                        {getOrderStatusLabel(latestOrder)}
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-xl border bg-white p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Purchased
                        </p>
                        <p className="mt-1 font-medium">
                          {formatDate(latestOrder.created_at)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeDate(latestOrder.created_at)}
                        </p>
                      </div>
                      <div className="rounded-xl border bg-white p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Items
                        </p>
                        <p className="mt-1 font-medium">
                          {getOrderItemsCount(latestOrder)} items
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Paid via {getOrderPaymentLabel(latestOrder)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Truck className="h-4 w-4 text-primary" />
                      Delivery address
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {getOrderShippingAddress(latestOrder)}
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => navigate(`/admin/orders/${latestOrder.id}`)}
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Open Latest Order
                  </Button>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed p-6 text-center">
                  <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 font-medium">No purchases yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This customer has not completed any orders.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-primary" />
                Commerce Signals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-sm text-muted-foreground">
                  Delivered orders
                </span>
                <span className="font-semibold">{deliveredOrders}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-sm text-muted-foreground">
                  Open orders
                </span>
                <span className="font-semibold">{openOrders}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-sm text-muted-foreground">
                  Largest basket
                </span>
                <span className="font-semibold">
                  {biggestOrder
                    ? formatCurrency(getOrderTotal(biggestOrder))
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-sm text-muted-foreground">
                  Member since
                </span>
                <span className="font-semibold">
                  {formatRelativeDate(getUserJoinedAt(user))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)]">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isOrdersLoading ? (
              <p className="text-muted-foreground">Loading orders...</p>
            ) : null}
            {!isOrdersLoading && recentOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-6 text-center">
                <p className="font-medium">
                  No orders found for this customer.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Once purchases happen, they will show up here.
                </p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">Order #{order.id}</p>
                        <Badge
                          variant="outline"
                          className={
                            orderStatusClass[
                              getOrderStatusLabel(order).toLowerCase()
                            ] || ""
                          }
                        >
                          {getOrderStatusLabel(order)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span>{formatDate(order.created_at)}</span>
                        <span>{formatRelativeDate(order.created_at)}</span>
                        <span>{getOrderItemsCount(order)} items</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getOrderShippingAddress(order)}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 lg:items-end">
                      <p className="text-xl font-semibold">
                        {formatCurrency(getOrderTotal(order))}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                      >
                        View Order
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Latest Basket
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestOrder && latestOrderItems.length > 0 ? (
              latestOrderItems.map((item) => (
                <div key={item.id} className="rounded-2xl border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{getOrderItemName(item)}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(
                        getOrderItemUnitPrice(item) *
                          Number(item.quantity || 0),
                      )}
                    </p>
                  </div>
                </div>
              ))
            ) : latestOrder ? (
              <div className="rounded-2xl border border-dashed p-5 text-center text-sm text-muted-foreground">
                Latest order has no line-item breakdown available.
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed p-5 text-center text-sm text-muted-foreground">
                No recent basket details yet.
              </div>
            )}

            {latestOrder?.notes ? (
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Latest order notes
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {latestOrder.notes}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
