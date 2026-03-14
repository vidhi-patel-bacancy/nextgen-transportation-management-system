import type { TransportMode } from "@/types";

interface RouteOptimizationInput {
  mode: TransportMode;
  distanceKm: number | null | undefined;
  durationHours: number | null | undefined;
  stopCount?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function calculateRouteOptimizationScore(input: RouteOptimizationInput): number {
  const distanceKm = Math.max(0, input.distanceKm ?? 0);
  const durationHours = Math.max(0.1, input.durationHours ?? 0.1);
  const stopCount = Math.max(0, input.stopCount ?? 0);

  const modeSpeedTarget: Record<TransportMode, number> = {
    ltl: 55,
    ftl: 65,
    parcel: 50,
    rail: 40,
    ocean: 30,
    air: 700,
  };

  const modeBaseline: Record<TransportMode, number> = {
    ltl: 68,
    ftl: 74,
    parcel: 66,
    rail: 70,
    ocean: 64,
    air: 84,
  };

  const distanceScore = clamp(1 - distanceKm / 3500, 0, 1);
  const durationScore = clamp(1 - durationHours / 96, 0, 1);

  const actualSpeed = distanceKm / durationHours;
  const targetSpeed = modeSpeedTarget[input.mode];
  const speedScore = clamp(1 - Math.abs(actualSpeed - targetSpeed) / Math.max(targetSpeed, 1), 0, 1);

  const stopPenalty = clamp(stopCount * 0.03, 0, 0.2);
  const baselineScore = modeBaseline[input.mode] / 100;

  const rawScore =
    distanceScore * 0.3 + durationScore * 0.25 + speedScore * 0.3 + baselineScore * 0.15 - stopPenalty;

  return Number((clamp(rawScore, 0, 1) * 100).toFixed(2));
}
