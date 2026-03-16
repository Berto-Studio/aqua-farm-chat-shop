import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AdminServiceForm from "@/components/admin/AdminServiceForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateAdminFarmService } from "@/hooks/useServices";
import { useToast } from "@/hooks/use-toast";
import { getFarmServiceRouteParam, type FarmService } from "@/lib/services";

export default function AdminServiceCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createFarmService = useCreateAdminFarmService();

  const handleCreateService = async (payload: FarmService) => {
    try {
      const createdService = await createFarmService.mutateAsync(payload);
      toast({
        title: "Service Added",
        description: "The service was saved successfully.",
      });

      if (createdService) {
        navigate(`/admin/services/${getFarmServiceRouteParam(createdService)}`);
        return;
      }

      navigate("/admin/services");
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
    <div className="p-4 space-y-6 sm:p-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate("/admin/services")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add Service</h1>
          <p className="text-sm text-muted-foreground">
            Create a new service for the storefront catalog.
          </p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Fill in the same title, description, features, and pricing shown on
            the public service cards.
          </p>
        </CardHeader>
        <CardContent>
          <AdminServiceForm
            submitLabel="Add Service"
            isPending={createFarmService.isPending}
            onSubmit={handleCreateService}
            onCancel={() => navigate("/admin/services")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
