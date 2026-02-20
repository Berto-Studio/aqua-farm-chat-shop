
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from "recharts";
import { useTheme } from "next-themes";

export default function FarmerAnalytics() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Mock analytics data
  const monthlyData = [
    { month: "Jan", sales: 400, revenue: 2400 },
    { month: "Feb", sales: 300, revenue: 1398 },
    { month: "Mar", sales: 500, revenue: 3800 },
    { month: "Apr", sales: 278, revenue: 3908 },
    { month: "May", sales: 189, revenue: 4800 },
    { month: "Jun", sales: 239, revenue: 3800 },
  ];

  const categoryData = [
    { name: "Vegetables", value: 400, color: "hsl(var(--primary))" },
    { name: "Fruits", value: 300, color: "#10b981" },
    { name: "Live Stock", value: 200, color: "#f59e0b" },
    { name: "Fish", value: 100, color: "#ef4444" },
    { name: "Farm Equipment", value: 150, color: "#3b82f6" },
  ];

  const topProducts = [
    { name: "Fresh Tomatoes", sales: 120, revenue: 3000 },
    { name: "Organic Lettuce", sales: 85, revenue: 1275 },
    { name: "Free Range Eggs", sales: 200, revenue: 9000 },
    { name: "Sweet Corn", sales: 60, revenue: 1800 },
  ];

  const chartConfig = {
    sales: {
      label: "Sales",
      color: "hsl(var(--primary))",
    },
    revenue: {
      label: "Revenue",
      color: "#10b981",
    },
    vegetables: {
      label: "Vegetables",
      color: "hsl(var(--primary))",
    },
    fruits: {
      label: "Fruits",
      color: "#10b981",
    },
    livestock: {
      label: "Live Stock",
      color: "#f59e0b",
    },
    fish: {
      label: "Fish",
      color: "#ef4444",
    },
    farmEquipment: {
      label: "Farm Equipment",
      color: "#3b82f6",
    },
  };

  // Theme-aware colors
  const gridColor = isDark ? "#374151" : "#f1f5f9";
  const textColor = isDark ? "#9ca3af" : "#64748b";

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-card-foreground">Analytics Overview</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Track your sales performance and product analytics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="border shadow-sm bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-card-foreground">Sales Trend</CardTitle>
            <CardDescription className="text-sm">Sales volume over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: textColor }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: textColor }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fill="url(#salesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-card-foreground">Revenue Insights</CardTitle>
            <CardDescription className="text-sm">Monthly revenue in GHS</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: textColor }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: textColor }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="revenue" 
                    fill="#10b981" 
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="border shadow-sm bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-card-foreground">Category Distribution</CardTitle>
            <CardDescription className="text-sm">Sales distribution across product categories</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-card-foreground">Top Products</CardTitle>
            <CardDescription className="text-sm">Best performing products by revenue</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3 sm:space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gradient-to-r from-muted/50 to-card border border-border">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-card-foreground text-sm sm:text-base">{product.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{product.sales} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400 text-sm sm:text-lg">GHS {product.revenue}</p>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
