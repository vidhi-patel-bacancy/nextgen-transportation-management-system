import { z } from "zod";

import { getAuthContext } from "@/lib/auth/request-context";
import { hasRole } from "@/lib/auth/permissions";
import { apiError, apiSuccess, getRequestId, normalizeRouteError, writeAuditLog } from "@/lib/api/route-utils";

const createCarrierSchema = z.object({
  company_name: z.string().min(2),
  contact_email: z.string().email(),
  phone: z.string().min(7),
  transport_type: z.string().min(2),
});

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { context, error } = await getAuthContext();
    if (error || !context) {
      return apiError(requestId, { code: error?.code ?? "UNAUTHORIZED", message: error?.message ?? "Unauthorized." }, error?.status ?? 401);
    }

    if (!hasRole(context.role, ["admin", "manager", "carrier"])) {
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to view carriers." }, 403);
    }

    const { data, error: queryError } = await context.supabase
      .from("carriers")
      .select("*")
      .order("company_name", { ascending: true });

    if (queryError) {
      return apiError(requestId, { code: "CARRIERS_FETCH_FAILED", message: queryError.message }, 400);
    }

    writeAuditLog({
      requestId,
      action: "carriers.list",
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
      return apiError(requestId, { code: "FORBIDDEN", message: "You are not allowed to create carriers." }, 403);
    }

    const parsed = createCarrierSchema.parse(await request.json());

    const { data, error: insertError } = await context.supabase
      .from("carriers")
      .insert({
        ...parsed,
        organization_id: context.organizationId,
      })
      .select("*")
      .single();

    if (insertError) {
      return apiError(requestId, { code: "CARRIER_CREATE_FAILED", message: insertError.message }, 400);
    }

    writeAuditLog({
      requestId,
      action: "carriers.create",
      userId: context.userId,
      role: context.role,
      organizationId: context.organizationId,
    });

    return apiSuccess(requestId, data, 201);
  } catch (error) {
    return apiError(requestId, normalizeRouteError(error), 500);
  }
}
