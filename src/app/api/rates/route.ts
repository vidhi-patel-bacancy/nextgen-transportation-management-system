import { z } from "zod";

import { getAuthContext } from "@/lib/auth/request-context";
import { hasRole } from "@/lib/auth/permissions";
import { apiError, apiSuccess, getRequestId, normalizeRouteError, writeAuditLog } from "@/lib/api/route-utils";

const createRateSchema = z.object({
  carrier_id: z.string().uuid().nullable().optional(),
  mode: z.enum(["ltl", "ftl", "parcel", "rail", "ocean", "air"]),
  origin_region: z.string().min(2),
  destination_region: z.string().min(2),
  min_weight: z.coerce.number().nonnegative().default(0),
  max_weight: z.coerce.number().positive(),
  base_amount: z.coerce.number().positive(),
  fuel_surcharge_pct: z.coerce.number().nonnegative().default(0),
  currency: z.string().min(3).max(3).default("USD"),
  effective_from: z.string(),
  effective_to: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { context, error } = await getAuthContext();
    if (error || !context) {
      return apiError(requestId, { code: error?.code ?? "UNAUTHORIZED", message: error?.message ?? "Unauthorized." }, error?.status ?? 401);
    }

    if (!hasRole(context.role, ["admin", "manager", "carrier", "customer"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to view rates." }, 403);
    }

    const { data, error: queryError } = await context.supabase
      .from("rates")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      return apiError(requestId, { code: "RATES_FETCH_FAILED", message: queryError.message }, 400);
    }

    writeAuditLog({ requestId, action: "rates.list", userId: context.userId, role: context.role, organizationId: context.organizationId });
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
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to create rates." }, 403);
    }

    const parsed = createRateSchema.parse(await request.json());
    const { data, error: insertError } = await context.supabase
      .from("rates")
      .insert({ ...parsed, organization_id: context.organizationId })
      .select("*")
      .single();

    if (insertError) {
      return apiError(requestId, { code: "RATE_CREATE_FAILED", message: insertError.message }, 400);
    }

    writeAuditLog({ requestId, action: "rates.create", userId: context.userId, role: context.role, organizationId: context.organizationId });
    return apiSuccess(requestId, data, 201);
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}
