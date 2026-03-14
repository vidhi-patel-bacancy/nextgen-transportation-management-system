import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];

export async function listOrders(): Promise<OrderRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as OrderRow[];
}

export async function getOrderById(id: string): Promise<OrderRow> {
  const supabase = createClient();
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).single();

  if (error) throw error;
  return data as OrderRow;
}

export async function createOrder(payload: OrderInsert): Promise<OrderRow> {
  const supabase = createClient();
  const { data, error } = await supabase.from("orders").insert(payload).select("*").single();

  if (error) throw error;
  return data as OrderRow;
}

export async function updateOrder(id: string, payload: OrderUpdate): Promise<OrderRow> {
  const supabase = createClient();
  const { data, error } = await supabase.from("orders").update(payload).eq("id", id).select("*").single();

  if (error) throw error;
  return data as OrderRow;
}

export async function deleteOrder(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;
}
