import { apiRequest } from "@/hooks/useClient";
import { FARM_SERVICES_ENDPOINT, type FarmService } from "@/lib/services";
import { ApiListResponse, ApiSingleResponse } from "@/types/admin";

export const GetFarmServices = async (): Promise<
  ApiListResponse<FarmService>
> => {
  try {
    const response = await apiRequest<FarmService[]>(
      FARM_SERVICES_ENDPOINT,
      "GET",
    );

    return {
      success: true,
      data: Array.isArray(response) ? response : [],
      message: "Services retrieved successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching farm services:", error);
    return {
      success: false,
      data: [],
      message:
        error instanceof Error ? error.message : "Failed to fetch services",
      status: 500,
    };
  }
};

export const CreateAdminFarmService = async (
  payload: FarmService,
): Promise<ApiSingleResponse<FarmService>> => {
  try {
    const response = await apiRequest<FarmService>(
      FARM_SERVICES_ENDPOINT,
      "POST",
      payload,
    );

    return {
      success: true,
      data: response,
      message: "Service created successfully",
      status: 201,
    };
  } catch (error) {
    console.error("Error creating farm service:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create service",
      status: 500,
    };
  }
};

export const UpdateAdminFarmService = async (
  id: string | number,
  payload: FarmService,
): Promise<ApiSingleResponse<FarmService>> => {
  try {
    const response = await apiRequest<FarmService>(
      `${FARM_SERVICES_ENDPOINT}${id}`,
      "PUT",
      payload,
    );

    return {
      success: true,
      data: response,
      message: "Service updated successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error updating farm service:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update service",
      status: 500,
    };
  }
};

export const DeleteAdminFarmService = async (
  id: string | number,
): Promise<ApiSingleResponse<null>> => {
  try {
    await apiRequest(`${FARM_SERVICES_ENDPOINT}${id}`, "DELETE");

    return {
      success: true,
      data: null,
      message: "Service deleted successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error deleting farm service:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete service",
      status: 500,
    };
  }
};
