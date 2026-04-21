import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ServiceCardsGrid from "@/components/services/ServiceCardsGrid";
import ServiceRequestForm from "@/components/services/ServiceRequestForm";
import { useFarmServices } from "@/hooks/useServices";
import { Check, GraduationCap, Users } from "lucide-react";
import CTA from "@/components/global/cta";

export default function Services() {
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
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

  const handleOpenRequestDialog = (serviceTitle: string) => {
    setSelectedService(serviceTitle);
    setIsRequestDialogOpen(true);
  };

  const handleRequestDialogChange = (open: boolean) => {
    setIsRequestDialogOpen(open);

    if (!open) {
      setSelectedService("");
    }
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
          <p className="mt-3 text-sm font-medium text-primary">
            Click any service card or use its button to request that service.
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
          <ServiceCardsGrid
            services={services}
            onServiceSelect={(service) => handleOpenRequestDialog(service.title)}
          />
        )}
      </section>

      <Dialog
        open={isRequestDialogOpen}
        onOpenChange={handleRequestDialogChange}
      >
        <DialogContent className="w-[calc(100vw-1rem)] max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request a Service</DialogTitle>
            <DialogDescription>
              {selectedService
                ? `Tell us what you need for ${selectedService} and our team will follow up with the best next steps.`
                : "Fill out the form below and our team will reach out to discuss the best plan for your fish farming goals."}
            </DialogDescription>
          </DialogHeader>
          <ServiceRequestForm
            services={services}
            isLoadingServices={isLoadingServices}
            initialService={selectedService}
            onSubmitted={() => handleRequestDialogChange(false)}
          />
        </DialogContent>
      </Dialog>

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

      <section>
        <CTA
          title="Ready to Get Started?"
          description="Contact us today to learn more about our services and how we can help you succeed in aquaculture."
          secondaryText="Learn More"
          primaryLink="/contact"
          primaryText="Contact Us"
          secondaryLink="/services"
        />
      </section>
    </div>
  );
}
