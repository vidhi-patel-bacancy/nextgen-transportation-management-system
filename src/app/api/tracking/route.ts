import { z } from "zod";

import { getAuthContext } from "@/lib/auth/request-context";
import { hasRole } from "@/lib/auth/permissions";
import { apiError, apiSuccess, getRequestId, normalizeRouteError, writeAuditLog } from "@/lib/api/route-utils";

const createTrackingSchema = z.object({
  shipment_id: z.string().uuid(),
  status: z.enum(["pickup", "in_transit", "delay", "delivered"]),
  location: z.string().min(2),
  timestamp: z.string(),
  notes: z.string().nullable().optional(),
});

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { context, error } = await getAuthContext();
    if (error || !context) {
      return apiError(requestId, { code: error?.code ?? "UNAUTHORIZED", message: error?.message ?? "Unauthorized." }, error?.status ?? 401);
    }

    if (!hasRole(context.role, ["admin", "manager", "carrier", "customer"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to view tracking events." }, 403);
    }

    const url = new URL(request.url);
    const shipmentId = url.searchParams.get("shipment_id");

    let query = context.supabase.from("tracking_events").select("*").order("timestamp", { ascending: false });
    if (shipmentId) {
      query = query.eq("shipment_id", shipmentId);
    }

    const { data, error: queryError } = await query;

    if (queryError) {
      return apiError(requestId, { code: "TRACKING_FETCH_FAILED", message: queryError.message }, 400);
    }

    writeAuditLog({
      requestId,
      action: "tracking.list",
      userId: context.userId,
      role: context.role,
      organizationId: context.organizationId,
    });

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
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to create tracking events." }, 403);
    }

    const parsed = createTrackingSchema.parse(await request.json());

    const { data, error: insertError } = await context.supabase
      .from("tracking_events")
      .insert({
        shipment_id: parsed.shipment_id,
        status: parsed.status,
        location: parsed.location,
        timestamp: new Date(parsed.timestamp).toISOString(),
        notes: parsed.notes ?? null,
        organization_id: context.organizationId,
      })
      .select("*")
      .single();

    if (insertError) {
      return apiError(requestId, { code: "TRACKING_CREATE_FAILED", message: insertError.message }, 400);
    }

    writeAuditLog({
      requestId,
      action: "tracking.create",
      userId: context.userId,
      role: context.role,
      organizationId: context.organizationId,
    });

    return apiSuccess(requestId, data, 201);
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}
