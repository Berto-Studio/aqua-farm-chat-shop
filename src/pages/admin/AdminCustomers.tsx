import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Users, Search, Eye, Mail, ShoppingCart } from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import {
  getUserDisplayName,
  getUserLocation,
  getUserOrderCount,
  getUserStatusLabel,
  getUserTotalSpent,
  isUserActive,
} from "@/lib/adminTransformers";

export default function AdminCustomers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, isError, error } = useAdminUsers({ per_page: 200 });

  const users = data?.data || [];

  const filteredUsers = users.filter((user) => {
    const q = searchTerm.toLowerCase();
    return (
      getUserDisplayName(user).toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      getUserLocation(user).toLowerCase().includes(q)
    );
  });

  const totalUsers = data?.meta?.total ?? users.length;
  const activeUsers = users.filter((user) => isUserActive(user)).length;
  const totalOrders = users.reduce(
    (sum, user) => sum + getUserOrderCount(user),
    0
  );
  const totalRevenue = users.reduce(
    (sum, user) => sum + getUserTotalSpent(user),
    0
  );
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalUsers}</div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{activeUsers}</div>
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
              <div className="text-2xl font-bold">{totalOrders}</div>
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
                ${totalRevenue.toFixed(2)}
              </div>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-md">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {isError ? (
        <Card>
          <CardContent className="p-6 text-destructive">
            {(error as Error)?.message || "Failed to load users."}
          </CardContent>
        </Card>
      ) : null}
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Spent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : null}
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{getUserDisplayName(user)}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getUserLocation(user)}</TableCell>
                <TableCell>{getUserOrderCount(user)}</TableCell>
                <TableCell>${getUserTotalSpent(user).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={isUserActive(user) ? "success" : "secondary"}
                  >
                    {getUserStatusLabel(user)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        navigate(`/admin/users/${user.id}/message`)
                      }
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
