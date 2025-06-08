
import { apiRequest } from "@/hooks/useClient";

export default async function GetCategories(): Promise<PromisTypes> {
  try {
    const response = await apiRequest<RequestResponse>("categories/", "GET");
    
    return { 
      success: true, 
      data: response.data || [], 
      message: response.message || "Success", 
      status: response.status || 200 
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { 
      success: false, 
      data: [], 
      message: error instanceof Error ? error.message : "Failed to fetch categories", 
      status: 500 
    };
  }
}
