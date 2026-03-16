import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFarmServices } from "@/hooks/useServices";
import {
  getFarmServiceRouteParam,
  isFarmServiceMatch,
  serviceIconMap,
  serviceTierKeys,
  serviceTierLabels,
} from "@/lib/services";

export default function AdminServiceDetails() {
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId: string }>();
  const { data: services = [], isLoading, error } = useFarmServices();

  const service = useMemo(
    () =>
      services.find((item) =>
        serviceId ? isFarmServiceMatch(item, serviceId) : false,
      ),
    [serviceId, services],
  );

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <Card>
          <CardContent className="p-6 text-muted-foreground">
            Loading service details...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Button variant="outline" onClick={() => navigate("/admin/services")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Button>
        <Card>
          <CardContent className="p-6 text-destructive">
            {error?.message || "Service not found."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const IconComponent = serviceIconMap[service.icon];
  const routeParam = getFarmServiceRouteParam(service);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/services")}
            className="w-fit"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{service.title}</h1>
            <p className="text-sm text-muted-foreground">
              View the service content exactly as it should read in the catalog.
            </p>
          </div>
        </div>

        <Button onClick={() => navigate(`/admin/services/${routeParam}/edit`)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Service
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <Card className="border shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <IconComponent className="h-7 w-7" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              </div>

              {service.id !== undefined && service.id !== null ? (
                <Badge variant="outline">ID: {service.id}</Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Included Features
              </h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {service.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Pricing Tiers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {serviceTierKeys.map((tier) => {
              const details = service.pricing[tier];

              return (
                <div key={tier} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Badge
                      variant={tier === "premium" ? "default" : "secondary"}
                    >
                      {serviceTierLabels[tier]}
                    </Badge>
                    <p className="text-xl font-bold">
                      ${details.price.toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {details.duration}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
