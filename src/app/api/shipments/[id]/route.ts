import { z } from "zod";

import { getAuthContext } from "@/lib/auth/request-context";
import { hasRole } from "@/lib/auth/permissions";
import { apiError, apiSuccess, getRequestId, normalizeRouteError, writeAuditLog } from "@/lib/api/route-utils";

const paramsSchema = z.object({ id: z.string().uuid() });

const updateShipmentSchema = z
  .object({
    order_id: z.string().uuid().optional(),
    carrier_id: z.string().uuid().optional(),
    tracking_number: z.string().min(4).optional(),
    status: z.enum(["created", "assigned", "in_transit", "delivered", "exception"]).optional(),
    estimated_delivery: z.string().nullable().optional(),
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
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to view shipment details." }, 403);
    }

    const { data, error: queryError } = await context.supabase.from("shipments").select("*").eq("id", id).single();

    if (queryError) {
      return apiError(requestId, { code: "SHIPMENT_FETCH_FAILED", message: queryError.message }, 404);
    }

    writeAuditLog({
      requestId,
      action: "shipments.read",
      userId: context.userId,
      role: context.role,
      organizationId: context.organizationId,
    });

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
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to update shipments." }, 403);
    }

    const parsed = updateShipmentSchema.parse(await request.json());

    const payload: {
      order_id?: string;
      carrier_id?: string;
      tracking_number?: string;
      status?: "created" | "assigned" | "in_transit" | "delivered" | "exception";
      estimated_delivery?: string | null;
      organization_id: string;
    } = {
      organization_id: context.organizationId,
    };

    if (parsed.order_id !== undefined) payload.order_id = parsed.order_id;
    if (parsed.carrier_id !== undefined) payload.carrier_id = parsed.carrier_id;
    if (parsed.tracking_number !== undefined) payload.tracking_number = parsed.tracking_number;
    if (parsed.status !== undefined) payload.status = parsed.status;
    if (parsed.estimated_delivery !== undefined) {
      payload.estimated_delivery = parsed.estimated_delivery ? new Date(parsed.estimated_delivery).toISOString() : null;
    }

    const { data, error: updateError } = await context.supabase.from("shipments").update(payload).eq("id", id).select("*").single();

    if (updateError) {
      return apiError(requestId, { code: "SHIPMENT_UPDATE_FAILED", message: updateError.message }, 400);
    }

    writeAuditLog({
      requestId,
      action: "shipments.update",
      userId: context.userId,
      role: context.role,
      organizationId: context.organizationId,
    });

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
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to delete shipments." }, 403);
    }

    const { error: deleteError } = await context.supabase.from("shipments").delete().eq("id", id);

    if (deleteError) {
      return apiError(requestId, { code: "SHIPMENT_DELETE_FAILED", message: deleteError.message }, 400);
    }

    writeAuditLog({
      requestId,
      action: "shipments.delete",
      userId: context.userId,
      role: context.role,
      organizationId: context.organizationId,
    });

    return apiSuccess(requestId, { id, deleted: true });
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}
