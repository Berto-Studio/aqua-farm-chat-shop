import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PolicyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const policySections = [
  {
    title: "1. Account Information",
    body:
      "When you create a Pomegrid Aqua account, you agree to provide accurate information and keep your login details secure. You are responsible for activity carried out through your account.",
  },
  {
    title: "2. Orders and Product Availability",
    body:
      "All orders are subject to stock availability, confirmation, and quality checks. Product prices, quantities, and delivery timelines may change when needed to reflect live inventory and farm operations.",
  },
  {
    title: "3. Payments and Checkout",
    body:
      "Payments made through our platform must be authorized by the account holder. If a payment fails or is flagged for review, Pomegrid Aqua may pause or cancel the order until the issue is resolved.",
  },
  {
    title: "4. Delivery, Pickup, and Quality Concerns",
    body:
      "Customers should review their order at delivery or pickup and report any quality or fulfillment issue as soon as possible. Timely reporting helps us investigate and support a fair resolution.",
  },
  {
    title: "5. Privacy and Communication",
    body:
      "We use your personal information to manage your account, process orders, provide customer support, and send service-related updates. We do not use your details for unrelated purposes without a valid reason.",
  },
  {
    title: "6. Acceptable Use",
    body:
      "You agree not to misuse the platform, submit false information, interfere with the service, or attempt fraudulent purchases, payments, or account activity.",
  },
];

export function PolicyDialog({ open, onOpenChange }: PolicyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pomegrid Aqua Policy</DialogTitle>
          <DialogDescription>
            Please review these policies before completing your registration.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-2">
          {policySections.map((section) => (
            <div key={section.title} className="space-y-2 rounded-lg border p-4">
              <h3 className="text-sm font-semibold text-theme-black">
                {section.title}
              </h3>
              <p className="text-sm leading-6 text-gray-600">{section.body}</p>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
