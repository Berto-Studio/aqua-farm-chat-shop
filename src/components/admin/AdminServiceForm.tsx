import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type FarmService,
  serviceIconKeys,
  serviceIconOptions,
} from "@/lib/services";

const serviceFormSchema = z.object({
  title: z.string().min(3, "Service title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  icon: z.enum(serviceIconKeys),
  features: z.string().refine((value) => {
    const features = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    return features.length >= 4 && features.length <= 6;
  }, "Add 4 to 6 features"),
  basicPrice: z.coerce.number().min(0, "Enter a valid price"),
  basicDuration: z.string().min(2, "Enter the duration for the basic plan"),
  premiumPrice: z.coerce.number().min(0, "Enter a valid price"),
  premiumDuration: z.string().min(2, "Enter the duration for the premium plan"),
  enterprisePrice: z.coerce.number().min(0, "Enter a valid price"),
  enterpriseDuration: z
    .string()
    .min(2, "Enter the duration for the enterprise plan"),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface AdminServiceFormProps {
  initialService?: FarmService | null;
  submitLabel: string;
  isPending?: boolean;
  onSubmit: (service: FarmService) => Promise<void> | void;
  onCancel?: () => void;
}

const getDefaultValues = (
  service?: FarmService | null,
): ServiceFormValues => ({
  title: service?.title ?? "",
  description: service?.description ?? "",
  icon: service?.icon ?? "settings",
  features: service?.features?.join("\n") ?? "",
  basicPrice: service?.pricing?.basic?.price ?? 0,
  basicDuration: service?.pricing?.basic?.duration ?? "",
  premiumPrice: service?.pricing?.premium?.price ?? 0,
  premiumDuration: service?.pricing?.premium?.duration ?? "",
  enterprisePrice: service?.pricing?.enterprise?.price ?? 0,
  enterpriseDuration: service?.pricing?.enterprise?.duration ?? "",
});

export default function AdminServiceForm({
  initialService,
  submitLabel,
  isPending = false,
  onSubmit,
  onCancel,
}: AdminServiceFormProps) {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: getDefaultValues(initialService),
  });

  useEffect(() => {
    form.reset(getDefaultValues(initialService));
  }, [form, initialService]);

  const handleSubmit = async (values: ServiceFormValues) => {
    const features = values.features
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    await onSubmit({
      id: initialService?.id,
      title: values.title,
      description: values.description,
      icon: values.icon,
      features,
      pricing: {
        basic: {
          price: values.basicPrice,
          duration: values.basicDuration,
        },
        premium: {
          price: values.premiumPrice,
          duration: values.premiumDuration,
        },
        enterprise: {
          price: values.enterprisePrice,
          duration: values.enterpriseDuration,
        },
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Pond Setup Advisory" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what this service helps customers achieve."
                  className="min-h-[96px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon Style</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {serviceIconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What's Included</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={
                    "Add one feature per line\nWater testing\nFeeding plan\nOn-site support"
                  }
                  className="min-h-[132px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="basicPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Basic Price</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="basicDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Basic Duration</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. One-time visit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="premiumPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Premium Price</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="premiumDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Premium Duration</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 3 visits + support" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="enterprisePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enterprise Price</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enterpriseDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enterprise Duration</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Complete setup package"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
          ) : null}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
