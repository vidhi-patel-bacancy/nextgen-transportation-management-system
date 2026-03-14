import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type CarrierRow = Database["public"]["Tables"]["carriers"]["Row"];
type CarrierInsert = Database["public"]["Tables"]["carriers"]["Insert"];
type CarrierUpdate = Database["public"]["Tables"]["carriers"]["Update"];

export async function listCarriers(): Promise<CarrierRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("carriers").select("*").order("company_name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CarrierRow[];
}

export async function getCarrierById(id: string): Promise<CarrierRow> {
  const supabase = createClient();
  const { data, error } = await supabase.from("carriers").select("*").eq("id", id).single();

  if (error) throw error;
  return data as CarrierRow;
}

export async function createCarrier(payload: CarrierInsert): Promise<CarrierRow> {
  const supabase = createClient();
  const { data, error } = await supabase.from("carriers").insert(payload).select("*").single();

  if (error) throw error;
  return data as CarrierRow;
}

export async function updateCarrier(id: string, payload: CarrierUpdate): Promise<CarrierRow> {
  const supabase = createClient();
  const { data, error } = await supabase.from("carriers").update(payload).eq("id", id).select("*").single();

  if (error) throw error;
  return data as CarrierRow;
}
