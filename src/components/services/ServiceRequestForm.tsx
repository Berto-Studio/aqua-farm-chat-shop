import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { FarmService } from "@/lib/services";

const serviceRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  service: z.string().min(1, "Please select a service"),
  farmSize: z.string().optional(),
  experience: z.string().min(1, "Please select your experience level"),
  message: z.string().min(10, "Please provide more details about your needs"),
});

type ServiceRequestValues = z.infer<typeof serviceRequestSchema>;

interface ServiceRequestFormProps {
  services: FarmService[];
  isLoadingServices?: boolean;
  initialService?: string;
  onSubmitted?: () => void;
}

const getDefaultValues = (initialService = "") => ({
  name: "",
  email: "",
  phone: "",
  service: initialService,
  farmSize: "",
  experience: "",
  message: "",
});

export default function ServiceRequestForm({
  services,
  isLoadingServices = false,
  initialService = "",
  onSubmitted,
}: ServiceRequestFormProps) {
  const { toast } = useToast();
  const form = useForm<ServiceRequestValues>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: getDefaultValues(initialService),
  });

  useEffect(() => {
    form.reset(getDefaultValues(initialService));
  }, [form, initialService]);

  const handleSubmit = (data: ServiceRequestValues) => {
    console.log("Service request submitted:", data);
    toast({
      title: "Request Submitted!",
      description:
        "We'll get back to you within 24 hours to discuss your needs.",
    });
    form.reset(getDefaultValues(initialService));
    onSubmitted?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="(123) 456-7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="farmSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Farm Size (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 2 acres, 5 ponds" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="service"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Needed</FormLabel>
                <Select
                  disabled={isLoadingServices}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem
                        key={String(service.id ?? service.title)}
                        value={service.title}
                      >
                        {service.title}
                      </SelectItem>
                    ))}
                    <SelectItem value="multiple">Multiple Services</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Level</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beginner">Complete Beginner</SelectItem>
                    <SelectItem value="some">Some Experience</SelectItem>
                    <SelectItem value="experienced">Experienced</SelectItem>
                    <SelectItem value="commercial">
                      Commercial Operation
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tell us about your needs</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please describe your specific needs, goals, timeline, and any questions you have..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="w-full">
          Submit Service Request
        </Button>
      </form>
    </Form>
  );
}
