import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ShoppingCart,
  Eye,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  useAdminOrders,
  useAdminOrderStats,
  useUpdateAdminOrderStatus,
} from "@/hooks/useAdminOrders";
import { useToast } from "@/hooks/use-toast";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  getOrderPaymentLabel,
  getOrderStatusLabel,
  getOrderTotal,
  getOrderUserName,
} from "@/lib/adminTransformers";
import type { AdminOrderRecord } from "@/types/admin";

type SortColumn = "date" | "total";
type SortDirection = "asc" | "desc";

const statusClass: Record<string, string> = {
  delivered: "bg-green-100 text-green-800",
  processing: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusOptions = ["pending", "processing", "delivered", "cancelled"] as const;
const ORDERS_PER_PAGE = 10;

const toStatusLabel = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const normalizeOrderStatus = (value: string) =>
  statusOptions.includes(value as (typeof statusOptions)[number])
    ? value
    : "pending";

export default function AdminOrders() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortColumn>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const { data, isLoading, isError, error } = useAdminOrders({ per_page: 300 });
  const { data: orderStats } = useAdminOrderStats();
  const { mutateAsync: updateOrderStatusAsync } = useUpdateAdminOrderStatus();

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
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
    return sortedOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);
  }, [currentPage, sortedOrders]);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortDirection]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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

  const handleStatusDraftChange = (orderId: string | number, value: string) => {
    setStatusDrafts((current) => ({
      ...current,
      [String(orderId)]: value,
    }));
  };

  const handleUpdateStatus = async (
    orderId: string | number,
    currentStatus: string,
  ) => {
    const orderKey = String(orderId);
    const nextStatus = statusDrafts[orderKey] || currentStatus;

    if (nextStatus === currentStatus) {
      return;
    }

    try {
      setUpdatingOrderId(orderKey);
      await updateOrderStatusAsync({
        orderId,
        status: nextStatus,
      });

      setStatusDrafts((current) => {
        const nextDrafts = { ...current };
        delete nextDrafts[orderKey];
        return nextDrafts;
      });

      toast({
        title: "Order Updated",
        description: `Order #${orderId} is now ${toStatusLabel(nextStatus)}.`,
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
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const orderColumns: DataTableColumn<AdminOrderRecord>[] = [
    {
      id: "id",
      header: "Order ID",
      cell: (order) => <span className="font-medium">{order.id}</span>,
    },
    {
      id: "user",
      header: "User",
      cell: (order) => (
        <button
          type="button"
          onClick={() => navigate(`/admin/users/${order.user_id}`)}
          className="text-primary hover:underline"
        >
          {getOrderUserName(order)}
        </button>
      ),
    },
    {
      id: "date",
      header: (
        <button
          type="button"
          className="flex items-center gap-1"
          onClick={() => handleSort("date")}
        >
          <span>Date</span>
          {getSortIcon("date")}
        </button>
      ),
      cell: (order) => formatDate(order.created_at),
    },
    {
      id: "status",
      header: "Status",
      cell: (order) => {
        const status = getOrderStatusLabel(order);
        return (
          <Badge variant="outline" className={getStatusColor(status)}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "update-status",
      header: "Update Status",
      headerClassName: "min-w-[220px]",
      cell: (order) => {
        const normalizedStatus = normalizeOrderStatus(
          getOrderStatusLabel(order).toLowerCase(),
        );
        const orderKey = String(order.id);
        const draftStatus = statusDrafts[orderKey] || normalizedStatus;
        const hasStatusChanged = draftStatus !== normalizedStatus;
        const isUpdatingThisOrder = updatingOrderId === orderKey;

        return (
          <div className="flex min-w-[220px] flex-col gap-2 sm:flex-row">
            <Select
              value={draftStatus}
              onValueChange={(value) => handleStatusDraftChange(order.id, value)}
              disabled={isUpdatingThisOrder}
            >
              <SelectTrigger className="h-9 w-full sm:w-[150px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {toStatusLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              size="sm"
              className="sm:min-w-[88px]"
              disabled={!hasStatusChanged || isUpdatingThisOrder}
              onClick={() => void handleUpdateStatus(order.id, normalizedStatus)}
            >
              {isUpdatingThisOrder ? "Updating..." : "Update"}
            </Button>
          </div>
        );
      },
    },
    {
      id: "total",
      header: (
        <button
          type="button"
          className="flex items-center gap-1"
          onClick={() => handleSort("total")}
        >
          <span>Total</span>
          {getSortIcon("total")}
        </button>
      ),
      cell: (order) => `$${getOrderTotal(order).toFixed(2)}`,
    },
    {
      id: "payment",
      header: "Payment",
      cell: (order) => getOrderPaymentLabel(order),
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "text-center",
      cellClassName: "text-center",
      cell: (order) => (
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
      ),
    },
  ];

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

      <DataTable
        columns={orderColumns}
        data={paginatedOrders}
        getRowKey={(order) => String(order.id)}
        loading={isLoading}
        error={isError ? (error as Error)?.message || "Failed to load orders." : null}
        loadingMessage="Loading orders..."
        emptyMessage="No orders found."
        tableClassName="min-w-[980px]"
        pagination={{
          page: currentPage,
          pageSize: ORDERS_PER_PAGE,
          totalItems: sortedOrders.length,
          totalPages,
          onPrevious: () =>
            setCurrentPage((page) => Math.max(1, page - 1)),
          onNext: () =>
            setCurrentPage((page) => Math.min(totalPages, page + 1)),
        }}
      />
    </div>
  );
}
