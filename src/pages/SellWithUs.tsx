import { useState } from "react";
import { z } from "zod";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SELLER_WHATSAPP_NUMBER = "233544743630";

const sellerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(80, "Name is too long")
    .regex(
      /^[\p{L} .'-]+$/u,
      "Use letters, spaces, and basic punctuation only",
    ),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(25, "Phone number is too long")
    .regex(/^[+()\d\s-]+$/, "Use a valid phone number"),
  product: z.enum(["Catfish", "Tilapia"], {
    required_error: "Please select what you want to sell",
  }),
  location: z
    .string()
    .trim()
    .min(2, "Please enter your location")
    .max(100, "Location is too long")
    .regex(/^[\p{L}\p{N} ,.\-/()']+$/u, "Use plain text only"),
  details: z
    .string()
    .trim()
    .min(10, "Please provide a few details about your products")
    .max(600, "Details must be 600 characters or fewer")
    .regex(/^[\p{L}\p{N}\s.,!?\-/()&'"%:;]+$/u, "Use plain text only"),
});

type SellerFormValues = z.infer<typeof sellerFormSchema>;

const initialValues: SellerFormValues = {
  name: "",
  phone: "",
  product: "Catfish",
  location: "",
  details: "",
};

const sellingSteps = [
  [
    "Tell us about your products",
    "Share what you sell, where you are located, and how we can reach you.",
  ],
  [
    "We review your submission",
    "Our team checks the details and follows up to discuss fit, quality, and availability.",
  ],
  [
    "Agree on the details",
    "We confirm pricing, quantities, delivery, and the best way to present your products.",
  ],
  [
    "Reach more customers",
    "Once approved, your products can be shared with customers through Pomegrid.",
  ],
];

export default function SellWithUs() {
  const { toast } = useToast();
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof SellerFormValues, string>>
  >({});

  const handleChange = (field: keyof SellerFormValues, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = sellerFormSchema.safeParse(formValues);
    if (!result.success) {
      const nextErrors: Partial<Record<keyof SellerFormValues, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof SellerFormValues;
        if (!nextErrors[field]) nextErrors[field] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    const { name, phone, product, location, details } = result.data;
    const message = [
      "Hello Pomegrid, I would like to sell with you.",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Product(s): ${product}`,
      `Location: ${location}`,
      `Details: ${details}`,
    ].join("\n");
    window.open(
      `https://wa.me/${SELLER_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    toast({
      title: "Opening WhatsApp",
      description: "Your seller enquiry is ready to send to our team.",
    });
    setFormValues(initialValues);
    setErrors({});
  };

  return (
    <div className="pb-16">
      <section className="relative h-[320px] overflow-hidden sm:h-[320px]">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 mx-auto flex max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl text-white">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-white/75">
              Pomegrid marketplace
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Sell with us
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/85 sm:text-lg">
              Free fish marketing and sales platform.
            </p>
          </div>
        </div>
      </section>

      <section className="container grid gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            A simple path from farm to customer.
          </h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            We help local farmers and suppliers reach more buyers while keeping
            the conversation personal and transparent.
          </p>
          <div className="mt-8 space-y-6">
            {sellingSteps.map(([title, description], index) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card className="border-primary/15 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Start a seller enquiry</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Complete the form and continue the conversation on WhatsApp.
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                {(
                  [
                    ["name", "Full name", "e.g. Ama Mensah"],
                    ["phone", "Phone number", "e.g. 054 000 0000"],
                    ["location", "Farm or business location", "e.g. Takoradi"],
                  ] as const
                ).map(([field, label, placeholder]) => (
                  <div key={field} className="space-y-2">
                    <label htmlFor={field} className="text-sm font-medium">
                      {label}
                    </label>
                    <Input
                      id={field}
                      value={formValues[field]}
                      onChange={(event) =>
                        handleChange(field, event.target.value)
                      }
                      placeholder={placeholder}
                      maxLength={
                        field === "name" ? 80 : field === "phone" ? 25 : 100
                      }
                      autoComplete={
                        field === "name"
                          ? "name"
                          : field === "phone"
                            ? "tel"
                            : "off"
                      }
                    />
                    {errors[field] && (
                      <p className="text-sm text-destructive">
                        {errors[field]}
                      </p>
                    )}
                  </div>
                ))}
                <div className="space-y-2">
                  <label htmlFor="product" className="text-sm font-medium">
                    What do you want to sell?
                  </label>
                  <Select
                    value={formValues.product}
                    onValueChange={(value) => handleChange("product", value)}
                  >
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Select a fish type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Catfish">Catfish</SelectItem>
                      <SelectItem value="Tilapia">Tilapia</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.product && (
                    <p className="text-sm text-destructive">{errors.product}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="details" className="text-sm font-medium">
                  Tell us about your products
                </label>
                <Textarea
                  id="details"
                  value={formValues.details}
                  onChange={(event) =>
                    handleChange("details", event.target.value)
                  }
                  placeholder="Include quantities, availability, and anything else we should know."
                  maxLength={600}
                  rows={5}
                />
                <div className="flex justify-between gap-4 text-xs text-muted-foreground">
                  <span className={errors.details ? "text-destructive" : ""}>
                    {errors.details ||
                      "Plain text only. No files or code are accepted."}
                  </span>
                  <span>{formValues.details.length}/600</span>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full sm:w-auto">
                Continue to WhatsApp <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="container grid gap-4 border-t pt-10 sm:grid-cols-3">
        {["Quality products", "Fair conversations", "Direct support"].map(
          (item) => (
            <div
              key={item}
              className="flex items-center gap-3 text-sm font-medium"
            >
              <CheckCircle2 className="h-5 w-5 text-primary" /> {item}
            </div>
          ),
        )}
      </section>
    </div>
  );
}
