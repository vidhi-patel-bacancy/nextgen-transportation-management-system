import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type TrackingRow = Database["public"]["Tables"]["tracking_events"]["Row"];
type TrackingInsert = Database["public"]["Tables"]["tracking_events"]["Insert"];

export async function listTrackingEvents(shipmentId?: string): Promise<TrackingRow[]> {
  const supabase = createClient();

  let query = supabase.from("tracking_events").select("*").order("timestamp", { ascending: false });
  if (shipmentId) {
    query = query.eq("shipment_id", shipmentId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as TrackingRow[];
}

export async function createTrackingEvent(payload: TrackingInsert): Promise<TrackingRow> {
  const supabase = createClient();
  const { data, error } = await supabase.from("tracking_events").insert(payload).select("*").single();

  if (error) throw error;
  return data as TrackingRow;
}
