import { z } from "zod";

import { getAuthContext } from "@/lib/auth/request-context";
import { hasRole } from "@/lib/auth/permissions";
import { apiError, apiSuccess, getRequestId, normalizeRouteError, writeAuditLog } from "@/lib/api/route-utils";

const createAuditSchema = z.object({
  invoice_id: z.string().uuid(),
  status: z.enum(["pending", "in_review", "approved", "rejected"]).default("pending"),
  discrepancy_amount: z.coerce.number().nonnegative().default(0),
  expected_amount: z.coerce.number().nullable().optional(),
  tolerance_amount: z.coerce.number().nullable().optional(),
  match_confidence: z.coerce.number().min(0).max(100).default(0),
  matched_rate_id: z.string().uuid().nullable().optional(),
  rule_breakdown: z.array(
    z.object({
      rule_id: z.string(),
      label: z.string(),
      weight: z.number(),
      score: z.number(),
      passed: z.boolean(),
      details: z.string(),
    }),
  ).optional(),
  notes: z.string().nullable().optional(),
  audited_at: z.string().optional(),
});

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { context, error } = await getAuthContext();
    if (error || !context) {
      return apiError(requestId, { code: error?.code ?? "UNAUTHORIZED", message: error?.message ?? "Unauthorized." }, error?.status ?? 401);
    }

    if (!hasRole(context.role, ["admin", "manager"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to view freight audits." }, 403);
    }

    const { data, error: queryError } = await context.supabase
      .from("freight_audits")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      return apiError(requestId, { code: "FREIGHT_AUDITS_FETCH_FAILED", message: queryError.message }, 400);
    }

    writeAuditLog({ requestId, action: "freight_audits.list", userId: context.userId, role: context.role, organizationId: context.organizationId });
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
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to create freight audits." }, 403);
    }

    const parsed = createAuditSchema.parse(await request.json());
    const { data, error: insertError } = await context.supabase
      .from("freight_audits")
      .insert({
        ...parsed,
        auditor_user_id: context.userId,
        expected_amount: parsed.expected_amount ?? null,
        tolerance_amount: parsed.tolerance_amount ?? null,
        match_confidence: parsed.match_confidence,
        matched_rate_id: parsed.matched_rate_id ?? null,
        rule_breakdown: parsed.rule_breakdown ?? [],
        notes: parsed.notes ?? null,
        audited_at: parsed.audited_at ? new Date(parsed.audited_at).toISOString() : new Date().toISOString(),
        organization_id: context.organizationId,
      })
      .select("*")
      .single();

    if (insertError) {
      return apiError(requestId, { code: "FREIGHT_AUDIT_CREATE_FAILED", message: insertError.message }, 400);
    }

    writeAuditLog({ requestId, action: "freight_audits.create", userId: context.userId, role: context.role, organizationId: context.organizationId });
    return apiSuccess(requestId, data, 201);
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}
