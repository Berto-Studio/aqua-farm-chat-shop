import { buildApiUrl } from "@/hooks/useClient";
import { FARM_SERVICES_ENDPOINT, type FarmService } from "@/lib/services";

export const fetchFarmServices = async (): Promise<FarmService[]> => {
  const response = await fetch(buildApiUrl(FARM_SERVICES_ENDPOINT), {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch services");
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
};
