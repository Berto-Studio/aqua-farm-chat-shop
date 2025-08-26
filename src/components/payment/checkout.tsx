import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function Checkout() {
  return (
    <div>
      <Card className=" mx-auto">
        <CardContent className="p-6 space-y-6">
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                First Name
              </label>
              <Input placeholder="Enter first name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name
              </label>
              <Input placeholder="Enter last name" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input type="email" placeholder="Enter your email" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <Input type="tel" placeholder="Enter phone number" />
          </div>

          {/* Shipping Address */}
          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <Textarea placeholder="Street address, building, etc." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <Input placeholder="City" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Region</label>
              <Input placeholder="Region/State" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Postal Code
              </label>
              <Input placeholder="Postal Code" />
            </div>
          </div>

          {/* Shipping Method */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Shipping Method
            </label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select shipping" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (3–5 days)</SelectItem>
                <SelectItem value="express">Express (1–2 days)</SelectItem>
                <SelectItem value="pickup">Pickup</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Method
            </label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="mobile">Mobile Money</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Button variant="outline" className="mt-4">
        Go back to carts
      </Button>
    </div>
  );
}
