import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Trash2, Save, X, Lock } from "lucide-react";
import SettingsCard from "./SettingsCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentMethod {
  id: string;
  type: "visa" | "mastercard";
  last4: string;
  expiry: string;
  isDefault: boolean;
}

const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
};

const detectCardType = (number: string): "visa" | "mastercard" => {
  const clean = number.replace(/\s/g, "");
  if (clean.startsWith("5") || clean.startsWith("2")) return "mastercard";
  return "visa";
};

const PaymentsSection = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: "1", type: "visa", last4: "4242", expiry: "12/26", isDefault: true },
    { id: "2", type: "mastercard", last4: "8888", expiry: "03/25", isDefault: false },
  ]);

  const [showCardForm, setShowCardForm] = useState(false);
  const [cardForm, setCardForm] = useState({
    name: "",
    number: "",
    expiry: "",
    cvc: "",
  });

  const [billingAddress, setBillingAddress] = useState({
    street: "123 Farm Road",
    city: "Springfield",
    state: "IL",
    zip: "62701",
    country: "US",
  });

  const removeMethod = (id: string) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
  };

  const setDefault = (id: string) => {
    setMethods((prev) =>
      prev.map((m) => ({ ...m, isDefault: m.id === id }))
    );
  };

  const handleAddCard = () => {
    const clean = cardForm.number.replace(/\s/g, "");
    if (clean.length < 13 || !cardForm.expiry || !cardForm.cvc || !cardForm.name) return;

    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: detectCardType(cardForm.number),
      last4: clean.slice(-4),
      expiry: cardForm.expiry,
      isDefault: methods.length === 0,
    };
    setMethods((prev) => [...prev, newMethod]);
    setCardForm({ name: "", number: "", expiry: "", cvc: "" });
    setShowCardForm(false);
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Payment Methods"
        description="Manage your saved payment methods."
        action={
          !showCardForm ? (
            <Button variant="outline" size="sm" onClick={() => setShowCardForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Card
            </Button>
          ) : undefined
        }
      >
        <div className="space-y-3">
          {methods.map((method) => (
            <div
              key={method.id}
              className="flex items-center gap-4 rounded-lg border border-border bg-background p-4"
            >
              <div className="flex h-10 w-14 items-center justify-center rounded-md bg-secondary">
                <CreditCard className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground capitalize">
                    {method.type} •••• {method.last4}
                  </p>
                  {method.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Expires {method.expiry}</p>
              </div>
              <div className="flex items-center gap-2">
                {!method.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDefault(method.id)}
                    className="text-muted-foreground"
                  >
                    Set default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMethod(method.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Card Form */}
        {showCardForm && (
          <div className="mt-4 rounded-lg border border-primary/20 bg-muted/30 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Add New Card</h4>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                onClick={() => setShowCardForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardName">Name on card</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={cardForm.name}
                onChange={(e) => setCardForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card number</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  placeholder="4242 4242 4242 4242"
                  value={cardForm.number}
                  onChange={(e) =>
                    setCardForm((p) => ({ ...p, number: formatCardNumber(e.target.value) }))
                  }
                  maxLength={19}
                  className="pr-10"
                />
                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cardExpiry">Expiry date</Label>
                <Input
                  id="cardExpiry"
                  placeholder="MM/YY"
                  value={cardForm.expiry}
                  onChange={(e) =>
                    setCardForm((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))
                  }
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardCvc">CVC</Label>
                <div className="relative">
                  <Input
                    id="cardCvc"
                    placeholder="123"
                    value={cardForm.cvc}
                    onChange={(e) =>
                      setCardForm((p) => ({
                        ...p,
                        cvc: e.target.value.replace(/\D/g, "").slice(0, 4),
                      }))
                    }
                    maxLength={4}
                    className="pr-10"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Secured with SSL encryption
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowCardForm(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddCard}>
                  Add Card
                </Button>
              </div>
            </div>
          </div>
        )}
      </SettingsCard>

      <SettingsCard
        title="Billing Address"
        description="Used for invoices and receipts."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street address</Label>
            <Input
              id="street"
              value={billingAddress.street}
              onChange={(e) => setBillingAddress((p) => ({ ...p, street: e.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={billingAddress.city}
                onChange={(e) => setBillingAddress((p) => ({ ...p, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State / Province</Label>
              <Input
                id="state"
                value={billingAddress.state}
                onChange={(e) => setBillingAddress((p) => ({ ...p, state: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP / Postal code</Label>
              <Input
                id="zip"
                value={billingAddress.zip}
                onChange={(e) => setBillingAddress((p) => ({ ...p, zip: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={billingAddress.country}
                onValueChange={(v) => setBillingAddress((p) => ({ ...p, country: v }))}
              >
                <SelectTrigger id="country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </SettingsCard>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default PaymentsSection;
