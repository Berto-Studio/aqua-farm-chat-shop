import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getAdminUserById,
  getOrdersByUserId,
} from "@/data/adminDashboard";

export default function AdminCustomerDetails() {
  const navigate = useNavigate();
  const { userId, customerId } = useParams<{
    userId?: string;
    customerId?: string;
  }>();
  const resolvedUserId = userId || customerId;

  const user = useMemo(
    () => (resolvedUserId ? getAdminUserById(resolvedUserId) : undefined),
    [resolvedUserId]
  );
  const orders = useMemo(
    () => (resolvedUserId ? getOrdersByUserId(resolvedUserId) : []),
    [resolvedUserId]
  );

  if (!user) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <Card>
          <CardContent className="p-6 text-destructive">User not found.</CardContent>
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
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Button onClick={() => navigate(`/admin/users/${user.id}/message`)}>
          <Mail className="mr-2 h-4 w-4" />
          Message User
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Status
              </p>
              <Badge
                variant={user.status === "Active" ? "success" : "secondary"}
                className="mt-2"
              >
                {user.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Phone
              </p>
              <p className="mt-1 font-medium">{user.phone}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Location
              </p>
              <p className="mt-1 font-medium">{user.location}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Joined
              </p>
              <p className="mt-1 font-medium">{user.joined}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Orders
                </p>
                <p className="mt-1 text-2xl font-bold">{user.orders}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total Spent
                </p>
                <p className="mt-1 text-2xl font-bold">
                  ${user.spent.toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Average Order
                </p>
                <p className="mt-1 text-2xl font-bold">
                  $
                  {(user.orders > 0
                    ? user.spent / user.orders
                    : 0
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-muted-foreground">No orders found for this user.</p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold">{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.date} | {order.itemsCount} items
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{order.status}</Badge>
                  <p className="font-semibold">${order.total.toFixed(2)}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                  >
                    View Order
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
