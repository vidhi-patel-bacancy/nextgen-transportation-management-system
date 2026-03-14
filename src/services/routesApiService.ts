import { http } from "@/lib/api/http";
import type { Database } from "@/types/supabase";

type RoutePlanRow = Database["public"]["Tables"]["route_plans"]["Row"];
type RoutePlanInsert = Database["public"]["Tables"]["route_plans"]["Insert"];
type RoutePlanUpdate = Database["public"]["Tables"]["route_plans"]["Update"];
type LoadPlanRow = Database["public"]["Tables"]["load_plans"]["Row"];
type LoadPlanInsert = Database["public"]["Tables"]["load_plans"]["Insert"];

interface ApiResponse<T> {
  data: T;
  requestId: string;
}

export async function listRoutePlans(): Promise<RoutePlanRow[]> {
  const response = await http.get<ApiResponse<RoutePlanRow[]>>("/routes");
  return response.data.data;
}

export async function createRoutePlan(payload: RoutePlanInsert): Promise<RoutePlanRow> {
  const response = await http.post<ApiResponse<RoutePlanRow>>("/routes", payload);
  return response.data.data;
}

export async function updateRoutePlan(id: string, payload: RoutePlanUpdate): Promise<RoutePlanRow> {
  const response = await http.patch<ApiResponse<RoutePlanRow>>(`/routes/${id}`, payload);
  return response.data.data;
}

export async function optimizeRoutePlan(id: string): Promise<RoutePlanRow> {
  const response = await http.post<ApiResponse<RoutePlanRow>>(`/routes/${id}/optimize`);
  return response.data.data;
}

export async function listLoadPlans(): Promise<LoadPlanRow[]> {
  const response = await http.get<ApiResponse<LoadPlanRow[]>>("/load-plans");
  return response.data.data;
}

export async function createLoadPlan(payload: LoadPlanInsert): Promise<LoadPlanRow> {
  const response = await http.post<ApiResponse<LoadPlanRow>>("/load-plans", payload);
  return response.data.data;
}
