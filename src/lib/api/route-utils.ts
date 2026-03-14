import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { ZodError } from "zod";

export interface ApiError {
  code: string;
  message: string;
}

export function getRequestId(request: Request): string {
  return request.headers.get("x-request-id") ?? randomUUID();
}

export function apiSuccess<T>(requestId: string, data: T, status = 200) {
  return NextResponse.json(
    { data, requestId },
    {
      status,
      headers: { "x-request-id": requestId },
    },
  );
}

export function apiError(requestId: string, error: ApiError, status: number) {
  return NextResponse.json(
    { error, requestId },
    {
      status,
      headers: { "x-request-id": requestId },
    },
  );
}

export function normalizeRouteError(error: unknown): ApiError {
  if (error instanceof ZodError) {
    return {
      code: "VALIDATION_ERROR",
      message: error.issues.map((issue) => issue.message).join("; ") || "Request validation failed.",
    };
  }

  if (error instanceof Error) {
    return {
      code: "INTERNAL_ERROR",
      message: error.message || "Unexpected error.",
    };
  }

  return {
    code: "INTERNAL_ERROR",
    message: "Unexpected error.",
  };
}

export function writeAuditLog(payload: {
  requestId: string;
  action: string;
  userId: string;
  role: string;
  organizationId: string;
}) {
  console.info(
    JSON.stringify({
      event: "api_audit",
      timestamp: new Date().toISOString(),
      ...payload,
    }),
  );
}
