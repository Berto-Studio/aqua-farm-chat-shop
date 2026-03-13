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
import {
  useAdminUser,
  useAdminUserDetails,
  useAdminUserOrders,
} from "@/hooks/useAdminUsers";
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
import type {
  AdminOrderRecord,
  AdminUserDetailsRecord,
} from "@/types/admin";

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

const toFiniteNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const readFirstString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
};

const formatDetailLabel = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getUserDetailsStats = (details?: AdminUserDetailsRecord) =>
  (details?.stats ||
    details?.order_stats ||
    details?.orderStats ||
    details?.summary) as Record<string, unknown> | undefined;

const getUserDetailsOrders = (details?: AdminUserDetailsRecord) => {
  const candidate =
    details?.recent_orders || details?.recentOrders || details?.orders;
  return Array.isArray(candidate) ? candidate : [];
};

const getUserAdditionalDetails = (details?: AdminUserDetailsRecord) => {
  if (!details) return [];

  const topLevelIgnoredKeys = new Set([
    "user",
    "recent_orders",
    "recentOrders",
    "orders",
    "latest_order",
    "latestOrder",
    "stats",
    "order_stats",
    "orderStats",
    "summary",
    "preferred_delivery_address",
    "preferredDeliveryAddress",
    "latest_payment_method",
    "latestPaymentMethod",
    "notes",
    "highlights",
  ]);
  const surfacedKeys = new Set([
    "totalorders",
    "totalspent",
    "averageordervalue",
    "totalitemspurchased",
    "deliveredorders",
    "openorders",
    "largestordervalue",
    "lastorderat",
  ]);
  const seenKeys = new Set<string>();
  const entries: Array<{ label: string; value: string }> = [];

  const pushEntry = (key: string, value: unknown) => {
    if (value === undefined || value === null || value === "") return;

    const normalizedKey = key.replace(/[^a-z0-9]/gi, "").toLowerCase();
    if (surfacedKeys.has(normalizedKey) || seenKeys.has(normalizedKey)) return;

    let displayValue: string | undefined;
    if (typeof value === "string") {
      displayValue = value.trim() || undefined;
    } else if (typeof value === "number") {
      displayValue = Number.isFinite(value) ? String(value) : undefined;
    } else if (typeof value === "boolean") {
      displayValue = value ? "Yes" : "No";
    } else if (
      Array.isArray(value) &&
      value.every((item) =>
        ["string", "number", "boolean"].includes(typeof item),
      )
    ) {
      displayValue = value
        .map((item) =>
          typeof item === "boolean" ? (item ? "Yes" : "No") : String(item),
        )
        .join(", ");
    }

    if (!displayValue) return;

    seenKeys.add(normalizedKey);
    entries.push({
      label: formatDetailLabel(key),
      value: displayValue,
    });
  };

  Object.entries(details).forEach(([key, value]) => {
    if (topLevelIgnoredKeys.has(key)) return;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.entries(value as Record<string, unknown>).forEach(
        ([nestedKey, nestedValue]) => {
          pushEntry(`${key} ${nestedKey}`, nestedValue);
        },
      );
      return;
    }

    pushEntry(key, value);
  });

  return entries.slice(0, 8);
};

const toStringList = (...values: unknown[]) =>
  values.flatMap((value) => {
    if (typeof value === "string" && value.trim()) {
      return [value.trim()];
    }

    if (Array.isArray(value)) {
      return value
        .filter((item) => typeof item === "string" && item.trim())
        .map((item) => String(item).trim());
    }

    return [];
  });

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
  const { data: userDetails } = useAdminUserDetails(resolvedUserId, {
    recent_limit: 5,
  });
  const { data: orders = [], isLoading: isOrdersLoading } =
    useAdminUserOrders(resolvedUserId);
  const detailsStats = getUserDetailsStats(userDetails);
  const detailedOrders = useMemo(
    () => getUserDetailsOrders(userDetails),
    [userDetails],
  );
  const customer = userDetails?.user || user;
  const latestOrderCandidate =
    userDetails?.latest_order || userDetails?.latestOrder;
  const ordersSource =
    detailedOrders.length > 0
      ? detailedOrders
      : orders.length > 0
        ? orders
        : latestOrderCandidate
          ? [latestOrderCandidate]
          : [];
  const sortedOrders = useMemo(
    () =>
      [...ordersSource].sort(
        (a, b) =>
          new Date(b.created_at || "").getTime() -
          new Date(a.created_at || "").getTime(),
      ),
    [ordersSource],
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
  const computedOrders = toFiniteNumber(
    detailsStats?.total_orders ?? detailsStats?.totalOrders,
    getUserOrderCount(customer) || ordersSource.length,
  );
  const computedSpent = toFiniteNumber(
    detailsStats?.total_spent ?? detailsStats?.totalSpent,
    getUserTotalSpent(customer) ||
      ordersSource.reduce((sum, order) => sum + getOrderTotal(order), 0),
  );
  const averageOrderValue =
    computedOrders > 0
      ? toFiniteNumber(
          detailsStats?.average_order_value ?? detailsStats?.averageOrderValue,
          computedSpent / computedOrders,
        )
      : 0;
  const totalItemsPurchased = toFiniteNumber(
    detailsStats?.total_items_purchased ?? detailsStats?.totalItemsPurchased,
    sortedOrders.reduce((sum, order) => sum + getOrderItemsCount(order), 0),
  );
  const latestOrder = latestOrderCandidate || sortedOrders[0];
  const recentOrders = sortedOrders.slice(0, 5);
  const latestOrderItems = latestOrder?.items?.slice(0, 4) || [];
  const customerName = getUserDisplayName(customer);
  const customerInitials = getInitials(customerName);
  const deliveredOrders = toFiniteNumber(
    detailsStats?.delivered_orders ?? detailsStats?.deliveredOrders,
    sortedOrders.filter(
      (order) => getOrderStatusLabel(order).toLowerCase() === "delivered",
    ).length,
  );
  const openOrders = toFiniteNumber(
    detailsStats?.open_orders ?? detailsStats?.openOrders,
    sortedOrders.filter((order) => {
      const status = getOrderStatusLabel(order).toLowerCase();
      return status === "pending" || status === "processing";
    }).length,
  );
  const biggestOrder = sortedOrders.reduce<AdminOrderRecord | undefined>(
    (largest, order) => {
      if (!largest || getOrderTotal(order) > getOrderTotal(largest)) {
        return order;
      }

      return largest;
    },
    undefined,
  );
  const biggestOrderValue = toFiniteNumber(
    detailsStats?.largest_order_value ?? detailsStats?.largestOrderValue,
    biggestOrder ? getOrderTotal(biggestOrder) : 0,
  );
  const preferredDeliveryAddress =
    readFirstString(
      userDetails?.preferred_delivery_address,
      userDetails?.preferredDeliveryAddress,
      latestOrder ? getOrderShippingAddress(latestOrder) : undefined,
      getUserLocation(customer),
    ) || "N/A";
  const latestPaymentMethod =
    readFirstString(
      userDetails?.latest_payment_method,
      userDetails?.latestPaymentMethod,
      latestOrder ? getOrderPaymentLabel(latestOrder) : undefined,
    ) || "N/A";
  const lastOrderAt = readFirstString(
    detailsStats?.last_order_at,
    detailsStats?.lastOrderAt,
    latestOrder?.created_at,
  );
  const endpointNotes = toStringList(userDetails?.notes, userDetails?.highlights);
  const additionalDetails = getUserAdditionalDetails(userDetails);
  const showAdditionalDetails =
    endpointNotes.length > 0 || additionalDetails.length > 0;
  const isRecentOrdersLoading = isOrdersLoading && ordersSource.length === 0;

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

  const activeCustomer = customer || user;
  const customerIdValue = activeCustomer.id;
  const customerEmail = activeCustomer.email || user.email;
  const customerPhone = activeCustomer.phone || "Phone not provided";
  const customerLocation = getUserLocation(activeCustomer);
  const joinedAt = getUserJoinedAt(activeCustomer);

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
            Customer #{customerIdValue} · {customerEmail}
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
          <Button
            onClick={() => navigate(`/admin/users/${customerIdValue}/message`)}
          >
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
                      src={activeCustomer.profile_image_url}
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
                            getUserStatusLabel(activeCustomer) === "Active"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {getUserStatusLabel(activeCustomer)}
                        </Badge>
                        <Badge variant="outline">
                          Customer #{customerIdValue}
                        </Badge>
                      </div>
                      <div>
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                          {customerName}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {customerEmail}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{customerLocation}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <span>{customerPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <span>Joined {formatDate(joinedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2">
                        <Clock3 className="h-4 w-4 text-primary" />
                        <span>
                          {lastOrderAt
                            ? `Last purchase ${formatRelativeDate(lastOrderAt)}`
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
                        {preferredDeliveryAddress}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        Latest payment
                      </span>
                      <span className="font-medium">{latestPaymentMethod}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        Largest order
                      </span>
                      <span className="font-medium">
                        {biggestOrderValue > 0
                          ? formatCurrency(biggestOrderValue)
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
                  {biggestOrderValue > 0
                    ? formatCurrency(biggestOrderValue)
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-sm text-muted-foreground">
                  Member since
                </span>
                <span className="font-semibold">
                  {formatRelativeDate(joinedAt)}
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
            {isRecentOrdersLoading ? (
              <p className="text-muted-foreground">Loading orders...</p>
            ) : null}
            {!isRecentOrdersLoading && recentOrders.length === 0 ? (
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

      {showAdditionalDetails ? (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Additional Linked Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {endpointNotes.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Highlights
                </p>
                <div className="flex flex-wrap gap-2">
                  {endpointNotes.map((note, index) => (
                    <Badge
                      key={`${note}-${index}`}
                      variant="secondary"
                      className="px-3 py-1"
                    >
                      {note}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {additionalDetails.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {additionalDetails.map((detail) => (
                  <div
                    key={`${detail.label}-${detail.value}`}
                    className="rounded-2xl border bg-muted/20 p-4"
                  >
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {detail.label}
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {detail.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
