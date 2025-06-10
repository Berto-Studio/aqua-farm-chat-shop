
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base lg:text-lg">Welcome back, Admin</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
        
        {/* Recent Activities Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg border border-0 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Order ID</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 hidden sm:table-cell">Customer</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Products</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Total</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Status</th>
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
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-2 font-medium">{order.id}</td>
                      <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">{order.customer}</td>
                      <td className="py-3 px-2 text-muted-foreground">
                        <div className="truncate max-w-[120px] sm:max-w-none">{order.products}</div>
                      </td>
                      <td className="py-3 px-2 font-semibold">{order.total}</td>
                      <td className="py-3 px-2">
                        <span 
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "Delivered" 
                              ? "bg-green-50 text-green-700 border border-green-200" 
                              : order.status === "Processing"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
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
          
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-0 shadow-sm">
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
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                    {message.user.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm sm:text-base truncate">{message.user}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{message.time}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
