import { apiRequest } from "@/hooks/useClient";

export default async function GetCategories(): Promise<PromisTypes> {
  const response = await apiRequest<RequestResponse>("categories/", "GET");

  const data = response;

  return { success: true, data: data, message: "Success", status: 200 };
}
