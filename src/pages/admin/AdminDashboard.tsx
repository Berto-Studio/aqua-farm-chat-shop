
import DashboardCard from "@/components/admin/DashboardCard";
import StatisticsChart from "@/components/admin/StatisticsChart";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  MessageCircle,
  DollarSign
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <DashboardCard
          title="Total Revenue"
          value="$24,356.00"
          icon={<DollarSign className="h-4 w-4" />}
          trendValue={12.3}
          trendLabel="from last month"
        />
        <DashboardCard
          title="Orders"
          value="142"
          icon={<ShoppingCart className="h-4 w-4" />}
          trendValue={-2.5}
          trendLabel="from last month"
        />
        <DashboardCard
          title="Products"
          value="35"
          icon={<Package className="h-4 w-4" />}
        />
        <DashboardCard
          title="Customers"
          value="89"
          icon={<Users className="h-4 w-4" />}
          trendValue={8.1}
          trendLabel="from last month"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <StatisticsChart 
          title="Sales Overview" 
          description="Compare sales by fish type"
        />
        <StatisticsChart 
          title="Order Trends" 
          description="Monthly order statistics"
        />
      </div>
      
      {/* Recent Activities Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Order ID</th>
                  <th className="text-left py-3 px-2">Customer</th>
                  <th className="text-left py-3 px-2">Products</th>
                  <th className="text-left py-3 px-2">Total</th>
                  <th className="text-left py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { 
                    id: "ORD-5623", 
                    customer: "John Smith", 
                    products: "Catfish Fingerlings x2", 
                    total: "$52.99", 
                    status: "Delivered" 
                  },
                  { 
                    id: "ORD-5622", 
                    customer: "Sarah Johnson", 
                    products: "Tilapia Mature x1", 
                    total: "$69.99", 
                    status: "Processing" 
                  },
                  { 
                    id: "ORD-5621", 
                    customer: "Michael Brown", 
                    products: "Catfish Mature x2", 
                    total: "$179.98", 
                    status: "Shipped" 
                  },
                  { 
                    id: "ORD-5620", 
                    customer: "Emily Davis", 
                    products: "Tilapia Fingerlings x3", 
                    total: "$59.97", 
                    status: "Delivered" 
                  },
                ].map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-3 px-2">{order.id}</td>
                    <td className="py-3 px-2">{order.customer}</td>
                    <td className="py-3 px-2">{order.products}</td>
                    <td className="py-3 px-2">{order.total}</td>
                    <td className="py-3 px-2">
                      <span 
                        className={`inline-block px-2 py-1 rounded text-xs ${
                          order.status === "Delivered" 
                            ? "bg-green-100 text-green-800" 
                            : order.status === "Processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Recent Messages</h2>
          <div className="space-y-4">
            {[
              { 
                id: "msg-1", 
                user: "John Doe", 
                message: "Hello, I'm interested in purchasing some catfish fingerlings. Do you ship to California?", 
                time: "10:23 AM" 
              },
              { 
                id: "msg-2", 
                user: "Sarah Smith", 
                message: "Hi there, I received my order of tilapia but one of the fish looks unhealthy. Can you help?", 
                time: "09:45 AM" 
              },
              { 
                id: "msg-3", 
                user: "Michael Johnson", 
                message: "What's the minimum order quantity for catfish?", 
                time: "Yesterday" 
              },
            ].map((message) => (
              <div key={message.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  {message.user.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{message.user}</span>
                    <span className="text-xs text-muted-foreground">{message.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{message.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
