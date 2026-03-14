import { http } from "@/lib/api/http";
import type { Database } from "@/types/supabase";

type RateRow = Database["public"]["Tables"]["rates"]["Row"];
type RateInsert = Database["public"]["Tables"]["rates"]["Insert"];
type RateUpdate = Database["public"]["Tables"]["rates"]["Update"];

interface ApiResponse<T> {
  data: T;
  requestId: string;
}

export async function listRates(): Promise<RateRow[]> {
  const response = await http.get<ApiResponse<RateRow[]>>("/rates");
  return response.data.data;
}

export async function createRate(payload: RateInsert): Promise<RateRow> {
  const response = await http.post<ApiResponse<RateRow>>("/rates", payload);
  return response.data.data;
}

export async function updateRate(id: string, payload: RateUpdate): Promise<RateRow> {
  const response = await http.patch<ApiResponse<RateRow>>(`/rates/${id}`, payload);
  return response.data.data;
}

export async function deleteRate(id: string): Promise<void> {
  await http.delete(`/rates/${id}`);
}
