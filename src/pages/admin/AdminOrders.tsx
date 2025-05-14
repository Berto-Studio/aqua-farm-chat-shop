
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ShoppingCart, Eye, Calendar, ArrowUp, ArrowDown } from "lucide-react";

// Mock data for orders
const orders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    date: "2025-05-10",
    status: "Delivered",
    total: 125.99,
    items: 3,
    payment: "Credit Card"
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    date: "2025-05-09",
    status: "Processing",
    total: 75.50,
    items: 1,
    payment: "PayPal"
  },
  {
    id: "ORD-003",
    customer: "Robert Johnson",
    date: "2025-05-08",
    status: "Pending",
    total: 210.25,
    items: 5,
    payment: "Bank Transfer"
  },
  {
    id: "ORD-004",
    customer: "Lisa Anderson",
    date: "2025-05-07",
    status: "Delivered",
    total: 62.75,
    items: 2,
    payment: "Credit Card"
  },
  {
    id: "ORD-005",
    customer: "Michael Brown",
    date: "2025-05-06",
    status: "Cancelled",
    total: 150.00,
    items: 4,
    payment: "PayPal"
  }
];

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  
  const filteredOrders = orders.filter((order) =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === "date") {
      return sortDirection === "asc"
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date);
    } else if (sortBy === "total") {
      return sortDirection === "asc"
        ? a.total - b.total
        : b.total - a.total;
    }
    return 0;
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy === column) {
      return sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
    }
    return null;
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Orders Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{orders.length}</div>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {orders.filter(o => o.status === "Pending").length}
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Delivered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {orders.filter(o => o.status === "Delivered").length}
              </div>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
              </div>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-md">
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                <div className="flex items-center gap-1">
                  Date {getSortIcon("date")}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("total")}>
                <div className="flex items-center gap-1">
                  Total {getSortIcon("total")}
                </div>
              </TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>{order.payment}</TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                      <span className="ml-1 hidden md:inline">View</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
