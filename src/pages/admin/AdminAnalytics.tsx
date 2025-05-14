
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { ChartBar, TrendingUp, PieChart as PieChartIcon, Users } from "lucide-react";

// Mock data for sales chart
const monthlySalesData = [
  { name: "Jan", catfish: 4000, tilapia: 2400 },
  { name: "Feb", catfish: 3000, tilapia: 1398 },
  { name: "Mar", catfish: 2000, tilapia: 9800 },
  { name: "Apr", catfish: 2780, tilapia: 3908 },
  { name: "May", catfish: 1890, tilapia: 4800 },
  { name: "Jun", catfish: 2390, tilapia: 3800 },
  { name: "Jul", catfish: 3490, tilapia: 4300 },
  { name: "Aug", catfish: 4000, tilapia: 2400 },
  { name: "Sep", catfish: 3000, tilapia: 1398 },
  { name: "Oct", catfish: 2000, tilapia: 9800 },
  { name: "Nov", catfish: 2780, tilapia: 3908 },
  { name: "Dec", catfish: 1890, tilapia: 4800 },
];

// Mock data for customer growth chart
const customerGrowthData = [
  { name: "Jan", customers: 100 },
  { name: "Feb", customers: 120 },
  { name: "Mar", customers: 150 },
  { name: "Apr", customers: 180 },
  { name: "May", customers: 210 },
  { name: "Jun", customers: 250 },
  { name: "Jul", customers: 300 },
  { name: "Aug", customers: 350 },
  { name: "Sep", customers: 390 },
  { name: "Oct", customers: 410 },
  { name: "Nov", customers: 450 },
  { name: "Dec", customers: 500 },
];

// Mock data for product distribution chart
const productDistributionData = [
  { name: "Catfish Fingerlings", value: 40 },
  { name: "Catfish Mature", value: 20 },
  { name: "Tilapia Fingerlings", value: 25 },
  { name: "Tilapia Mature", value: 15 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdminAnalytics() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,580.50</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">345</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+5 new products this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,205</div>
            <p className="text-xs text-muted-foreground">+20 new customers this week</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4 w-full sm:w-[400px]">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlySalesData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="catfish" fill="#1b5e20" name="Catfish" />
                    <Bar dataKey="tilapia" fill="#43a047" name="Tilapia" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={customerGrowthData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="customers" stroke="#1b5e20" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {productDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
