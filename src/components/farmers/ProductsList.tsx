
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
    if (stock === 0) return <Badge variant="destructive" className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">Out of Stock</Badge>;
    if (stock < 10) return <Badge variant="secondary" className="bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">Low Stock</Badge>;
    return <Badge variant="default" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">Active</Badge>;
  };

  return (
    <Card className="border shadow-sm bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-card-foreground">Product Inventory</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/50">
                <TableHead className="font-semibold text-muted-foreground py-4">Product Name</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Category</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Price</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Stock</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Total Sales</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium py-4 text-card-foreground">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.category}</TableCell>
                  <TableCell className="font-semibold text-card-foreground">GHS {product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">{product.stock}</TableCell>
                  <TableCell>{getStatusBadge(product.status, product.stock)}</TableCell>
                  <TableCell className="font-medium text-card-foreground">{product.sales}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-600 dark:hover:text-green-400">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
