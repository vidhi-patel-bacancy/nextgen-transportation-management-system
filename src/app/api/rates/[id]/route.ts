import { z } from "zod";

import { getAuthContext } from "@/lib/auth/request-context";
import { hasRole } from "@/lib/auth/permissions";
import { apiError, apiSuccess, getRequestId, normalizeRouteError, writeAuditLog } from "@/lib/api/route-utils";

const paramsSchema = z.object({ id: z.string().uuid() });
const updateSchema = z
  .object({
    carrier_id: z.string().uuid().nullable().optional(),
    mode: z.enum(["ltl", "ftl", "parcel", "rail", "ocean", "air"]).optional(),
    origin_region: z.string().min(2).optional(),
    destination_region: z.string().min(2).optional(),
    min_weight: z.coerce.number().nonnegative().optional(),
    max_weight: z.coerce.number().positive().optional(),
    base_amount: z.coerce.number().positive().optional(),
    fuel_surcharge_pct: z.coerce.number().nonnegative().optional(),
    currency: z.string().min(3).max(3).optional(),
    effective_from: z.string().optional(),
    effective_to: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
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
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to view rates." }, 403);
    }

    const { data, error: queryError } = await context.supabase.from("rates").select("*").eq("id", id).single();
    if (queryError) {
      return apiError(requestId, { code: "RATE_FETCH_FAILED", message: queryError.message }, 404);
    }

    writeAuditLog({ requestId, action: "rates.read", userId: context.userId, role: context.role, organizationId: context.organizationId });
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

    if (!hasRole(context.role, ["admin", "manager"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to update rates." }, 403);
    }

    const parsed = updateSchema.parse(await request.json());
    const { data, error: updateError } = await context.supabase
      .from("rates")
      .update({ ...parsed, organization_id: context.organizationId })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      return apiError(requestId, { code: "RATE_UPDATE_FAILED", message: updateError.message }, 400);
    }

    writeAuditLog({ requestId, action: "rates.update", userId: context.userId, role: context.role, organizationId: context.organizationId });
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
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to delete rates." }, 403);
    }

    const { error: deleteError } = await context.supabase.from("rates").delete().eq("id", id);
    if (deleteError) {
      return apiError(requestId, { code: "RATE_DELETE_FAILED", message: deleteError.message }, 400);
    }

    writeAuditLog({ requestId, action: "rates.delete", userId: context.userId, role: context.role, organizationId: context.organizationId });
    return apiSuccess(requestId, { id, deleted: true });
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}
