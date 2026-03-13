import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search, Eye, Mail, ShoppingCart } from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  getUserDisplayName,
  getUserLocation,
  getUserOrderCount,
  getUserStatusLabel,
  getUserTotalSpent,
  isUserActive,
} from "@/lib/adminTransformers";
import type { AdminUserRecord } from "@/types/admin";

const USERS_PER_PAGE = 10;

export default function AdminCustomers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, isError, error } = useAdminUsers({ per_page: 200 });

  const users = data?.data || [];

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const q = searchTerm.toLowerCase();
        return (
          getUserDisplayName(user).toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          getUserLocation(user).toLowerCase().includes(q)
        );
      }),
    [searchTerm, users],
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USERS_PER_PAGE),
  );
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  }, [currentPage, filteredUsers]);

  const totalUsers = data?.meta?.total ?? users.length;
  const activeUsers = users.filter((user) => isUserActive(user)).length;
  const totalOrders = users.reduce(
    (sum, user) => sum + getUserOrderCount(user),
    0,
  );
  const totalRevenue = users.reduce(
    (sum, user) => sum + getUserTotalSpent(user),
    0,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const customerColumns: DataTableColumn<AdminUserRecord>[] = [
    {
      id: "id",
      header: "ID",
      cell: (_, index) => (
        <span className="font-medium">
          {(currentPage - 1) * USERS_PER_PAGE + index + 1}
        </span>
      ),
    },
    {
      id: "user",
      header: "User",
      cell: (user) => getUserDisplayName(user),
    },
    {
      id: "email",
      header: "Email",
      cell: (user) => user.email,
    },
    {
      id: "location",
      header: "Location",
      cell: (user) => getUserLocation(user),
    },
    {
      id: "orders",
      header: "Orders",
      cell: (user) => getUserOrderCount(user),
    },
    {
      id: "spent",
      header: "Spent",
      cell: (user) => `$${getUserTotalSpent(user).toFixed(2)}`,
    },
    {
      id: "status",
      header: "Status",
      cell: (user) => (
        <Badge variant={isUserActive(user) ? "success" : "secondary"}>
          {getUserStatusLabel(user)}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "text-center",
      cellClassName: "text-center",
      cell: (user) => (
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/admin/users/${user.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/admin/users/${user.id}/message`)}
          >
            <Mail className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalUsers}</div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{activeUsers}</div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

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
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                ${totalRevenue.toFixed(2)}
              </div>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-md">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <DataTable
        columns={customerColumns}
        data={paginatedUsers}
        getRowKey={(user) => String(user.id)}
        loading={isLoading}
        error={
          isError ? (error as Error)?.message || "Failed to load users." : null
        }
        loadingMessage="Loading users..."
        emptyMessage="No users found."
        tableClassName="min-w-[920px]"
        pagination={{
          page: currentPage,
          pageSize: USERS_PER_PAGE,
          totalItems: filteredUsers.length,
          totalPages,
          onPrevious: () => setCurrentPage((page) => Math.max(1, page - 1)),
          onNext: () =>
            setCurrentPage((page) => Math.min(totalPages, page + 1)),
        }}
      />
    </div>
  );
}
