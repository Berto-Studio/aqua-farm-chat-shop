import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AdminServiceForm from "@/components/admin/AdminServiceForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useFarmServices,
  useUpdateAdminFarmService,
} from "@/hooks/useServices";
import { useToast } from "@/hooks/use-toast";
import {
  getFarmServiceRouteParam,
  isFarmServiceMatch,
  type FarmService,
} from "@/lib/services";

export default function AdminServiceEdit() {
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId: string }>();
  const { toast } = useToast();
  const { data: services = [], isLoading, error } = useFarmServices();
  const updateFarmService = useUpdateAdminFarmService();

  const service = useMemo(
    () =>
      services.find((item) =>
        serviceId ? isFarmServiceMatch(item, serviceId) : false,
      ),
    [serviceId, services],
  );

  const handleUpdateService = async (payload: FarmService) => {
    if (!service || service.id === undefined || service.id === null) {
      toast({
        title: "Unable to update service",
        description:
          "This service is missing its id from the API, so update is unavailable.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedService = await updateFarmService.mutateAsync({
        id: service.id,
        payload,
      });
      const nextRouteParam = getFarmServiceRouteParam(
        updatedService ?? payload,
      );

      toast({
        title: "Service Updated",
        description: "The service changes were saved successfully.",
      });
      navigate(`/admin/services/${nextRouteParam}`);
    } catch (updateError) {
      toast({
        title: "Unable to update service",
        description:
          updateError instanceof Error
            ? updateError.message
            : "Failed to update service.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <Card>
          <CardContent className="p-6 text-muted-foreground">
            Loading service for editing...
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

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col justify-center gap-3">
        <Button
          variant="outline"
          onClick={() =>
            navigate(`/admin/services/${getFarmServiceRouteParam(service)}`)
          }
          className="w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Service
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Service</h1>
          <p className="text-sm text-muted-foreground">{service.title}</p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Update Service Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Edit the title, description, included features, and pricing tiers
            shown in the storefront.
          </p>
        </CardHeader>
        <CardContent>
          <AdminServiceForm
            initialService={service}
            submitLabel="Save Changes"
            isPending={updateFarmService.isPending}
            onSubmit={handleUpdateService}
            onCancel={() =>
              navigate(`/admin/services/${getFarmServiceRouteParam(service)}`)
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
