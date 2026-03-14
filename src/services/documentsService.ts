import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];
type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];

export async function listDocuments(shipmentId: string): Promise<DocumentRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("shipment_id", shipmentId)
    .order("uploaded_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DocumentRow[];
}

export async function createDocument(payload: DocumentInsert): Promise<DocumentRow> {
  const supabase = createClient();
  const { data, error } = await supabase.from("documents").insert(payload).select("*").single();

  if (error) throw error;
  return data as DocumentRow;
}

export async function deleteDocument(documentId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("documents").delete().eq("id", documentId);

  if (error) throw error;
}
