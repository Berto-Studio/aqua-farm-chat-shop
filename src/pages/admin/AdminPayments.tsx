import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Banknote,
  Clock3,
  CreditCard,
  Eye,
  Search,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import {
  getOrderPaymentLabel,
  getOrderStatusLabel,
  getOrderTotal,
  getOrderUserName,
} from "@/lib/adminTransformers";
import {
  getPaymentReference,
  getPaymentTrackingBadgeClass,
  getPaymentTrackingStatus,
  isPhysicalPaymentMethod,
  normalizePaymentValue,
} from "@/lib/paymentUtils";
import type { AdminOrderRecord } from "@/types/admin";

const PAYMENTS_PER_PAGE = 12;

const orderStatusClass: Record<string, string> = {
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const paymentTrackingOptions = [
  { value: "all", label: "All transactions" },
  { value: "awaiting_collection", label: "Awaiting Collection" },
  { value: "collected", label: "Collected" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const formatDate = (value?: string) => {
  if (!value) return "N/A";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (value?: string) => {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminPayments() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [trackingFilter, setTrackingFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const deferredSearchTerm = useDeferredValue(searchTerm.trim());

  const { data, isLoading, isError, error, isFetching } = useAdminOrders({
    search: deferredSearchTerm || undefined,
    sort_by: "date",
    sort_dir: "desc",
    page: 1,
    per_page: 500,
  });

  const paymentRecords = useMemo(
    () =>
      (data?.data || []).filter(
        (order) => getOrderPaymentLabel(order) !== "N/A",
      ),
    [data?.data],
  );

  const paymentMethodOptions = useMemo(() => {
    const uniqueOptions = new Map<string, string>();

    paymentRecords.forEach((order) => {
      const label = getOrderPaymentLabel(order);
      const value = normalizePaymentValue(label);

      if (!value || label === "N/A") return;
      if (value === "physical_payment") return;

      uniqueOptions.set(value, label);
    });

    return [
      { value: "all", label: "All methods" },
      { value: "physical", label: "Physical Payment" },
      { value: "online", label: "Online Payments" },
      ...[...uniqueOptions.entries()]
        .sort((left, right) => left[1].localeCompare(right[1]))
        .map(([value, label]) => ({ value, label })),
    ];
  }, [paymentRecords]);

  const filteredPayments = useMemo(() => {
    return paymentRecords.filter((order) => {
      const paymentLabel = getOrderPaymentLabel(order);
      const paymentValue = normalizePaymentValue(paymentLabel);
      const trackingValue = normalizePaymentValue(getPaymentTrackingStatus(order));
      const isPhysical = isPhysicalPaymentMethod(order);

      const matchesMethod =
        methodFilter === "all"
          ? true
          : methodFilter === "physical"
            ? isPhysical
            : methodFilter === "online"
              ? !isPhysical
              : paymentValue === methodFilter;

      const matchesTracking =
        trackingFilter === "all" || trackingValue === trackingFilter;

      return matchesMethod && matchesTracking;
    });
  }, [methodFilter, paymentRecords, trackingFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / PAYMENTS_PER_PAGE),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * PAYMENTS_PER_PAGE;
    return filteredPayments.slice(startIndex, startIndex + PAYMENTS_PER_PAGE);
  }, [currentPage, filteredPayments]);

  const totalPaymentValue = paymentRecords.reduce(
    (sum, order) => sum + getOrderTotal(order),
    0,
  );
  const physicalPayments = paymentRecords.filter((order) =>
    isPhysicalPaymentMethod(order),
  );
  const awaitingCollection = physicalPayments.filter(
    (order) => getPaymentTrackingStatus(order) === "Awaiting Collection",
  );
  const collectedPhysicalValue = physicalPayments
    .filter((order) => getPaymentTrackingStatus(order) === "Collected")
    .reduce((sum, order) => sum + getOrderTotal(order), 0);

  const paymentColumns: DataTableColumn<AdminOrderRecord>[] = [
    {
      id: "transaction",
      header: "Transaction",
      cell: (order) => (
        <div className="space-y-1">
          <p className="font-medium">{getPaymentReference(order)}</p>
          <p className="text-xs text-muted-foreground">Order #{order.id}</p>
        </div>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: (order) => (
        <button
          type="button"
          onClick={() => navigate(`/admin/users/${order.user_id}`)}
          className="text-left text-primary hover:underline"
        >
          {getOrderUserName(order)}
        </button>
      ),
    },
    {
      id: "date",
      header: "Date",
      cell: (order) => (
        <div className="space-y-1">
          <p>{formatDate(order.created_at)}</p>
          <p className="text-xs text-muted-foreground">
            {formatTime(order.created_at)}
          </p>
        </div>
      ),
    },
    {
      id: "method",
      header: "Payment Method",
      cell: (order) => {
        const isPhysical = isPhysicalPaymentMethod(order);

        return (
          <div className="space-y-1">
            <p className="font-medium">{getOrderPaymentLabel(order)}</p>
            <p className="text-xs text-muted-foreground">
              {isPhysical ? "Collected in person" : "Recorded digitally"}
            </p>
          </div>
        );
      },
    },
    {
      id: "tracking",
      header: "Tracking",
      cell: (order) => {
        const trackingStatus = getPaymentTrackingStatus(order);

        return (
          <Badge
            variant="outline"
            className={getPaymentTrackingBadgeClass(trackingStatus)}
          >
            {trackingStatus}
          </Badge>
        );
      },
    },
    {
      id: "order-status",
      header: "Order Status",
      cell: (order) => {
        const orderStatus = getOrderStatusLabel(order);
        const orderStatusKey = orderStatus.toLowerCase();

        return (
          <Badge
            variant="outline"
            className={
              orderStatusClass[orderStatusKey] ||
              "bg-muted text-muted-foreground border-border"
            }
          >
            {orderStatus}
          </Badge>
        );
      },
    },
    {
      id: "amount",
      header: "Amount",
      cell: (order) => (
        <span className="font-semibold">{formatCurrency(getOrderTotal(order))}</span>
      ),
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
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-sm text-muted-foreground">
          Track all user payments and keep physical payment collections visible
          in one admin view.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payment Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{paymentRecords.length}</div>
              <Wallet className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Physical Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{physicalPayments.length}</div>
              <Banknote className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Awaiting Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{awaitingCollection.length}</div>
              <Clock3 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Collected Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {formatCurrency(collectedPhysicalValue)}
              </div>
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
            <div className="relative">
              <Input
                placeholder="Search by order or customer..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            <Select
              value={methodFilter}
              onValueChange={(value) => {
                setMethodFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={trackingFilter}
              onValueChange={(value) => {
                setTrackingFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter tracking status" />
              </SelectTrigger>
              <SelectContent>
                {paymentTrackingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center justify-end text-sm text-muted-foreground">
              {isFetching && !isLoading
                ? "Refreshing..."
                : `Total value ${formatCurrency(totalPaymentValue)}`}
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={paymentColumns}
        data={paginatedPayments}
        getRowKey={(order) => String(order.id)}
        loading={isLoading}
        error={
          isError
            ? (error as Error)?.message || "Failed to load payment records."
            : null
        }
        loadingMessage="Loading payment records..."
        emptyMessage="No payment records found."
        tableClassName="min-w-[1120px]"
        rowClassName={(order) =>
          isPhysicalPaymentMethod(order) &&
          getPaymentTrackingStatus(order) === "Awaiting Collection"
            ? "bg-amber-50/40"
            : undefined
        }
        pagination={{
          page: currentPage,
          pageSize: PAYMENTS_PER_PAGE,
          totalItems: filteredPayments.length,
          totalPages,
          onPrevious: () => setCurrentPage((page) => Math.max(1, page - 1)),
          onNext: () =>
            setCurrentPage((page) => Math.min(totalPages, page + 1)),
        }}
      />
    </div>
  );
}
