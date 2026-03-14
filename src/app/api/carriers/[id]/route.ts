import { z } from "zod";

import { getAuthContext } from "@/lib/auth/request-context";
import { hasRole } from "@/lib/auth/permissions";
import { apiError, apiSuccess, getRequestId, normalizeRouteError, writeAuditLog } from "@/lib/api/route-utils";

const paramsSchema = z.object({ id: z.string().uuid() });

const updateCarrierSchema = z
  .object({
    company_name: z.string().min(2).optional(),
    contact_email: z.string().email().optional(),
    phone: z.string().min(7).optional(),
    transport_type: z.string().min(2).optional(),
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
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to view carrier details." }, 403);
    }

    const { data, error: queryError } = await context.supabase.from("carriers").select("*").eq("id", id).single();
    if (queryError) {
      return apiError(requestId, { code: "CARRIER_FETCH_FAILED", message: queryError.message }, 404);
    }

    writeAuditLog({
      requestId,
      action: "carriers.read",
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

    if (!hasRole(context.role, ["admin", "manager"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to update carriers." }, 403);
    }

    const parsed = updateCarrierSchema.parse(await request.json());

    const { data, error: updateError } = await context.supabase
      .from("carriers")
      .update({
        ...parsed,
        organization_id: context.organizationId,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      return apiError(requestId, { code: "CARRIER_UPDATE_FAILED", message: updateError.message }, 400);
    }

    writeAuditLog({
      requestId,
      action: "carriers.update",
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
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to delete carriers." }, 403);
    }

    const { error: deleteError } = await context.supabase.from("carriers").delete().eq("id", id);

    if (deleteError) {
      return apiError(requestId, { code: "CARRIER_DELETE_FAILED", message: deleteError.message }, 400);
    }

    writeAuditLog({
      requestId,
      action: "carriers.delete",
      userId: context.userId,
      role: context.role,
      organizationId: context.organizationId,
    });

    return apiSuccess(requestId, { id, deleted: true });
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}
