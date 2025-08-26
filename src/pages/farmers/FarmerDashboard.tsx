import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  DollarSign,
  Package,
  TrendingUp,
  Eye,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import AddProductForm from "@/components/farmers/AddProductForm";
import PaginatedProductsList from "@/components/farmers/PaginatedProductsList";
import FarmerAnalytics from "@/components/farmers/FarmerAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { GetFarmerOrders } from "@/services/orders";
import { GetFarmerStats } from "@/services/products";
import { useFarmerStats } from "@/hooks/useFarmerStats";

export default function FarmerDashboard() {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderProps[]>();
  const { data: stats, isLoading } = useFarmerStats();

  async function fetchOrders() {
    const res = await GetFarmerOrders();
    if (res.success) {
      setOrders(res.data);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const farmerStats = {
    totalProducts: 12,
    totalSales: 2540.5,
    monthlyRevenue: 850.0,
    pendingOrders: 5,
  };

  const StatCard = ({
    title,
    value,
    description,
    icon,
    trend,
    trendValue,
  }: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ReactNode;
    trend?: "up" | "down";
    trendValue?: string;
  }) => (
    <Card className="relative overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 bg-card">
      <div className="absolute inset-0 bg-gradient-to-br from-card to-muted/30" />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="text-2xl font-bold text-card-foreground">{value}</div>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="relative pt-0">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && trendValue && (
            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                trend === "up"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {trend === "up" ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              {trendValue}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Farmer Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Welcome back, {user?.full_name || "Farmer"}! Manage your products
            and track your sales performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Products"
            value={stats?.totalProducts}
            description={`+${stats?.recentProducts}% new this week`}
            icon={<Package className="h-5 w-5 text-primary" />}
            trend="up"
            trendValue={stats?.percentageGrowth}
          />
          <StatCard
            title="Total Sales"
            value={`GHS ${stats?.monthlyRevenue || 0}`}
            description="All time earnings"
            icon={<DollarSign className="h-5 w-5 text-primary" />}
            trend="up"
            trendValue="+8.2%"
          />
          <StatCard
            title="Monthly Revenue"
            value={`GHS ${farmerStats.monthlyRevenue.toFixed(2)}`}
            description="This month"
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
            trend="up"
            trendValue="+15%"
          />
          <StatCard
            title="Pending Orders"
            value={farmerStats.pendingOrders}
            description="Awaiting fulfillment"
            icon={<Eye className="h-5 w-5 text-primary" />}
          />
        </div>

        {/* Main Content */}
        <Card className="border shadow-sm bg-card">
          <CardContent className="p-0">
            <Tabs defaultValue="products" className="w-full">
              <div className="border-b border-border px-6 pt-6">
                <TabsList className="grid w-full grid-cols-3 h-12 bg-muted">
                  <TabsTrigger value="products" className="text-sm font-medium">
                    My Products
                  </TabsTrigger>
                  <TabsTrigger
                    value="analytics"
                    className="text-sm font-medium"
                  >
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="text-sm font-medium">
                    Orders
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="products" className="space-y-6 p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-card-foreground">
                      My Products
                    </h2>
                    <p className="text-muted-foreground">
                      Manage your product inventory
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowAddProduct(true)}
                    className="gap-2 h-11 px-6"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </div>

                {showAddProduct ? (
                  <AddProductForm onClose={() => setShowAddProduct(false)} />
                ) : (
                  <PaginatedProductsList />
                )}
              </TabsContent>

              <TabsContent value="analytics" className="p-6">
                <FarmerAnalytics />
              </TabsContent>

              <TabsContent value="orders" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-card-foreground">
                      Recent Orders
                    </h2>
                    <p className="text-muted-foreground">
                      Orders from your customers
                    </p>
                  </div>
                  <div className="space-y-4">
                    {orders?.map((order, key) => (
                      <Card
                        key={key}
                        className="border shadow-sm hover:shadow-md transition-all duration-300 bg-card"
                      >
                        <CardContent className="flex items-center justify-between p-6">
                          <div className="space-y-1">
                            <p className="font-semibold text-card-foreground">
                              Order #{key}001
                            </p>
                            <p className="text-sm text-muted-foreground">
                              2 items • GHS 45.00
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                          >
                            {order.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
