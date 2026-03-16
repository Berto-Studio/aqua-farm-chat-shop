import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type ShippingMethod = "standard" | "express" | "pickup";
export type PaymentMethod = "card" | "mobile" | "paypal" | "cod";

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  shippingMethod: ShippingMethod | "";
  paymentMethod: PaymentMethod | "";
}

interface CheckoutProps {
  value: CheckoutFormData;
  onChange: (updates: Partial<CheckoutFormData>) => void;
  onBackToCart?: () => void;
}

export default function Checkout({ value, onChange, onBackToCart }: CheckoutProps) {
  const isPickup = value.shippingMethod === "pickup";

  return (
    <div>
      <Card className="mx-auto">
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">First Name</label>
              <Input
                placeholder="Enter first name"
                value={value.firstName}
                onChange={(event) => onChange({ firstName: event.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Last Name</label>
              <Input
                placeholder="Enter last name"
                value={value.lastName}
                onChange={(event) => onChange({ lastName: event.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={value.email}
              onChange={(event) => onChange({ email: event.target.value })}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Phone Number</label>
            <Input
              type="tel"
              placeholder="Enter phone number"
              value={value.phone}
              onChange={(event) => onChange({ phone: event.target.value })}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Address</label>
            <Textarea
              placeholder={
                isPickup
                  ? "Pickup selected. Address is optional."
                  : "Street address, building, etc."
              }
              value={value.address}
              onChange={(event) => onChange({ address: event.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">City</label>
              <Input
                placeholder="City"
                value={value.city}
                onChange={(event) => onChange({ city: event.target.value })}
                disabled={isPickup}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Region</label>
              <Input
                placeholder="Region/State"
                value={value.region}
                onChange={(event) => onChange({ region: event.target.value })}
                disabled={isPickup}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Postal Code</label>
              <Input
                placeholder="Postal Code"
                value={value.postalCode}
                onChange={(event) => onChange({ postalCode: event.target.value })}
                disabled={isPickup}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Shipping Method</label>
            <Select
              value={value.shippingMethod}
              onValueChange={(nextValue: ShippingMethod) =>
                onChange({
                  shippingMethod: nextValue,
                  ...(nextValue === "pickup"
                    ? { address: "", city: "", region: "", postalCode: "" }
                    : {}),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select shipping" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (3-5 days)</SelectItem>
                <SelectItem value="express">Express (1-2 days)</SelectItem>
                <SelectItem value="pickup">Pickup</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Payment Method</label>
            <Select
              value={value.paymentMethod}
              onValueChange={(nextValue: PaymentMethod) =>
                onChange({ paymentMethod: nextValue })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="mobile">Mobile Money</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="cod">Physical Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Button variant="outline" className="mt-4" onClick={onBackToCart}>
        Go back to cart
      </Button>
    </div>
  );
}
