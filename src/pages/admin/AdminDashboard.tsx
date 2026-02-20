import { formatDistanceToNow } from "date-fns";
import DashboardCard from "@/components/admin/DashboardCard";
import StatisticsChart from "@/components/admin/StatisticsChart";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAdminConversations } from "@/hooks/useAdminMessages";
import { useAdminOrders, useAdminOrderStats } from "@/hooks/useAdminOrders";
import {
  getOrderItemsCount,
  getOrderStatusLabel,
  getOrderTotal,
  getOrderUserName,
  getUserDisplayName,
  mapAdminConversationToChatConversation,
} from "@/lib/adminTransformers";

const statusClass: Record<string, string> = {
  delivered: "bg-green-50 text-green-700 border border-green-200",
  processing: "bg-blue-50 text-blue-700 border border-blue-200",
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  cancelled: "bg-red-50 text-red-700 border border-red-200",
};

export default function AdminDashboard() {
  const { data: products = [] } = useProducts();
  const { data: usersResponse } = useAdminUsers({ per_page: 200 });
  const { data: ordersResponse, isLoading: isOrdersLoading } = useAdminOrders({
    per_page: 20,
    sort_by: "date",
    sort_dir: "desc",
  });
  const { data: orderStats } = useAdminOrderStats();
  const { data: conversationsResponse } = useAdminConversations();

  const users = usersResponse?.data || [];
  const orders = ordersResponse?.data || [];
  const conversations = (conversationsResponse?.data || [])
    .map(mapAdminConversationToChatConversation)
    .sort(
      (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
    );

  const totalRevenue =
    orderStats?.total_revenue ??
    orders.reduce((sum, order) => sum + getOrderTotal(order), 0);
  const totalOrders = orderStats?.total_orders ?? ordersResponse?.meta?.total ?? orders.length;
  const totalUsers = usersResponse?.meta?.total ?? users.length;
  const totalProducts = products.length;

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.created_at || "").getTime() -
        new Date(a.created_at || "").getTime()
    )
    .slice(0, 5);

  const recentMessages = conversations.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      <div className="p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base lg:text-lg">
            Live overview of orders, users, products and conversations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <DashboardCard
            title="Total Revenue"
            value={`$${Number(totalRevenue || 0).toFixed(2)}`}
            icon={<DollarSign className="h-4 w-4" />}
          />
          <DashboardCard
            title="Orders"
            value={totalOrders}
            icon={<ShoppingCart className="h-4 w-4" />}
          />
          <DashboardCard
            title="Products"
            value={totalProducts}
            icon={<Package className="h-4 w-4" />}
          />
          <DashboardCard
            title="Users"
            value={totalUsers}
            icon={<Users className="h-4 w-4" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatisticsChart
            title="Sales Overview"
            description="Compare sales by fish type"
          />
          <StatisticsChart
            title="Order Trends"
            description="Monthly order statistics"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg border border-0 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Order ID</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 hidden sm:table-cell">User</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Products</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Total</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isOrdersLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Loading recent orders...
                      </td>
                    </tr>
                  ) : recentOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No orders yet.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => {
                      const status = getOrderStatusLabel(order);

                      return (
                        <tr
                          key={order.id}
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-3 px-2 font-medium">{order.id}</td>
                          <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">
                            {getOrderUserName(order)}
                          </td>
                          <td className="py-3 px-2 text-muted-foreground">
                            <div className="truncate max-w-[120px] sm:max-w-none">
                              {getOrderItemsCount(order)} items
                            </div>
                          </td>
                          <td className="py-3 px-2 font-semibold">
                            ${getOrderTotal(order).toFixed(2)}
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                statusClass[status.toLowerCase()] ||
                                "bg-gray-50 text-gray-700 border border-gray-200"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg border border-0 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Recent Messages</h2>
            <div className="space-y-4">
              {recentMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No messages yet.</p>
              ) : (
                recentMessages.map((conversation) => {
                  const lastMessage =
                    conversation.messages[conversation.messages.length - 1];

                  return (
                    <div
                      key={conversation.id}
                      className="flex items-start gap-3 pb-4 border-b last:border-0"
                    >
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                        {getUserDisplayName({
                          id: conversation.userId,
                          email: "",
                          full_name: conversation.userName,
                        }).charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm sm:text-base truncate">
                            {conversation.userName}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {formatDistanceToNow(conversation.lastMessageTime, {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {lastMessage?.content || "No message preview available."}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
