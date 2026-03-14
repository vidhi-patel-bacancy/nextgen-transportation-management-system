import { z } from "zod";

import { getAuthContext } from "@/lib/auth/request-context";
import { hasRole } from "@/lib/auth/permissions";
import { apiError, apiSuccess, getRequestId, normalizeRouteError, writeAuditLog } from "@/lib/api/route-utils";

const createPaymentSchema = z.object({
  invoice_id: z.string().uuid(),
  paid_amount: z.coerce.number().positive(),
  currency: z.string().min(3).max(3).default("USD"),
  payment_method: z.enum(["ach", "wire", "card", "other"]),
  payment_reference: z.string().nullable().optional(),
  paid_at: z.string(),
});

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { context, error } = await getAuthContext();
    if (error || !context) {
      return apiError(requestId, { code: error?.code ?? "UNAUTHORIZED", message: error?.message ?? "Unauthorized." }, error?.status ?? 401);
    }

    if (!hasRole(context.role, ["admin", "manager"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to view payments." }, 403);
    }

    const { data, error: queryError } = await context.supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      return apiError(requestId, { code: "PAYMENTS_FETCH_FAILED", message: queryError.message }, 400);
    }

    writeAuditLog({ requestId, action: "payments.list", userId: context.userId, role: context.role, organizationId: context.organizationId });
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

    if (!hasRole(context.role, ["admin", "manager"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to create payments." }, 403);
    }

    const parsed = createPaymentSchema.parse(await request.json());
    const { data, error: insertError } = await context.supabase
      .from("payments")
      .insert({
        ...parsed,
        payment_reference: parsed.payment_reference ?? null,
        paid_at: new Date(parsed.paid_at).toISOString(),
        organization_id: context.organizationId,
      })
      .select("*")
      .single();

    if (insertError) {
      return apiError(requestId, { code: "PAYMENT_CREATE_FAILED", message: insertError.message }, 400);
    }

    writeAuditLog({ requestId, action: "payments.create", userId: context.userId, role: context.role, organizationId: context.organizationId });
    return apiSuccess(requestId, data, 201);
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}
