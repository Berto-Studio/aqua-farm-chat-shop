import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Loader2, Lock, Plus, Save, Trash2, X } from "lucide-react";
import SettingsCard from "./SettingsCard";
import {
  useAddSettingsPaymentMethod,
  useDeleteSettingsPaymentMethod,
  useSetDefaultSettingsPaymentMethod,
  useSettingsBillingAddress,
  useSettingsPaymentMethods,
  useUpdateSettingsBillingAddress,
} from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";

const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
};

const PaymentsSection = () => {
  const { toast } = useToast();
  const methodsQuery = useSettingsPaymentMethods();
  const billingQuery = useSettingsBillingAddress();
  const addPaymentMethod = useAddSettingsPaymentMethod();
  const deletePaymentMethod = useDeleteSettingsPaymentMethod();
  const setDefaultPaymentMethod = useSetDefaultSettingsPaymentMethod();
  const updateBillingAddress = useUpdateSettingsBillingAddress();
  const methods = methodsQuery.data || [];

  const [showCardForm, setShowCardForm] = useState(false);
  const [cardForm, setCardForm] = useState({
    name: "",
    number: "",
    expiry: "",
    cvc: "",
  });
  const [billingAddress, setBillingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  useEffect(() => {
    if (!billingQuery.data) return;

    setBillingAddress({
      street: billingQuery.data.street || "",
      city: billingQuery.data.city || "",
      state: billingQuery.data.state || "",
      zip: billingQuery.data.zip || "",
      country: billingQuery.data.country || "",
    });
  }, [billingQuery.data]);

  const resetBillingForm = () => {
    if (billingQuery.data) {
      setBillingAddress({
        street: billingQuery.data.street || "",
        city: billingQuery.data.city || "",
        state: billingQuery.data.state || "",
        zip: billingQuery.data.zip || "",
        country: billingQuery.data.country || "",
      });
    }

    setCardForm({ name: "", number: "", expiry: "", cvc: "" });
    setShowCardForm(false);
  };

  const handleAddCard = async () => {
    const clean = cardForm.number.replace(/\s/g, "");
    if (clean.length < 13 || !cardForm.expiry || !cardForm.cvc || !cardForm.name) {
      toast({
        title: "Incomplete card details",
        description:
          "Enter the cardholder name, card number, expiry date, and CVC.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addPaymentMethod.mutateAsync({
        name: cardForm.name.trim(),
        number: cardForm.number,
        expiry: cardForm.expiry,
        cvc: cardForm.cvc,
      });

      setCardForm({ name: "", number: "", expiry: "", cvc: "" });
      setShowCardForm(false);
      toast({
        title: "Payment method added",
        description: "Your card has been saved successfully.",
        variant: "success",
      });
    } catch (mutationError) {
      toast({
        title: "Unable to add card",
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (methodId: number) => {
    try {
      await setDefaultPaymentMethod.mutateAsync(methodId);
      toast({
        title: "Default card updated",
        description: "Your preferred payment method has been updated.",
        variant: "success",
      });
    } catch (mutationError) {
      toast({
        title: "Unable to update default card",
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMethod = async (methodId: number) => {
    try {
      await deletePaymentMethod.mutateAsync(methodId);
      toast({
        title: "Payment method removed",
        description: "The saved card has been deleted.",
        variant: "success",
      });
    } catch (mutationError) {
      toast({
        title: "Unable to remove card",
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  const handleSaveBilling = async () => {
    try {
      await updateBillingAddress.mutateAsync(billingAddress);
      toast({
        title: "Billing address saved",
        description: "Your billing details have been updated.",
        variant: "success",
      });
    } catch (mutationError) {
      toast({
        title: "Unable to save billing address",
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Payment Methods"
        description="Manage your saved payment methods."
        action={
          !showCardForm ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCardForm(true)}
              disabled={methodsQuery.isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Card
            </Button>
          ) : undefined
        }
      >
        {methodsQuery.isLoading && !methodsQuery.data ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading saved cards...
          </div>
        ) : methodsQuery.error && !methodsQuery.data ? (
          <div className="space-y-3">
            <p className="text-sm text-destructive">
              {methodsQuery.error instanceof Error
                ? methodsQuery.error.message
                : "We couldn't load your saved payment methods."}
            </p>
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={() => methodsQuery.refetch()}>
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {methods.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                You don't have any saved payment methods yet.
              </div>
            ) : (
              methods.map((method) => (
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
                    <p className="text-sm text-muted-foreground">
                      Expires {method.expiry}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                        className="text-muted-foreground"
                        disabled={setDefaultPaymentMethod.isPending}
                      >
                        Set default
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMethod(method.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={deletePaymentMethod.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {showCardForm && (
          <div className="mt-4 space-y-4 rounded-lg border border-primary/20 bg-muted/30 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Add New Card</h4>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                onClick={() => setShowCardForm(false)}
                disabled={addPaymentMethod.isPending}
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
                    setCardForm((p) => ({
                      ...p,
                      number: formatCardNumber(e.target.value),
                    }))
                  }
                  maxLength={19}
                  className="pr-10"
                />
                <CreditCard className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                    setCardForm((p) => ({
                      ...p,
                      expiry: formatExpiry(e.target.value),
                    }))
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
                  <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Secured with SSL encryption
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCardForm(false)}
                  disabled={addPaymentMethod.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddCard}
                  disabled={addPaymentMethod.isPending}
                >
                  {addPaymentMethod.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Card"
                  )}
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
        {billingQuery.isLoading && !billingQuery.data ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your billing address...
          </div>
        ) : billingQuery.error && !billingQuery.data ? (
          <div className="space-y-3">
            <p className="text-sm text-destructive">
              {billingQuery.error instanceof Error
                ? billingQuery.error.message
                : "We couldn't load your billing address."}
            </p>
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={() => billingQuery.refetch()}>
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street address</Label>
              <Input
                id="street"
                value={billingAddress.street}
                onChange={(e) =>
                  setBillingAddress((p) => ({ ...p, street: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={billingAddress.city}
                  onChange={(e) =>
                    setBillingAddress((p) => ({ ...p, city: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State / Province</Label>
                <Input
                  id="state"
                  value={billingAddress.state}
                  onChange={(e) =>
                    setBillingAddress((p) => ({ ...p, state: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP / Postal code</Label>
                <Input
                  id="zip"
                  value={billingAddress.zip}
                  onChange={(e) =>
                    setBillingAddress((p) => ({ ...p, zip: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={billingAddress.country}
                  onChange={(e) =>
                    setBillingAddress((p) => ({ ...p, country: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        )}
      </SettingsCard>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={resetBillingForm}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSaveBilling}
          disabled={updateBillingAddress.isPending || billingQuery.isLoading}
        >
          {updateBillingAddress.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PaymentsSection;
