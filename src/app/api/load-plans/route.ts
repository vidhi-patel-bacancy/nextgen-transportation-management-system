import { z } from "zod";

import { getAuthContext } from "@/lib/auth/request-context";
import { hasRole } from "@/lib/auth/permissions";
import { apiError, apiSuccess, getRequestId, normalizeRouteError, writeAuditLog } from "@/lib/api/route-utils";

const createLoadPlanSchema = z.object({
  route_plan_id: z.string().uuid().nullable().optional(),
  shipment_id: z.string().uuid().nullable().optional(),
  load_reference: z.string().min(4),
  capacity_weight: z.coerce.number().positive(),
  utilized_weight: z.coerce.number().nonnegative().default(0),
  status: z.enum(["draft", "optimized", "finalized"]).default("draft"),
});

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { context, error } = await getAuthContext();
    if (error || !context) {
      return apiError(requestId, { code: error?.code ?? "UNAUTHORIZED", message: error?.message ?? "Unauthorized." }, error?.status ?? 401);
    }

    if (!hasRole(context.role, ["admin", "manager", "carrier"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to view load plans." }, 403);
    }

    const { data, error: queryError } = await context.supabase
      .from("load_plans")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      return apiError(requestId, { code: "LOAD_PLANS_FETCH_FAILED", message: queryError.message }, 400);
    }

    writeAuditLog({ requestId, action: "load_plans.list", userId: context.userId, role: context.role, organizationId: context.organizationId });
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
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to create load plans." }, 403);
    }

    const parsed = createLoadPlanSchema.parse(await request.json());
    const { data, error: insertError } = await context.supabase
      .from("load_plans")
      .insert({ ...parsed, organization_id: context.organizationId })
      .select("*")
      .single();

    if (insertError) {
      return apiError(requestId, { code: "LOAD_PLAN_CREATE_FAILED", message: insertError.message }, 400);
    }

    writeAuditLog({ requestId, action: "load_plans.create", userId: context.userId, role: context.role, organizationId: context.organizationId });
    return apiSuccess(requestId, data, 201);
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}
