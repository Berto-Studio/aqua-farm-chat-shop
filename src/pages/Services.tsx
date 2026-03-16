import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import ServiceCardsGrid from "@/components/services/ServiceCardsGrid";
import { useFarmServices } from "@/hooks/useServices";
import { useToast } from "@/hooks/use-toast";
import { Check, GraduationCap, Users } from "lucide-react";

const serviceRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  service: z.string().min(1, "Please select a service"),
  farmSize: z.string().optional(),
  experience: z.string().min(1, "Please select your experience level"),
  message: z.string().min(10, "Please provide more details about your needs"),
});

type ServiceRequestForm = z.infer<typeof serviceRequestSchema>;

export default function Services() {
  const { toast } = useToast();
  const {
    data: services = [],
    isLoading: isLoadingServices,
    error,
  } = useFarmServices();
  const servicesError =
    error instanceof Error
      ? error.message
      : error
        ? "Unable to load services"
        : null;

  const form = useForm<ServiceRequestForm>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service: "",
      farmSize: "",
      experience: "",
      message: "",
    },
  });

  const onSubmit = (data: ServiceRequestForm) => {
    console.log("Service request submitted:", data);
    toast({
      title: "Request Submitted!",
      description:
        "We'll get back to you within 24 hours to discuss your needs.",
    });
    form.reset();
  };

  return (
    <div className="min-h-screen">
      <section className="bg-primary text-white py-16">
        <div className="container text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Professional Aquaculture Services
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            From farm consultation to hatchery operations and specialized
            training, we provide comprehensive services to help you succeed in
            fish farming.
          </p>
        </div>
      </section>

      <section className="py-16 container">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from our range of professional services designed to support
            every aspect of your fish farming journey.
          </p>
        </div>

        {isLoadingServices ? (
          <div className="rounded-lg border bg-card p-10 text-center text-muted-foreground">
            Loading services...
          </div>
        ) : servicesError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
            {servicesError}
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-lg border bg-card p-10 text-center text-muted-foreground">
            No services are available right now.
          </div>
        ) : (
          <ServiceCardsGrid services={services} />
        )}
      </section>

      <section className="py-16 bg-secondary">
        <div className="container max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Request a Service
            </h2>
            <p className="text-muted-foreground">
              Tell us about your needs and we'll create a customized solution
              for your fish farming goals.
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <Input
                              placeholder="e.g., 2 acres, 5 ponds"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Needed</FormLabel>
                          <Select
                            disabled={isLoadingServices}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {services.map((service) => (
                                <SelectItem
                                  key={service.title}
                                  value={service.title}
                                >
                                  {service.title}
                                </SelectItem>
                              ))}
                              <SelectItem value="multiple">
                                Multiple Services
                              </SelectItem>
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
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select experience level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">
                                Complete Beginner
                              </SelectItem>
                              <SelectItem value="some">
                                Some Experience
                              </SelectItem>
                              <SelectItem value="experienced">
                                Experienced
                              </SelectItem>
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
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 container">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Why Choose Our Services?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 mx-auto">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Proven Expertise</h3>
              <p className="text-muted-foreground">
                Over 15 years of experience in aquaculture with hundreds of
                successful farm setups.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 mx-auto">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ongoing Support</h3>
              <p className="text-muted-foreground">
                We don't just set you up and leave. Continuous support ensures
                your long-term success.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 mx-auto">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Certified Training</h3>
              <p className="text-muted-foreground">
                Our training programs are certified and recognized by
                aquaculture industry standards.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
