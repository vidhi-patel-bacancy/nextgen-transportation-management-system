import { isAfter } from "date-fns";

import { createClient } from "@/lib/supabase/client";
import type { DashboardMetrics, ShipmentStatus } from "@/types";
import type { Database } from "@/types/supabase";

type ShipmentRow = Database["public"]["Tables"]["shipments"]["Row"];
type ShipmentInsert = Database["public"]["Tables"]["shipments"]["Insert"];
type ShipmentUpdate = Database["public"]["Tables"]["shipments"]["Update"];

export async function listShipments(): Promise<ShipmentRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("shipments").select("*").order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ShipmentRow[];
}

export async function getShipmentById(id: string): Promise<ShipmentRow> {
  const supabase = createClient();
  const { data, error } = await supabase.from("shipments").select("*").eq("id", id).single();

  if (error) throw error;
  return data as ShipmentRow;
}

export async function createShipment(payload: ShipmentInsert): Promise<ShipmentRow> {
  const supabase = createClient();
  const { data, error } = await supabase.from("shipments").insert(payload).select("*").single();

  if (error) throw error;
  return data as ShipmentRow;
}

export async function updateShipment(id: string, payload: ShipmentUpdate): Promise<ShipmentRow> {
  const supabase = createClient();
  const { data, error } = await supabase.from("shipments").update(payload).eq("id", id).select("*").single();

  if (error) throw error;
  return data as ShipmentRow;
}

export async function updateShipmentStatus(id: string, status: ShipmentStatus): Promise<ShipmentRow> {
  return updateShipment(id, { status });
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const shipments = await listShipments();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    totalShipments: shipments.length,
    activeShipments: shipments.filter((item) => item.status === "in_transit" || item.status === "assigned").length,
    delayedShipments: shipments.filter(
      (item) => item.status === "exception" || (item.estimated_delivery && isAfter(now, new Date(item.estimated_delivery))),
    ).length,
    monthlyShipments: shipments.filter((item) => new Date(item.created_at) >= monthStart).length,
  };
}
