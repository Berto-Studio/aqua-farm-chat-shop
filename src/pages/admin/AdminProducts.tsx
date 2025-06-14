
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Pencil, Trash } from "lucide-react";
import { products } from "@/data/products";

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product to add to your inventory.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input id="product-name" placeholder="Enter product name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select id="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                  <option value="">Select category</option>
                  <option value="catfish">Catfish</option>
                  <option value="tilapia">Tilapia</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" type="number" placeholder="0.00" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" type="number" placeholder="0" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea 
                  id="description" 
                  rows={3} 
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder="Enter product description"
                ></textarea>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Save Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-md">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Age</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const productAge = product.animal_stage === 0 ? "young" : product.animal_stage === 1 ? "mature" : "N/A";
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="h-10 w-10 rounded-md overflow-hidden">
                      <img 
                        src={product.image_url || (typeof product.image === 'string' ? product.image : '')} 
                        alt={product.title} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {productAge}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ${product.price.toFixed(2)}
                    {product.discount_percentage && (
                      <span className="text-red-500 text-xs ml-2">-{product.discount_percentage}%</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.quantity} units
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button size="sm" variant="ghost">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
