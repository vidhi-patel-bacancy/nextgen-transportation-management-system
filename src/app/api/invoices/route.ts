import { z } from "zod";

import { getAuthContext } from "@/lib/auth/request-context";
import { hasRole } from "@/lib/auth/permissions";
import { runAutomatedInvoiceAudit } from "@/lib/domain/invoice-audit";
import { apiError, apiSuccess, getRequestId, normalizeRouteError, writeAuditLog } from "@/lib/api/route-utils";
import type { Database } from "@/types/supabase";

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];

const createInvoiceSchema = z.object({
  shipment_id: z.string().uuid().nullable().optional(),
  carrier_id: z.string().uuid().nullable().optional(),
  invoice_number: z.string().min(3),
  billed_amount: z.coerce.number().positive(),
  audited_amount: z.coerce.number().nullable().optional(),
  currency: z.string().min(3).max(3).default("USD"),
  status: z.enum(["received", "auditing", "approved", "rejected", "paid"]).default("received"),
  due_date: z.string().nullable().optional(),
  received_at: z.string().optional(),
});

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { context, error } = await getAuthContext();
    if (error || !context) {
      return apiError(requestId, { code: error?.code ?? "UNAUTHORIZED", message: error?.message ?? "Unauthorized." }, error?.status ?? 401);
    }

    if (!hasRole(context.role, ["admin", "manager", "carrier", "customer"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to view invoices." }, 403);
    }

    const { data, error: queryError } = await context.supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      return apiError(requestId, { code: "INVOICES_FETCH_FAILED", message: queryError.message }, 400);
    }

    writeAuditLog({ requestId, action: "invoices.list", userId: context.userId, role: context.role, organizationId: context.organizationId });
    return apiSuccess(requestId, data ?? []);
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { context, error } = await getAuthContext();
    if (error || !context) {
      return apiError(requestId, { code: error?.code ?? "UNAUTHORIZED", message: error?.message ?? "Unauthorized." }, error?.status ?? 401);
    }

    if (!hasRole(context.role, ["admin", "manager", "carrier"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to create invoices." }, 403);
    }

    const parsed = createInvoiceSchema.parse(await request.json());

    const initialStatus = parsed.status;
    const { data, error: insertError } = await context.supabase
      .from("invoices")
      .insert({
        ...parsed,
        due_date: parsed.due_date ?? null,
        received_at: parsed.received_at ? new Date(parsed.received_at).toISOString() : new Date().toISOString(),
        organization_id: context.organizationId,
      })
      .select("*")
      .single();

    if (insertError) {
      return apiError(requestId, { code: "INVOICE_CREATE_FAILED", message: insertError.message }, 400);
    }

    const createdInvoice = data as InvoiceRow;

    if (createdInvoice?.shipment_id) {
      const invoiceDate = createdInvoice.received_at.slice(0, 10);
      const match = await runAutomatedInvoiceAudit({
        supabase: context.supabase,
        organizationId: context.organizationId,
        shipmentId: createdInvoice.shipment_id,
        billedAmount: Number(createdInvoice.billed_amount),
        invoiceDate,
      });

      const auditPayload = {
        organization_id: context.organizationId,
        invoice_id: createdInvoice.id,
        auditor_user_id: hasRole(context.role, ["admin", "manager"]) ? context.userId : null,
        status: match.status,
        discrepancy_amount: match.discrepancyAmount,
        expected_amount: match.expectedAmount,
        tolerance_amount: match.toleranceAmount,
        match_confidence: match.matchConfidence,
        matched_rate_id: match.matchedRateId,
        rule_breakdown: match.ruleBreakdown,
        notes: match.notes,
        audited_at: new Date().toISOString(),
      };

      const { error: auditError } = await context.supabase.from("freight_audits").insert(auditPayload);
      if (!auditError) {
        const nextStatus =
          initialStatus === "paid" ? "paid" : match.status === "approved" ? "approved" : "auditing";

        await context.supabase
          .from("invoices")
          .update({
            status: nextStatus,
            audited_amount: match.expectedAmount ?? null,
            organization_id: context.organizationId,
          })
          .eq("id", createdInvoice.id);
      }
    }

    const { data: refreshed } = await context.supabase.from("invoices").select("*").eq("id", createdInvoice.id).single();

    writeAuditLog({ requestId, action: "invoices.create", userId: context.userId, role: context.role, organizationId: context.organizationId });
    return apiSuccess(requestId, (refreshed as InvoiceRow | null) ?? createdInvoice, 201);
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}
