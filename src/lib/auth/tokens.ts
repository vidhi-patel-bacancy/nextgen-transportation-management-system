import { createHash, randomBytes, randomInt } from "crypto";

export function hashSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function generateNumericOtp(length = 6) {
  return Array.from({ length }, () => randomInt(0, 10).toString()).join("");
}

export function generateSecureToken(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export function minutesFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}
