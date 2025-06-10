
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
    if (stock === 0) return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">Out of Stock</Badge>;
    if (stock < 10) return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">Low Stock</Badge>;
    return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Product Inventory</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700 py-4">Product Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Category</TableHead>
                <TableHead className="font-semibold text-gray-700">Price</TableHead>
                <TableHead className="font-semibold text-gray-700">Stock</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Total Sales</TableHead>
                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="font-medium py-4">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.category}</TableCell>
                  <TableCell className="font-semibold">GHS {product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">{product.stock}</TableCell>
                  <TableCell>{getStatusBadge(product.status, product.stock)}</TableCell>
                  <TableCell className="font-medium">{product.sales}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-green-50 hover:text-green-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-600">
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
