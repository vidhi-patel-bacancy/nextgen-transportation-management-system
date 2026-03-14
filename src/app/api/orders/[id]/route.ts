import { z } from "zod";

import { getAuthContext } from "@/lib/auth/request-context";
import { hasRole } from "@/lib/auth/permissions";
import { apiError, apiSuccess, getRequestId, normalizeRouteError, writeAuditLog } from "@/lib/api/route-utils";

const paramsSchema = z.object({ id: z.string().uuid() });

const updateOrderSchema = z
  .object({
    customer_id: z.string().uuid().optional(),
    origin: z.string().min(2).optional(),
    destination: z.string().min(2).optional(),
    product: z.string().min(2).optional(),
    weight: z.coerce.number().positive().optional(),
    status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
    delivery_date: z.string().nullable().optional(),
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

    if (!hasRole(context.role, ["admin", "manager", "customer"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to view order details." }, 403);
    }

    const { data, error: queryError } = await context.supabase.from("orders").select("*").eq("id", id).single();
    if (queryError) {
      return apiError(requestId, { code: "ORDER_FETCH_FAILED", message: queryError.message }, 404);
    }

    writeAuditLog({
      requestId,
      action: "orders.read",
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

    if (!hasRole(context.role, ["admin", "manager", "customer"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to update orders." }, 403);
    }

    const parsed = updateOrderSchema.parse(await request.json());

    const payload: {
      customer_id?: string;
      origin?: string;
      destination?: string;
      product?: string;
      weight?: number;
      status?: "pending" | "confirmed" | "cancelled";
      delivery_date?: string | null;
      organization_id: string;
    } = {
      organization_id: context.organizationId,
    };

    if (parsed.customer_id && context.role !== "customer") payload.customer_id = parsed.customer_id;
    if (parsed.origin !== undefined) payload.origin = parsed.origin;
    if (parsed.destination !== undefined) payload.destination = parsed.destination;
    if (parsed.product !== undefined) payload.product = parsed.product;
    if (parsed.weight !== undefined) payload.weight = parsed.weight;
    if (parsed.status !== undefined) payload.status = parsed.status;
    if (parsed.delivery_date !== undefined) {
      payload.delivery_date = parsed.delivery_date ? new Date(parsed.delivery_date).toISOString() : null;
    }

    const { data, error: updateError } = await context.supabase.from("orders").update(payload).eq("id", id).select("*").single();

    if (updateError) {
      return apiError(requestId, { code: "ORDER_UPDATE_FAILED", message: updateError.message }, 400);
    }

    writeAuditLog({
      requestId,
      action: "orders.update",
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
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to delete orders." }, 403);
    }

    const { error: deleteError } = await context.supabase.from("orders").delete().eq("id", id);

    if (deleteError) {
      return apiError(requestId, { code: "ORDER_DELETE_FAILED", message: deleteError.message }, 400);
    }

    writeAuditLog({
      requestId,
      action: "orders.delete",
      userId: context.userId,
      role: context.role,
      organizationId: context.organizationId,
    });

    return apiSuccess(requestId, { id, deleted: true });
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}
