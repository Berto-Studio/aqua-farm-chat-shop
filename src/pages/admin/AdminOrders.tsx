import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  ShoppingCart,
  Eye,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useAdminOrders, useAdminOrderStats } from "@/hooks/useAdminOrders";
import {
  getOrderPaymentLabel,
  getOrderStatusLabel,
  getOrderTotal,
  getOrderUserName,
} from "@/lib/adminTransformers";

type SortColumn = "date" | "total";
type SortDirection = "asc" | "desc";

const statusClass: Record<string, string> = {
  delivered: "bg-green-100 text-green-800",
  processing: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortColumn>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const { data, isLoading, isError, error } = useAdminOrders({ per_page: 300 });
  const { data: orderStats } = useAdminOrderStats();

  const orders = data?.data || [];

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const q = searchTerm.toLowerCase();
        return (
          String(order.id).toLowerCase().includes(q) ||
          getOrderUserName(order).toLowerCase().includes(q)
        );
      }),
    [orders, searchTerm]
  );

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      if (sortBy === "date") {
        const aDate = new Date(a.created_at || "").getTime();
        const bDate = new Date(b.created_at || "").getTime();
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }

      const aTotal = getOrderTotal(a);
      const bTotal = getOrderTotal(b);
      return sortDirection === "asc" ? aTotal - bTotal : bTotal - aTotal;
    });
  }, [filteredOrders, sortBy, sortDirection]);

  const computedTotalOrders = data?.meta?.total ?? orders.length;
  const computedPending = orders.filter(
    (order) => getOrderStatusLabel(order).toLowerCase() === "pending"
  ).length;
  const computedDelivered = orders.filter(
    (order) => getOrderStatusLabel(order).toLowerCase() === "delivered"
  ).length;
  const computedRevenue = orders.reduce(
    (sum, order) => sum + getOrderTotal(order),
    0
  );

  const totalOrders = Number.isFinite(orderStats?.total_orders)
    ? Number(orderStats?.total_orders)
    : computedTotalOrders;
  const pendingOrders = Number.isFinite(orderStats?.pending_orders)
    ? Number(orderStats?.pending_orders)
    : computedPending;
  const deliveredOrders = Number.isFinite(orderStats?.delivered_orders)
    ? Number(orderStats?.delivered_orders)
    : computedDelivered;
  const totalRevenue = Number.isFinite(orderStats?.total_revenue)
    ? Number(orderStats?.total_revenue)
    : computedRevenue;

  const formatDate = (dateValue?: string) => {
    if (!dateValue) return "N/A";
    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime())
      ? dateValue
      : parsed.toLocaleDateString();
  };

  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(column);
    setSortDirection("asc");
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortBy !== column) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  const getStatusColor = (status: string) =>
    statusClass[status.toLowerCase()] || "bg-gray-100 text-gray-800";

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Orders Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalOrders}</div>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Delivered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{deliveredOrders}</div>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-md">
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {isError ? (
        <Card>
          <CardContent className="p-6 text-destructive">
            {(error as Error)?.message || "Failed to load orders."}
          </CardContent>
        </Card>
      ) : null}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                <div className="flex items-center gap-1">
                  Date {getSortIcon("date")}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("total")}>
                <div className="flex items-center gap-1">
                  Total {getSortIcon("total")}
                </div>
              </TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : null}
            {sortedOrders.map((order) => {
              const status = getOrderStatusLabel(order);

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/users/${order.user_id}`)}
                      className="text-primary hover:underline"
                    >
                      {getOrderUserName(order)}
                    </button>
                  </TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(status)}>
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell>${getOrderTotal(order).toFixed(2)}</TableCell>
                  <TableCell>{getOrderPaymentLabel(order)}</TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="ml-1 hidden md:inline">View</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {!isLoading && sortedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
