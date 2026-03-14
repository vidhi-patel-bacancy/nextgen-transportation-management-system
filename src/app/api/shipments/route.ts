import { z } from "zod";

import { getAuthContext } from "@/lib/auth/request-context";
import { hasRole } from "@/lib/auth/permissions";
import { apiError, apiSuccess, getRequestId, normalizeRouteError, writeAuditLog } from "@/lib/api/route-utils";

const createShipmentSchema = z.object({
  order_id: z.string().uuid(),
  carrier_id: z.string().uuid(),
  tracking_number: z.string().min(4),
  status: z.enum(["created", "assigned", "in_transit", "delivered", "exception"]).default("created"),
  estimated_delivery: z.string().nullable().optional(),
});

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { context, error } = await getAuthContext();
    if (error || !context) {
      return apiError(requestId, { code: error?.code ?? "UNAUTHORIZED", message: error?.message ?? "Unauthorized." }, error?.status ?? 401);
    }

    if (!hasRole(context.role, ["admin", "manager", "carrier", "customer"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to view shipments." }, 403);
    }

    const { data, error: queryError } = await context.supabase
      .from("shipments")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      return apiError(requestId, { code: "SHIPMENTS_FETCH_FAILED", message: queryError.message }, 400);
    }

    writeAuditLog({
      requestId,
      action: "shipments.list",
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

    if (!hasRole(context.role, ["admin", "manager"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to create shipments." }, 403);
    }

    const parsed = createShipmentSchema.parse(await request.json());

    const { data, error: insertError } = await context.supabase
      .from("shipments")
      .insert({
        ...parsed,
        estimated_delivery: parsed.estimated_delivery ? new Date(parsed.estimated_delivery).toISOString() : null,
        organization_id: context.organizationId,
      })
      .select("*")
      .single();

    if (insertError) {
      return apiError(requestId, { code: "SHIPMENT_CREATE_FAILED", message: insertError.message }, 400);
    }

    writeAuditLog({
      requestId,
      action: "shipments.create",
      userId: context.userId,
      role: context.role,
      organizationId: context.organizationId,
    });

    return apiSuccess(requestId, data, 201);
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}
