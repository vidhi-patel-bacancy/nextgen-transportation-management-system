import { z } from "zod";

import { getAuthContext } from "@/lib/auth/request-context";
import { hasRole } from "@/lib/auth/permissions";
import { apiError, apiSuccess, getRequestId, normalizeRouteError, writeAuditLog } from "@/lib/api/route-utils";

const paramsSchema = z.object({ id: z.string().uuid() });
const updateSchema = z
  .object({
    shipment_id: z.string().uuid().nullable().optional(),
    carrier_id: z.string().uuid().nullable().optional(),
    invoice_number: z.string().min(3).optional(),
    billed_amount: z.coerce.number().positive().optional(),
    audited_amount: z.coerce.number().nullable().optional(),
    currency: z.string().min(3).max(3).optional(),
    status: z.enum(["received", "auditing", "approved", "rejected", "paid"]).optional(),
    due_date: z.string().nullable().optional(),
    received_at: z.string().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "At least one field is required." });

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const requestId = getRequestId(request);

  try {
    const { id } = paramsSchema.parse(params);
    const { context, error } = await getAuthContext();
    if (error || !context) {
      return apiError(requestId, { code: error?.code ?? "UNAUTHORIZED", message: error?.message ?? "Unauthorized." }, error?.status ?? 401);
    }

    if (!hasRole(context.role, ["admin", "manager", "carrier", "customer"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to view invoice details." }, 403);
    }

    const { data, error: queryError } = await context.supabase.from("invoices").select("*").eq("id", id).single();
    if (queryError) {
      return apiError(requestId, { code: "INVOICE_FETCH_FAILED", message: queryError.message }, 404);
    }

    writeAuditLog({ requestId, action: "invoices.read", userId: context.userId, role: context.role, organizationId: context.organizationId });
    return apiSuccess(requestId, data);
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const requestId = getRequestId(request);

  try {
    const { id } = paramsSchema.parse(params);
    const { context, error } = await getAuthContext();
    if (error || !context) {
      return apiError(requestId, { code: error?.code ?? "UNAUTHORIZED", message: error?.message ?? "Unauthorized." }, error?.status ?? 401);
    }

    if (!hasRole(context.role, ["admin", "manager"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to update invoices." }, 403);
    }

    const parsed = updateSchema.parse(await request.json());
    const { data, error: updateError } = await context.supabase
      .from("invoices")
      .update({
        ...parsed,
        due_date: parsed.due_date ?? undefined,
        received_at: parsed.received_at ? new Date(parsed.received_at).toISOString() : undefined,
        organization_id: context.organizationId,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      return apiError(requestId, { code: "INVOICE_UPDATE_FAILED", message: updateError.message }, 400);
    }

    writeAuditLog({ requestId, action: "invoices.update", userId: context.userId, role: context.role, organizationId: context.organizationId });
    return apiSuccess(requestId, data);
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}
