import { z } from "zod";

import { getAuthContext } from "@/lib/auth/request-context";
import { hasRole } from "@/lib/auth/permissions";
import { calculateRouteOptimizationScore } from "@/lib/domain/route-optimization";
import { apiError, apiSuccess, getRequestId, normalizeRouteError, writeAuditLog } from "@/lib/api/route-utils";
import type { Database } from "@/types/supabase";

type RoutePlanRow = Database["public"]["Tables"]["route_plans"]["Row"];

const paramsSchema = z.object({ id: z.string().uuid() });

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const requestId = getRequestId(request);

  try {
    const { id } = paramsSchema.parse(params);
    const { context, error } = await getAuthContext();
    if (error || !context) {
      return apiError(requestId, { code: error?.code ?? "UNAUTHORIZED", message: error?.message ?? "Unauthorized." }, error?.status ?? 401);
    }

    if (!hasRole(context.role, ["admin", "manager", "carrier"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to optimize routes." }, 403);
    }

    const { data: routeData, error: routeError } = await context.supabase.from("route_plans").select("*").eq("id", id).single();
    const route = (routeData as RoutePlanRow | null) ?? null;
    if (routeError || !route) {
      return apiError(requestId, { code: "ROUTE_FETCH_FAILED", message: routeError?.message ?? "Route not found." }, 404);
    }

    const { count: stopCount } = await context.supabase
      .from("route_stops")
      .select("*", { count: "exact", head: true })
      .eq("route_plan_id", id);

    const optimizationScore = calculateRouteOptimizationScore({
      mode: route.mode,
      distanceKm: route.distance_km ?? 0,
      durationHours: route.estimated_duration_hours ?? 0,
      stopCount: stopCount ?? 0,
    });

    const status = route.status === "draft" ? "optimized" : route.status;

    const { data: updatedRoute, error: updateError } = await context.supabase
      .from("route_plans")
      .update({ optimization_score: optimizationScore, status, organization_id: context.organizationId })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      return apiError(requestId, { code: "ROUTE_OPTIMIZE_FAILED", message: updateError.message }, 400);
    }

    writeAuditLog({ requestId, action: "routes.optimize", userId: context.userId, role: context.role, organizationId: context.organizationId });
    return apiSuccess(requestId, updatedRoute);
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}
