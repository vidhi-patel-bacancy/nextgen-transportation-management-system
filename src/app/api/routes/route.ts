import { z } from "zod";

import { getAuthContext } from "@/lib/auth/request-context";
import { hasRole } from "@/lib/auth/permissions";
import { calculateRouteOptimizationScore } from "@/lib/domain/route-optimization";
import { apiError, apiSuccess, getRequestId, normalizeRouteError, writeAuditLog } from "@/lib/api/route-utils";

const createRouteSchema = z.object({
  shipment_id: z.string().uuid().nullable().optional(),
  origin: z.string().min(2),
  destination: z.string().min(2),
  mode: z.enum(["ltl", "ftl", "parcel", "rail", "ocean", "air"]),
  distance_km: z.coerce.number().nonnegative().nullable().optional(),
  estimated_duration_hours: z.coerce.number().nonnegative().nullable().optional(),
  status: z.enum(["draft", "optimized", "approved", "dispatched", "archived"]).default("draft"),
  planned_departure: z.string().nullable().optional(),
  planned_arrival: z.string().nullable().optional(),
});

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { context, error } = await getAuthContext();
    if (error || !context) {
      return apiError(requestId, { code: error?.code ?? "UNAUTHORIZED", message: error?.message ?? "Unauthorized." }, error?.status ?? 401);
    }

    if (!hasRole(context.role, ["admin", "manager", "carrier"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to view routes." }, 403);
    }

    const { data, error: queryError } = await context.supabase
      .from("route_plans")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      return apiError(requestId, { code: "ROUTES_FETCH_FAILED", message: queryError.message }, 400);
    }

    writeAuditLog({ requestId, action: "routes.list", userId: context.userId, role: context.role, organizationId: context.organizationId });
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
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to create routes." }, 403);
    }

    const parsed = createRouteSchema.parse(await request.json());
    const computedScore = calculateRouteOptimizationScore({
      mode: parsed.mode,
      distanceKm: parsed.distance_km ?? 0,
      durationHours: parsed.estimated_duration_hours ?? 0,
      stopCount: 0,
    });

    const { data, error: insertError } = await context.supabase
      .from("route_plans")
      .insert({
        ...parsed,
        optimization_score: computedScore,
        planned_departure: parsed.planned_departure ? new Date(parsed.planned_departure).toISOString() : null,
        planned_arrival: parsed.planned_arrival ? new Date(parsed.planned_arrival).toISOString() : null,
        organization_id: context.organizationId,
      })
      .select("*")
      .single();

    if (insertError) {
      return apiError(requestId, { code: "ROUTE_CREATE_FAILED", message: insertError.message }, 400);
    }

    writeAuditLog({ requestId, action: "routes.create", userId: context.userId, role: context.role, organizationId: context.organizationId });
    return apiSuccess(requestId, data, 201);
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}
