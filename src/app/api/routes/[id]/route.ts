import { z } from "zod";

import { getAuthContext } from "@/lib/auth/request-context";
import { hasRole } from "@/lib/auth/permissions";
import { calculateRouteOptimizationScore } from "@/lib/domain/route-optimization";
import { apiError, apiSuccess, getRequestId, normalizeRouteError, writeAuditLog } from "@/lib/api/route-utils";
import type { Database } from "@/types/supabase";

type RoutePlanRow = Database["public"]["Tables"]["route_plans"]["Row"];

const paramsSchema = z.object({ id: z.string().uuid() });
const updateSchema = z
  .object({
    shipment_id: z.string().uuid().nullable().optional(),
    origin: z.string().min(2).optional(),
    destination: z.string().min(2).optional(),
    mode: z.enum(["ltl", "ftl", "parcel", "rail", "ocean", "air"]).optional(),
    distance_km: z.coerce.number().nonnegative().nullable().optional(),
    estimated_duration_hours: z.coerce.number().nonnegative().nullable().optional(),
    status: z.enum(["draft", "optimized", "approved", "dispatched", "archived"]).optional(),
    planned_departure: z.string().nullable().optional(),
    planned_arrival: z.string().nullable().optional(),
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

    if (!hasRole(context.role, ["admin", "manager", "carrier"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to view route details." }, 403);
    }

    const { data, error: queryError } = await context.supabase.from("route_plans").select("*").eq("id", id).single();
    if (queryError) {
      return apiError(requestId, { code: "ROUTE_FETCH_FAILED", message: queryError.message }, 404);
    }

    writeAuditLog({ requestId, action: "routes.read", userId: context.userId, role: context.role, organizationId: context.organizationId });
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

    if (!hasRole(context.role, ["admin", "manager", "carrier"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to update routes." }, 403);
    }

    const parsed = updateSchema.parse(await request.json());
    const { data: currentRouteData } = await context.supabase.from("route_plans").select("*").eq("id", id).single();
    const currentRoute = (currentRouteData as RoutePlanRow | null) ?? null;

    const { count: stopCount } = await context.supabase
      .from("route_stops")
      .select("*", { count: "exact", head: true })
      .eq("route_plan_id", id);

    const computedScore = calculateRouteOptimizationScore({
      mode: (parsed.mode ?? currentRoute?.mode ?? "ltl") as "ltl" | "ftl" | "parcel" | "rail" | "ocean" | "air",
      distanceKm: parsed.distance_km ?? currentRoute?.distance_km ?? 0,
      durationHours: parsed.estimated_duration_hours ?? currentRoute?.estimated_duration_hours ?? 0,
      stopCount: stopCount ?? 0,
    });

    const { data, error: updateError } = await context.supabase
      .from("route_plans")
      .update({
        ...parsed,
        optimization_score: computedScore,
        planned_departure:
          parsed.planned_departure === undefined
            ? undefined
            : parsed.planned_departure
              ? new Date(parsed.planned_departure).toISOString()
              : null,
        planned_arrival:
          parsed.planned_arrival === undefined
            ? undefined
            : parsed.planned_arrival
              ? new Date(parsed.planned_arrival).toISOString()
              : null,
        organization_id: context.organizationId,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      return apiError(requestId, { code: "ROUTE_UPDATE_FAILED", message: updateError.message }, 400);
    }

    writeAuditLog({ requestId, action: "routes.update", userId: context.userId, role: context.role, organizationId: context.organizationId });
    return apiSuccess(requestId, data);
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const requestId = getRequestId(request);

  try {
    const { id } = paramsSchema.parse(params);
    const { context, error } = await getAuthContext();
    if (error || !context) {
      return apiError(requestId, { code: error?.code ?? "UNAUTHORIZED", message: error?.message ?? "Unauthorized." }, error?.status ?? 401);
    }

    if (!hasRole(context.role, ["admin", "manager"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to delete routes." }, 403);
    }

    const { error: deleteError } = await context.supabase.from("route_plans").delete().eq("id", id);
    if (deleteError) {
      return apiError(requestId, { code: "ROUTE_DELETE_FAILED", message: deleteError.message }, 400);
    }

    writeAuditLog({ requestId, action: "routes.delete", userId: context.userId, role: context.role, organizationId: context.organizationId });
    return apiSuccess(requestId, { id, deleted: true });
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}
