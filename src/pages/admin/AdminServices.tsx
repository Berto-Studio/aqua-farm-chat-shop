import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EllipsisVertical, Eye, Pencil, Plus, Trash } from "lucide-react";
import ServiceCardsGrid from "@/components/services/ServiceCardsGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useDeleteAdminFarmService,
  useFarmServices,
} from "@/hooks/useServices";
import { useToast } from "@/hooks/use-toast";
import { getFarmServiceRouteParam, type FarmService } from "@/lib/services";

export default function AdminServices() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: services = [], isLoading, error } = useFarmServices();
  const deleteFarmService = useDeleteAdminFarmService();
  const [deletingServiceId, setDeletingServiceId] = useState<
    string | number | null
  >(null);

  const handleDeleteService = async (service: FarmService) => {
    if (service.id === undefined || service.id === null) {
      toast({
        title: "Unable to delete service",
        description:
          "This service is missing its id from the API, so delete is unavailable.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(
      `Delete "${service.title}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      setDeletingServiceId(service.id);
      await deleteFarmService.mutateAsync(service.id);
      toast({
        title: "Service Deleted",
        description: "The service was removed successfully.",
      });
    } catch (deleteError) {
      toast({
        title: "Delete Failed",
        description:
          deleteError instanceof Error
            ? deleteError.message
            : "Unable to delete service.",
        variant: "destructive",
      });
    } finally {
      setDeletingServiceId(null);
    }
  };

  return (
    <div className="p-4 space-y-6 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="">
          <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-2xl font-bold text-transparent sm:text-xl lg:text-2xl">
            Services
          </h1>
          <p className=" text-sm text-muted-foreground sm:text-base lg:text-sm">
            Browse the storefront service catalog, open a service for more
            detail, or jump into editing from the card menu.
          </p>
        </div>

        <Button onClick={() => navigate("/admin/services/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {isLoading
                ? `Showing 0 services`
                : `Showing ${services.length} service${services.length === 1 ? "" : "s"}`}
            </div>
          </div>

          {isLoading ? (
            <p className="py-6 text-sm text-muted-foreground">
              Loading services...
            </p>
          ) : error ? (
            <p className="py-6 text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : "Unable to load services."}
            </p>
          ) : services.length === 0 ? (
            <div className="space-y-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                No services found yet. Add the first service to populate this
                catalog.
              </p>
              <Button onClick={() => navigate("/admin/services/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Service
              </Button>
            </div>
          ) : (
            <ServiceCardsGrid
              services={services}
              className="lg:grid-cols-2"
              renderActions={(service) => {
                const routeParam = getFarmServiceRouteParam(service);
                const isDeleting =
                  deletingServiceId !== null &&
                  String(deletingServiceId) === String(service.id);

                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground"
                        aria-label={`Open actions for ${service.title}`}
                      >
                        <EllipsisVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(`/admin/services/${routeParam}`)
                        }
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(`/admin/services/${routeParam}/edit`)
                        }
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Update
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={isDeleting}
                        className="text-destructive focus:text-destructive"
                        onClick={() => void handleDeleteService(service)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        {isDeleting ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
