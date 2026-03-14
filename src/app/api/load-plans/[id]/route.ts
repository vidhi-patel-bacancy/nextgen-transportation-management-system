import { z } from "zod";

import { getAuthContext } from "@/lib/auth/request-context";
import { hasRole } from "@/lib/auth/permissions";
import { apiError, apiSuccess, getRequestId, normalizeRouteError, writeAuditLog } from "@/lib/api/route-utils";

const paramsSchema = z.object({ id: z.string().uuid() });
const updateSchema = z
  .object({
    route_plan_id: z.string().uuid().nullable().optional(),
    shipment_id: z.string().uuid().nullable().optional(),
    load_reference: z.string().min(4).optional(),
    capacity_weight: z.coerce.number().positive().optional(),
    utilized_weight: z.coerce.number().nonnegative().optional(),
    status: z.enum(["draft", "optimized", "finalized"]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "At least one field is required." });

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const requestId = getRequestId(request);

  try {
    const { id } = paramsSchema.parse(params);
    const { context, error } = await getAuthContext();
    if (error || !context) {
      return apiError(requestId, { code: error?.code ?? "UNAUTHORIZED", message: error?.message ?? "Unauthorized." }, error?.status ?? 401);
    }

    if (!hasRole(context.role, ["admin", "manager", "carrier"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to update load plans." }, 403);
    }

    const parsed = updateSchema.parse(await request.json());
    const { data, error: updateError } = await context.supabase
      .from("load_plans")
      .update({ ...parsed, organization_id: context.organizationId })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      return apiError(requestId, { code: "LOAD_PLAN_UPDATE_FAILED", message: updateError.message }, 400);
    }

    writeAuditLog({ requestId, action: "load_plans.update", userId: context.userId, role: context.role, organizationId: context.organizationId });
    return apiSuccess(requestId, data);
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}
