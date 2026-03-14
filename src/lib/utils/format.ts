import { format } from "date-fns";

export function formatDate(value?: string | null, fallback = "-"): string {
  if (!value) {
    return fallback;
  }

  try {
    return format(new Date(value), "dd MMM yyyy");
  } catch {
    return fallback;
  }
}

export function toIsoOrNull(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}
