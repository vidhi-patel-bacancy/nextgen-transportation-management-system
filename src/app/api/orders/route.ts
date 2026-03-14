import { z } from "zod";

import { getAuthContext } from "@/lib/auth/request-context";
import { hasRole, ORDER_CREATORS } from "@/lib/auth/permissions";
import { apiError, apiSuccess, getRequestId, normalizeRouteError, writeAuditLog } from "@/lib/api/route-utils";

const createOrderSchema = z.object({
  customer_id: z.string().uuid().optional(),
  origin: z.string().min(2),
  destination: z.string().min(2),
  product: z.string().min(2),
  weight: z.coerce.number().positive(),
  status: z.enum(["pending", "confirmed", "cancelled"]).default("pending"),
  delivery_date: z.string().nullable().optional(),
});

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { context, error } = await getAuthContext();
    if (error || !context) {
      return apiError(requestId, { code: error?.code ?? "UNAUTHORIZED", message: error?.message ?? "Unauthorized." }, error?.status ?? 401);
    }

    if (!hasRole(context.role, ["admin", "manager", "customer"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to view orders." }, 403);
    }

    const { data, error: queryError } = await context.supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      return apiError(requestId, { code: "ORDERS_FETCH_FAILED", message: queryError.message }, 400);
    }

    writeAuditLog({
      requestId,
      action: "orders.list",
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

    if (!hasRole(context.role, ORDER_CREATORS)) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to create orders." }, 403);
    }

    const parsed = createOrderSchema.parse(await request.json());

    const customerId = context.role === "customer" ? context.userId : parsed.customer_id ?? context.userId;

    const { data, error: insertError } = await context.supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        origin: parsed.origin,
        destination: parsed.destination,
        product: parsed.product,
        weight: parsed.weight,
        status: parsed.status,
        delivery_date: parsed.delivery_date ? new Date(parsed.delivery_date).toISOString() : null,
        organization_id: context.organizationId,
      })
      .select("*")
      .single();

    if (insertError) {
      return apiError(requestId, { code: "ORDER_CREATE_FAILED", message: insertError.message }, 400);
    }

    writeAuditLog({
      requestId,
      action: "orders.create",
      userId: context.userId,
      role: context.role,
      organizationId: context.organizationId,
    });

    return apiSuccess(requestId, data, 201);
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}
