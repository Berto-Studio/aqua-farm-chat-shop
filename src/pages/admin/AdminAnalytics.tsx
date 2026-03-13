import { useMemo } from "react";
import { Label, Pie, PieChart, Cell } from "recharts";
import DashboardCard from "@/components/admin/DashboardCard";
import StatisticsChart from "@/components/admin/StatisticsChart";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProducts } from "@/hooks/useProducts";
import { useAdminConversations } from "@/hooks/useAdminMessages";
import { useAdminOrders, useAdminOrderStats } from "@/hooks/useAdminOrders";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import {
  buildAdminAnalyticsDatasets,
  getAdminAnalyticsDelta,
  getTopActiveCustomer,
} from "@/lib/adminAnalytics";
import {
  DollarSign,
  MessageSquare,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

const statusColors: Record<string, string> = {
  delivered: "#14532d",
  processing: "#166534",
  pending: "#15803d",
  cancelled: "#22c55e",
};

const paymentPalette = [
  "#14532d",
  "#166534",
  "#15803d",
  "#16a34a",
  "#22c55e",
  "#4ade80",
];

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const formatCompactCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}m`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
};

const createPieConfig = (
  rows: Array<{ key: string; name: string }>,
  colors: string[] | Record<string, string>,
) =>
  rows.reduce<ChartConfig>((config, row, index) => {
    config[row.key] = {
      label: row.name,
      color: Array.isArray(colors)
        ? colors[index % colors.length]
        : colors[row.key] || paymentPalette[index % paymentPalette.length],
    };
    return config;
  }, {});

export default function AdminAnalytics() {
  const { data: products = [], isLoading: isProductsLoading } = useProducts();
  const { data: usersResponse, isLoading: isUsersLoading } = useAdminUsers({
    per_page: 500,
  });
  const { data: ordersResponse, isLoading: isOrdersLoading } = useAdminOrders({
    per_page: 500,
    sort_by: "date",
    sort_dir: "asc",
  });
  const { data: orderStats } = useAdminOrderStats();
  const { data: conversationsResponse, isLoading: isConversationsLoading } =
    useAdminConversations();

  const users = usersResponse?.data || [];
  const orders = ordersResponse?.data || [];
  const conversations = conversationsResponse?.data || [];
  const analytics = useMemo(
    () =>
      buildAdminAnalyticsDatasets({
        orders,
        users,
        products,
        conversations,
        months: 12,
      }),
    [conversations, orders, products, users],
  );
  const isLoading =
    isProductsLoading ||
    isUsersLoading ||
    isOrdersLoading ||
    isConversationsLoading;

  const totalRevenue =
    orderStats?.total_revenue ?? analytics.summary.totalRevenue;
  const totalOrders =
    orderStats?.total_orders ??
    ordersResponse?.meta?.total ??
    analytics.summary.totalOrders;
  const totalUsers = usersResponse?.meta?.total ?? analytics.summary.totalUsers;
  const totalProducts = products.length;
  const totalRevenueDelta = getAdminAnalyticsDelta(
    analytics.timeline.map((entry) => entry.revenue),
  );
  const totalOrderDelta = getAdminAnalyticsDelta(
    analytics.timeline.map((entry) => entry.orders),
  );
  const newUserDelta = getAdminAnalyticsDelta(
    analytics.timeline.map((entry) => entry.newUsers),
  );
  const messageDelta = getAdminAnalyticsDelta(
    analytics.timeline.map((entry) => entry.conversations),
  );
  const orderStatusConfig = createPieConfig(analytics.orderStatus, statusColors);
  const paymentConfig = createPieConfig(
    analytics.paymentMethods,
    paymentPalette,
  );

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Admin Analytics</h1>
        <p className="text-sm text-muted-foreground">
          One view for revenue, orders, customers, products and support
          activity across the admin workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <DashboardCard
          title="Revenue"
          value={formatCurrency(totalRevenue)}
          description={`Avg order ${formatCurrency(analytics.summary.averageOrderValue)}`}
          icon={<DollarSign className="h-4 w-4" />}
          className="border"
          trendValue={totalRevenueDelta}
          trendLabel="vs last month"
        />
        <DashboardCard
          title="Orders"
          value={totalOrders}
          description={`${analytics.summary.totalItemsSold} items sold`}
          icon={<ShoppingCart className="h-4 w-4" />}
          className="border"
          trendValue={totalOrderDelta}
          trendLabel="vs last month"
        />
        <DashboardCard
          title="Customers"
          value={totalUsers}
          description={`${analytics.summary.activeUsers} active users`}
          icon={<Users className="h-4 w-4" />}
          className="border"
          trendValue={newUserDelta}
          trendLabel="new users"
        />
        <DashboardCard
          title="Products"
          value={totalProducts}
          description={`${analytics.summary.inventoryUnits} units in stock`}
          icon={<Package className="h-4 w-4" />}
          className="border"
        />
        <DashboardCard
          title="Conversations"
          value={analytics.summary.totalConversations}
          description={`${analytics.summary.unreadMessages} unread messages`}
          icon={<MessageSquare className="h-4 w-4" />}
          className="border"
          trendValue={messageDelta}
          trendLabel="vs last month"
        />
        <DashboardCard
          title="Top Customer"
          value={getTopActiveCustomer(users)}
          description={`${analytics.summary.uniqueCustomers} unique buyers`}
          icon={<TrendingUp className="h-4 w-4" />}
          className="border"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <StatisticsChart
          title="Revenue Trend"
          description="Revenue generated each month from admin order history"
          data={analytics.timeline}
          xKey="period"
          kind="area"
          valueFormatter={formatCompactCurrency}
          series={[
            {
              key: "revenue",
              label: "Revenue",
              color: "hsl(var(--primary))",
              kind: "area",
            },
          ]}
          emptyMessage={
            isLoading ? "Loading revenue trend..." : "No revenue data yet."
          }
        />
        <StatisticsChart
          title="Order Volume"
          description="Orders placed and items sold through the year"
          data={analytics.timeline}
          xKey="period"
          kind="line"
          series={[
            {
              key: "orders",
              label: "Orders",
              color: "#166534",
              kind: "line",
            },
            {
              key: "items",
              label: "Items",
              color: "#22c55e",
              kind: "line",
            },
          ]}
          emptyMessage={
            isLoading ? "Loading order volume..." : "No order volume data yet."
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(320px,1fr)]">
        <StatisticsChart
          title="Fulfillment Pipeline"
          description="Delivered, processing, pending and cancelled orders per month"
          data={analytics.timeline}
          xKey="period"
          kind="bar"
          series={[
            {
              key: "delivered",
              label: "Delivered",
              color: statusColors.delivered,
              kind: "bar",
              stackId: "status",
            },
            {
              key: "processing",
              label: "Processing",
              color: statusColors.processing,
              kind: "bar",
              stackId: "status",
            },
            {
              key: "pending",
              label: "Pending",
              color: statusColors.pending,
              kind: "bar",
              stackId: "status",
            },
            {
              key: "cancelled",
              label: "Cancelled",
              color: statusColors.cancelled,
              kind: "bar",
              stackId: "status",
            },
          ]}
          emptyMessage={
            isLoading
              ? "Loading fulfillment breakdown..."
              : "No fulfillment data yet."
          }
        />

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Order Status Split</CardTitle>
            <CardDescription>
              Current order outcome distribution from loaded admin orders
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-[24rem] items-center justify-center">
            {analytics.orderStatus.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {isLoading ? "Loading status distribution..." : "No order statuses yet."}
              </div>
            ) : (
              <ChartContainer
                config={orderStatusConfig}
                className="h-full min-h-[20rem] w-full aspect-auto"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <div className="flex min-w-[140px] items-center gap-2">
                            <span className="text-muted-foreground">
                              {String(name)}
                            </span>
                            <span className="ml-auto font-mono font-medium text-foreground">
                              {Number(value).toLocaleString()}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={analytics.orderStatus}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={104}
                    paddingAngle={3}
                    strokeWidth={2}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                          return null;
                        }

                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-2xl font-semibold"
                            >
                              {analytics.summary.totalOrders}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy + 20}
                              className="fill-muted-foreground text-xs"
                            >
                              Orders
                            </tspan>
                          </text>
                        );
                      }}
                    />
                    {analytics.orderStatus.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={`var(--color-${entry.key})`}
                      />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    className="flex-wrap"
                  />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <StatisticsChart
          title="Customer Growth"
          description="New customers added per month"
          data={analytics.timeline}
          xKey="period"
          kind="line"
          series={[
            {
              key: "newUsers",
              label: "New Users",
              color: "#15803d",
              kind: "line",
            },
          ]}
          emptyMessage={
            isLoading ? "Loading customer growth..." : "No customer growth data yet."
          }
        />
        <StatisticsChart
          title="Support Activity"
          description="Conversation activity based on recent admin message threads"
          data={analytics.timeline}
          xKey="period"
          kind="area"
          series={[
            {
              key: "conversations",
              label: "Conversations",
              color: "#16a34a",
              kind: "area",
            },
          ]}
          emptyMessage={
            isLoading ? "Loading support activity..." : "No support activity yet."
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <StatisticsChart
          title="Top Customers by Spend"
          description="Highest-spending customers from the loaded order dataset"
          data={analytics.topCustomers.map((customer) => ({
            name: customer.name,
            spend: Number(customer.spend.toFixed(2)),
          }))}
          xKey="name"
          kind="bar"
          layout="vertical"
          valueFormatter={formatCompactCurrency}
          series={[
            {
              key: "spend",
              label: "Spend",
              color: "hsl(var(--primary))",
              kind: "bar",
              radius: [0, 6, 6, 0],
            },
          ]}
          emptyMessage={
            isLoading ? "Loading top customers..." : "No customer spend data yet."
          }
        />

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Checkout method mix and revenue contribution
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-[24rem] items-center justify-center">
            {analytics.paymentMethods.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {isLoading ? "Loading payment methods..." : "No payment data yet."}
              </div>
            ) : (
              <ChartContainer
                config={paymentConfig}
                className="h-full min-h-[20rem] w-full aspect-auto"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, item, _index, payload) => (
                          <div className="grid min-w-[160px] gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                {String(name)}
                              </span>
                              <span className="ml-auto font-mono font-medium text-foreground">
                                {Number(value).toLocaleString()} orders
                              </span>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              {formatCurrency(Number(payload?.revenue || 0))}
                            </div>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={analytics.paymentMethods}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={68}
                    outerRadius={102}
                    paddingAngle={3}
                    strokeWidth={2}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                          return null;
                        }

                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-2xl font-semibold"
                            >
                              {analytics.paymentMethods.length}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy + 20}
                              className="fill-muted-foreground text-xs"
                            >
                              Methods
                            </tspan>
                          </text>
                        );
                      }}
                    />
                    {analytics.paymentMethods.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={`var(--color-${entry.key})`}
                      />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    className="flex-wrap"
                  />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <StatisticsChart
        title="Inventory by Category"
        description="Current stock units grouped by product category"
        data={analytics.productCategories.map((category) => ({
          name: category.name,
          inventory: category.inventory,
        }))}
        xKey="name"
        kind="bar"
        layout="vertical"
        series={[
          {
            key: "inventory",
            label: "Inventory",
            color: "#166534",
            kind: "bar",
            radius: [0, 6, 6, 0],
          },
        ]}
        emptyMessage={
          isLoading ? "Loading inventory..." : "No category inventory data yet."
        }
      />
    </div>
  );
}
