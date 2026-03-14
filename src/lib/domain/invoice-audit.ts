import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";
import type { AuditRuleBreakdown, FreightAuditStatus, TransportMode } from "@/types";

type RateRow = Database["public"]["Tables"]["rates"]["Row"];
type ShipmentRow = Database["public"]["Tables"]["shipments"]["Row"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type TrackingEventRow = Database["public"]["Tables"]["tracking_events"]["Row"];

interface MatchInput {
  supabase: SupabaseClient<Database>;
  organizationId: string;
  shipmentId: string;
  billedAmount: number;
  invoiceDate: string;
}

export interface AuditMatchResult {
  status: FreightAuditStatus;
  discrepancyAmount: number;
  expectedAmount: number | null;
  matchedRateId: string | null;
  toleranceAmount: number | null;
  matchConfidence: number;
  ruleBreakdown: AuditRuleBreakdown[];
  notes: string;
}

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toleranceFor(expectedAmount: number): number {
  return Math.max(25, expectedAmount * 0.03);
}

function computeExpectedAmount(rate: RateRow): number {
  return Number((Number(rate.base_amount) * (1 + Number(rate.fuel_surcharge_pct) / 100)).toFixed(2));
}

function selectBestRate(rates: RateRow[], carrierId: string): RateRow | null {
  if (rates.length === 0) return null;

  const exactCarrier = rates.find((rate) => rate.carrier_id === carrierId);
  if (exactCarrier) return exactCarrier;

  const shared = rates.find((rate) => rate.carrier_id === null);
  return shared ?? rates[0];
}

function confidenceScoreFromRules(rules: AuditRuleBreakdown[]): number {
  const totalWeighted = rules.reduce((sum, rule) => sum + rule.weight * rule.score, 0);
  return Number((clamp(totalWeighted, 0, 1) * 100).toFixed(2));
}

function buildRule(
  ruleId: string,
  label: string,
  weight: number,
  score: number,
  passed: boolean,
  details: string,
): AuditRuleBreakdown {
  return {
    rule_id: ruleId,
    label,
    weight,
    score: Number(clamp(score, 0, 1).toFixed(4)),
    passed,
    details,
  };
}

function evaluateExecutionRule(shipment: ShipmentRow, events: TrackingEventRow[]): AuditRuleBreakdown {
  const hasPickup = events.some((event) => event.status === "pickup");
  const hasInTransit = events.some((event) => event.status === "in_transit");
  const hasDelivered = events.some((event) => event.status === "delivered");
  const delayCount = events.filter((event) => event.status === "delay").length;

  let score = 0;
  if (hasPickup) score += 0.35;
  if (hasInTransit) score += 0.2;
  if (hasDelivered || shipment.status === "delivered") score += 0.35;
  if (delayCount === 0) score += 0.1;

  const passed = score >= 0.65;
  const details = `pickup=${hasPickup}, in_transit=${hasInTransit}, delivered=${hasDelivered}, delays=${delayCount}, shipment_status=${shipment.status}`;

  return buildRule("shipment_execution", "Shipment Execution Evidence", 0.2, score, passed, details);
}

function evaluateRateRule(matchedRate: RateRow | null, mode: TransportMode, origin: string, destination: string): AuditRuleBreakdown {
  if (!matchedRate) {
    return buildRule(
      "contract_rate_match",
      "Contract Rate Match",
      0.45,
      0,
      false,
      `No active rate found for lane ${origin} -> ${destination} and mode ${mode}.`,
    );
  }

  return buildRule(
    "contract_rate_match",
    "Contract Rate Match",
    0.45,
    1,
    true,
    `Matched rate ${matchedRate.id} for lane ${origin} -> ${destination} mode=${mode}.`,
  );
}

function evaluateAmountRule(expectedAmount: number | null, billedAmount: number): {
  rule: AuditRuleBreakdown;
  discrepancyAmount: number;
  toleranceAmount: number | null;
} {
  if (expectedAmount === null) {
    return {
      discrepancyAmount: Number(billedAmount.toFixed(2)),
      toleranceAmount: null,
      rule: buildRule("amount_tolerance", "Amount Tolerance", 0.35, 0, false, "Expected amount unavailable due to missing rate match."),
    };
  }

  const discrepancyAmount = Number(Math.abs(billedAmount - expectedAmount).toFixed(2));
  const toleranceAmount = Number(toleranceFor(expectedAmount).toFixed(2));
  const rawScore = clamp(1 - discrepancyAmount / (toleranceAmount * 2), 0, 1);
  const passed = discrepancyAmount <= toleranceAmount;

  return {
    discrepancyAmount,
    toleranceAmount,
    rule: buildRule(
      "amount_tolerance",
      "Amount Tolerance",
      0.35,
      rawScore,
      passed,
      `expected=${expectedAmount.toFixed(2)}, billed=${billedAmount.toFixed(2)}, tolerance=${toleranceAmount.toFixed(2)}, discrepancy=${discrepancyAmount.toFixed(2)}`,
    ),
  };
}

async function getShipmentOrderModeAndEvents(input: {
  supabase: SupabaseClient<Database>;
  shipmentId: string;
}): Promise<{ shipment: ShipmentRow; order: OrderRow; mode: TransportMode; events: TrackingEventRow[] }> {
  const { data: shipmentData, error: shipmentError } = await input.supabase
    .from("shipments")
    .select("*")
    .eq("id", input.shipmentId)
    .single();
  const shipment = (shipmentData as ShipmentRow | null) ?? null;

  if (shipmentError || !shipment) {
    throw new Error(shipmentError?.message ?? "Shipment not found for audit matching.");
  }

  const { data: orderData, error: orderError } = await input.supabase.from("orders").select("*").eq("id", shipment.order_id).single();
  const order = (orderData as OrderRow | null) ?? null;

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Order not found for shipment audit matching.");
  }

  const { data: routePlanData } = await input.supabase
    .from("route_plans")
    .select("mode")
    .eq("shipment_id", shipment.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: eventsData, error: eventsError } = await input.supabase
    .from("tracking_events")
    .select("*")
    .eq("shipment_id", shipment.id)
    .order("timestamp", { ascending: false });

  if (eventsError) {
    throw new Error(eventsError.message);
  }

  return {
    shipment,
    order,
    mode: ((routePlanData as { mode?: TransportMode } | null)?.mode ?? "ltl") as TransportMode,
    events: ((eventsData as TrackingEventRow[] | null) ?? []) as TrackingEventRow[],
  };
}

async function findMatchingRate(input: {
  supabase: SupabaseClient<Database>;
  organizationId: string;
  carrierId: string;
  mode: TransportMode;
  origin: string;
  destination: string;
  weight: number;
  invoiceDate: string;
}): Promise<RateRow | null> {
  const { data: rateCandidatesData, error } = await input.supabase
    .from("rates")
    .select("*")
    .eq("organization_id", input.organizationId)
    .eq("mode", input.mode)
    .eq("is_active", true)
    .lte("effective_from", input.invoiceDate)
    .or(`effective_to.is.null,effective_to.gte.${input.invoiceDate}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rateCandidates = (rateCandidatesData as RateRow[] | null) ?? [];

  const filtered = rateCandidates.filter((rate) => {
    const originMatch = normalize(rate.origin_region) === normalize(input.origin);
    const destinationMatch = normalize(rate.destination_region) === normalize(input.destination);
    const weightMatch = input.weight >= Number(rate.min_weight) && input.weight <= Number(rate.max_weight);
    return originMatch && destinationMatch && weightMatch;
  });

  return selectBestRate(filtered, input.carrierId);
}

export async function runAutomatedInvoiceAudit(input: MatchInput): Promise<AuditMatchResult> {
  const { shipment, order, mode, events } = await getShipmentOrderModeAndEvents({
    supabase: input.supabase,
    shipmentId: input.shipmentId,
  });

  const matchedRate = await findMatchingRate({
    supabase: input.supabase,
    organizationId: input.organizationId,
    carrierId: shipment.carrier_id,
    mode,
    origin: order.origin,
    destination: order.destination,
    weight: Number(order.weight),
    invoiceDate: input.invoiceDate,
  });

  const expectedAmount = matchedRate ? computeExpectedAmount(matchedRate) : null;

  const rateRule = evaluateRateRule(matchedRate, mode, order.origin, order.destination);
  const amountEvaluation = evaluateAmountRule(expectedAmount, input.billedAmount);
  const executionRule = evaluateExecutionRule(shipment, events);

  const ruleBreakdown = [rateRule, amountEvaluation.rule, executionRule];
  const matchConfidence = confidenceScoreFromRules(ruleBreakdown);

  let status: FreightAuditStatus = "in_review";
  if (matchConfidence >= 85 && amountEvaluation.rule.passed && rateRule.passed) {
    status = "approved";
  } else if (matchConfidence < 50) {
    status = "rejected";
  }

  const notes = ruleBreakdown
    .map((rule) => `${rule.label}: ${rule.passed ? "pass" : "review"} (score=${(rule.score * 100).toFixed(1)}%) - ${rule.details}`)
    .join(" | ");

  return {
    status,
    discrepancyAmount: amountEvaluation.discrepancyAmount,
    expectedAmount,
    matchedRateId: matchedRate?.id ?? null,
    toleranceAmount: amountEvaluation.toleranceAmount,
    matchConfidence,
    ruleBreakdown,
    notes,
  };
}
