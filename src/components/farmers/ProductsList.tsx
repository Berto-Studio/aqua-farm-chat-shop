
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Eye } from "lucide-react";

export default function ProductsList() {
  // Mock products data
  const [products] = useState([
    {
      id: "1",
      name: "Fresh Tomatoes",
      category: "Vegetables",
      price: 25.00,
      stock: 50,
      status: "Active",
      sales: 120,
    },
    {
      id: "2",
      name: "Organic Lettuce",
      category: "Vegetables",
      price: 15.00,
      stock: 30,
      status: "Active",
      sales: 85,
    },
    {
      id: "3",
      name: "Free Range Eggs",
      category: "Live Stock",
      price: 45.00,
      stock: 0,
      status: "Out of Stock",
      sales: 200,
    },
  ]);

  const getStatusBadge = (status: string, stock: number) => {
    if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock < 10) return <Badge variant="secondary">Low Stock</Badge>;
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Sales</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>GHS {product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{getStatusBadge(product.status, product.stock)}</TableCell>
                <TableCell>{product.sales}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
