import { apiRequest } from "@/hooks/useClient";

export default async function GetProducts(): Promise<PromisTypes> {
  try {
    const response = await apiRequest<RequestResponse>("products/", "GET");

    return {
      success: true,
      data: response.data || [],
      message: response.message || "Success",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      data: [],
      message:
        error instanceof Error ? error.message : "Failed to fetch products",
      status: 500,
    };
  }
}
