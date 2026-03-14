import { http } from "@/lib/api/http";
import type { Database } from "@/types/supabase";

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
type InvoiceInsert = Database["public"]["Tables"]["invoices"]["Insert"];
type InvoiceUpdate = Database["public"]["Tables"]["invoices"]["Update"];
type FreightAuditRow = Database["public"]["Tables"]["freight_audits"]["Row"];
type FreightAuditInsert = Database["public"]["Tables"]["freight_audits"]["Insert"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];

interface ApiResponse<T> {
  data: T;
  requestId: string;
}

export async function listInvoices(): Promise<InvoiceRow[]> {
  const response = await http.get<ApiResponse<InvoiceRow[]>>("/invoices");
  return response.data.data;
}

export async function createInvoice(payload: InvoiceInsert): Promise<InvoiceRow> {
  const response = await http.post<ApiResponse<InvoiceRow>>("/invoices", payload);
  return response.data.data;
}

export async function updateInvoice(id: string, payload: InvoiceUpdate): Promise<InvoiceRow> {
  const response = await http.patch<ApiResponse<InvoiceRow>>(`/invoices/${id}`, payload);
  return response.data.data;
}

export async function listFreightAudits(): Promise<FreightAuditRow[]> {
  const response = await http.get<ApiResponse<FreightAuditRow[]>>("/freight-audits");
  return response.data.data;
}

export async function createFreightAudit(payload: FreightAuditInsert): Promise<FreightAuditRow> {
  const response = await http.post<ApiResponse<FreightAuditRow>>("/freight-audits", payload);
  return response.data.data;
}

export async function listPayments(): Promise<PaymentRow[]> {
  const response = await http.get<ApiResponse<PaymentRow[]>>("/payments");
  return response.data.data;
}

export async function createPayment(payload: PaymentInsert): Promise<PaymentRow> {
  const response = await http.post<ApiResponse<PaymentRow>>("/payments", payload);
  return response.data.data;
}
