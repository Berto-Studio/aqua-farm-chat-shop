import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Check, Users, GraduationCap, Settings } from "lucide-react";

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

const services = [
  {
    id: "consultation",
    title: "Farm Consultation",
    description:
      "Professional guidance for setting up and optimizing your fish farm operations",
    icon: Users,
    features: [
      "Site assessment and pond design",
      "Water quality management",
      "Feeding strategies and schedules",
      "Disease prevention protocols",
      "Business planning and profitability analysis",
      "Ongoing support for 3 months",
    ],
    pricing: {
      basic: { price: 299, duration: "One-time visit" },
      premium: { price: 599, duration: "3 visits + 3 months support" },
      enterprise: { price: 1299, duration: "Complete setup package" },
    },
  },
  {
    id: "hatchery",
    title: "Hatchery Operations",
    description:
      "Complete hatchery setup and management services for sustainable fish production",
    icon: Settings,
    features: [
      "Hatchery design and construction",
      "Equipment sourcing and installation",
      "Breeding stock selection",
      "Spawning and incubation protocols",
      "Fingerling production optimization",
      "Staff training and certification",
    ],
    pricing: {
      basic: { price: 1999, duration: "Setup consultation" },
      premium: { price: 4999, duration: "Complete setup + training" },
      enterprise: { price: 9999, duration: "Turnkey hatchery solution" },
    },
  },
  {
    id: "training",
    title: "Catfish Fingerling Training",
    description:
      "Hands-on training programs to master catfish fingerling production techniques",
    icon: GraduationCap,
    features: [
      "Breeding techniques and timing",
      "Egg incubation best practices",
      "Fry care and feeding protocols",
      "Growth optimization strategies",
      "Quality control and grading",
      "Certificate of completion",
    ],
    pricing: {
      basic: { price: 599, duration: "2-day workshop" },
      premium: { price: 1199, duration: "5-day intensive course" },
      enterprise: { price: 2499, duration: "2-week apprenticeship" },
    },
  },
];

export default function Services() {
  const [selectedService, setSelectedService] = useState("");
  const { toast } = useToast();

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
      {/* Hero Section */}
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

      {/* Services Grid */}
      <section className="py-16 container">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from our range of professional services designed to support
            every aspect of your fish farming journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <Card key={service.id} className="relative">
                <CardHeader>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">What's Included:</h4>
                      <ul className="space-y-2">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-semibold">Pricing Options:</h4>
                      {Object.entries(service.pricing).map(
                        ([tier, details]) => (
                          <div
                            key={tier}
                            className="flex justify-between items-center"
                          >
                            <div>
                              <Badge
                                variant={
                                  tier === "premium" ? "default" : "secondary"
                                }
                              >
                                {tier.charAt(0).toUpperCase() + tier.slice(1)}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {details.duration}
                              </p>
                            </div>
                            <span className="font-bold text-lg">
                              ${details.price}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Service Request Form */}
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
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="consultation">
                                Farm Consultation
                              </SelectItem>
                              <SelectItem value="hatchery">
                                Hatchery Operations
                              </SelectItem>
                              <SelectItem value="training">
                                Catfish Fingerling Training
                              </SelectItem>
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

      {/* Why Choose Us */}
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
