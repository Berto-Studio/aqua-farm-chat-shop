import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ServiceCardsGrid from "@/components/services/ServiceCardsGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  useCreateAdminFarmService,
  useFarmServices,
} from "@/hooks/useServices";
import { useToast } from "@/hooks/use-toast";
import { serviceIconKeys, serviceIconOptions } from "@/lib/services";

const addServiceSchema = z.object({
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

type AddServiceFormValues = z.infer<typeof addServiceSchema>;

const defaultValues: AddServiceFormValues = {
  title: "",
  description: "",
  icon: "settings",
  features: "",
  basicPrice: 0,
  basicDuration: "",
  premiumPrice: 0,
  premiumDuration: "",
  enterprisePrice: 0,
  enterpriseDuration: "",
};

export default function AdminServices() {
  const { toast } = useToast();
  const { data: services = [], isLoading, error } = useFarmServices();
  const createFarmService = useCreateAdminFarmService();
  const form = useForm<AddServiceFormValues>({
    resolver: zodResolver(addServiceSchema),
    defaultValues,
  });

  const handleSubmit = async (values: AddServiceFormValues) => {
    const features = values.features
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      await createFarmService.mutateAsync({
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

      toast({
        title: "Service Added",
        description: "The service was saved successfully.",
      });
      form.reset(defaultValues);
    } catch (error) {
      toast({
        title: "Unable to add service",
        description:
          error instanceof Error ? error.message : "Failed to create service.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="p-4 sm:p-6 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Services
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base lg:text-lg">
            Manage the service catalog shown on the storefront and keep the
            admin preview in sync with the public services page.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(320px,420px)] gap-6 items-start">
          <div className="space-y-6">
            <Card className="border-none bg-transparent shadow-none">
              <CardContent>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading services...
                  </p>
                ) : error ? (
                  <p className="text-sm text-destructive">
                    {error instanceof Error
                      ? error.message
                      : "Unable to load services."}
                  </p>
                ) : services.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No services found yet. Use the form to add the first one.
                  </p>
                ) : (
                  <ServiceCardsGrid
                    services={services}
                    className="lg:grid-cols-2"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border shadow-sm xl:sticky xl:top-6">
            <CardHeader>
              <CardTitle>Add a Service</CardTitle>
              <p className="text-sm text-muted-foreground">
                Fill in the same details shown on the service cards: title,
                description, features, and pricing tiers.
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Pond Setup Advisory"
                            {...field}
                          />
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
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an icon style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {serviceIconOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="basicPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Basic Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                              />
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
                              <Input
                                placeholder="e.g. One-time visit"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="premiumPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Premium Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                              />
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
                              <Input
                                placeholder="e.g. 3 visits + support"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="enterprisePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enterprise Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                              />
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

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createFarmService.isPending}
                  >
                    {createFarmService.isPending ? "Saving..." : "Add Service"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
