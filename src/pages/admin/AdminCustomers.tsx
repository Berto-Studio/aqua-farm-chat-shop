
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
import { Users, Search, Eye, Mail, UserPlus, ShoppingCart } from "lucide-react";

// Mock data for customers
const customers = [
  {
    id: "CUST-001",
    name: "John Doe",
    email: "john.doe@example.com",
    location: "New York, USA",
    orders: 5,
    spent: 325.75,
    status: "Active",
    joined: "2025-01-15"
  },
  {
    id: "CUST-002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    location: "Los Angeles, USA",
    orders: 3,
    spent: 175.50,
    status: "Active",
    joined: "2025-02-10"
  },
  {
    id: "CUST-003",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    location: "Chicago, USA",
    orders: 8,
    spent: 510.25,
    status: "Active",
    joined: "2025-03-20"
  },
  {
    id: "CUST-004",
    name: "Lisa Anderson",
    email: "lisa.anderson@example.com",
    location: "Miami, USA",
    orders: 1,
    spent: 62.75,
    status: "Inactive",
    joined: "2025-04-05"
  },
  {
    id: "CUST-005",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    location: "Austin, USA",
    orders: 2,
    spent: 150.00,
    status: "Active",
    joined: "2025-05-01"
  }
];

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Customer Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{customers.length}</div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {customers.filter(c => c.status === "Active").length}
              </div>
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
              <div className="text-2xl font-bold">
                {customers.reduce((sum, customer) => sum + customer.orders, 0)}
              </div>
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
                ${customers.reduce((sum, customer) => sum + customer.spent, 0).toFixed(2)}
              </div>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-md">
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Spent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.id}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.location}</TableCell>
                <TableCell>{customer.orders}</TableCell>
                <TableCell>${customer.spent.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={customer.status === "Active" ? "success" : "secondary"}>
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Mail className="h-4 w-4" />
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
