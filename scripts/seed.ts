import { config } from "dotenv";

import { randomUUID } from "crypto";
import { addDays, subDays } from "date-fns";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

type Role = "admin" | "manager" | "carrier" | "customer";
type OrderStatus = "pending" | "confirmed" | "cancelled";
type ShipmentStatus = "created" | "assigned" | "in_transit" | "delivered" | "exception";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or anon key).");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const pick = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];
const roles: Role[] = ["admin", "manager", "carrier", "customer"];
const orderStatuses: OrderStatus[] = ["pending", "confirmed", "cancelled"];
const shipmentStatuses: ShipmentStatus[] = ["created", "assigned", "in_transit", "delivered", "exception"];
const cities = ["New York", "Chicago", "Dallas", "Atlanta", "Los Angeles", "Seattle", "Denver", "Houston", "Phoenix", "Miami"];
const products = ["Electronics", "Medical Supplies", "Furniture", "Food", "Industrial Parts", "Automotive Components"];
const transportModes = ["road", "air", "sea", "rail"];

async function main() {
  const orgId = randomUUID();
  const organization = {
    id: orgId,
    name: "Seed Logistics Inc",
  };

  await supabase.from("organizations").upsert(organization);

  const users = Array.from({ length: 12 }).map((_, index) => ({
    id: randomUUID(),
    email: `seed-user-${index + 1}@tms.local`,
    role: pick(roles),
    organization_id: orgId,
  }));

  await supabase.from("users").insert(users);

  const carriers = Array.from({ length: 10 }).map((_, index) => ({
    id: randomUUID(),
    organization_id: orgId,
    company_name: `Carrier ${index + 1}`,
    contact_email: `carrier${index + 1}@logistics.local`,
    phone: `+1-555-01${String(index).padStart(2, "0")}`,
    transport_type: pick(transportModes),
  }));

  const { data: carrierRows, error: carrierError } = await supabase.from("carriers").insert(carriers).select("*");
  if (carrierError) throw carrierError;

  const orders = Array.from({ length: 50 }).map((_, index) => ({
    id: randomUUID(),
    organization_id: orgId,
    customer_id: pick(users).id,
    origin: pick(cities),
    destination: pick(cities),
    product: pick(products),
    weight: Number((Math.random() * 2000 + 100).toFixed(2)),
    status: pick(orderStatuses),
    delivery_date: addDays(new Date(), Math.floor(Math.random() * 20) + 1).toISOString(),
    created_at: subDays(new Date(), Math.floor(Math.random() * 90)).toISOString(),
  }));

  const { data: orderRows, error: ordersError } = await supabase.from("orders").insert(orders).select("*");
  if (ordersError) throw ordersError;

  const shipments = Array.from({ length: 50 }).map((_, index) => ({
    id: randomUUID(),
    organization_id: orgId,
    order_id: orderRows?.[index]?.id ?? pick(orders).id,
    carrier_id: pick(carrierRows ?? carriers).id,
    tracking_number: `TRK-${Date.now()}-${index + 1}`,
    status: pick(shipmentStatuses),
    estimated_delivery: addDays(new Date(), Math.floor(Math.random() * 15) + 2).toISOString(),
    created_at: subDays(new Date(), Math.floor(Math.random() * 45)).toISOString(),
  }));

  const { data: shipmentRows, error: shipmentsError } = await supabase.from("shipments").insert(shipments).select("*");
  if (shipmentsError) throw shipmentsError;

  const trackingEvents = (shipmentRows ?? []).flatMap((shipment) => [
    {
      organization_id: orgId,
      shipment_id: shipment.id,
      status: "pickup",
      location: pick(cities),
      timestamp: subDays(new Date(), Math.floor(Math.random() * 10)).toISOString(),
      notes: "Pickup completed.",
    },
    {
      organization_id: orgId,
      shipment_id: shipment.id,
      status: pick(["in_transit", "delay", "delivered"] as const),
      location: pick(cities),
      timestamp: new Date().toISOString(),
      notes: "Automated seed event.",
    },
  ]);

  await supabase.from("tracking_events").insert(trackingEvents);

  const rates = Array.from({ length: 20 }).map((_, index) => ({
    organization_id: orgId,
    carrier_id: pick(carrierRows ?? carriers).id,
    mode: pick(["ltl", "ftl", "parcel", "rail", "ocean", "air"] as const),
    origin_region: pick(cities),
    destination_region: pick(cities),
    min_weight: Number((Math.random() * 200).toFixed(2)),
    max_weight: Number((Math.random() * 3000 + 300).toFixed(2)),
    base_amount: Number((Math.random() * 1500 + 100).toFixed(2)),
    fuel_surcharge_pct: Number((Math.random() * 20).toFixed(2)),
    currency: "USD",
    effective_from: new Date().toISOString().slice(0, 10),
    effective_to: null,
    is_active: true,
  }));
  await supabase.from("rates").insert(rates);

  const routePlans = (shipmentRows ?? []).map((shipment) => ({
    organization_id: orgId,
    shipment_id: shipment.id,
    origin: pick(cities),
    destination: pick(cities),
    mode: pick(["ltl", "ftl", "parcel", "rail", "ocean", "air"] as const),
    distance_km: Number((Math.random() * 1500 + 50).toFixed(2)),
    estimated_duration_hours: Number((Math.random() * 30 + 2).toFixed(2)),
    optimization_score: Number((Math.random() * 100).toFixed(2)),
    status: pick(["draft", "optimized", "approved", "dispatched"] as const),
    planned_departure: addDays(new Date(), 1).toISOString(),
    planned_arrival: addDays(new Date(), 2).toISOString(),
  }));

  const { data: routePlanRows } = await supabase.from("route_plans").insert(routePlans).select("*");

  const loadPlans = (shipmentRows ?? []).map((shipment, index) => ({
    organization_id: orgId,
    route_plan_id: routePlanRows?.[index]?.id ?? null,
    shipment_id: shipment.id,
    load_reference: `LP-SEED-${Date.now()}-${index + 1}`,
    capacity_weight: Number((Math.random() * 5000 + 1000).toFixed(2)),
    utilized_weight: Number((Math.random() * 1000 + 100).toFixed(2)),
    status: pick(["draft", "optimized", "finalized"] as const),
  }));
  await supabase.from("load_plans").insert(loadPlans);

  const invoices = (shipmentRows ?? []).map((shipment, index) => ({
    organization_id: orgId,
    shipment_id: shipment.id,
    carrier_id: shipment.carrier_id,
    invoice_number: `INV-SEED-${Date.now()}-${index + 1}`,
    billed_amount: Number((Math.random() * 4000 + 500).toFixed(2)),
    audited_amount: Number((Math.random() * 3500 + 450).toFixed(2)),
    currency: "USD",
    status: pick(["received", "auditing", "approved", "paid"] as const),
    due_date: addDays(new Date(), 10).toISOString().slice(0, 10),
    received_at: new Date().toISOString(),
  }));

  const { data: invoiceRows } = await supabase.from("invoices").insert(invoices).select("*");

  const audits = (invoiceRows ?? []).map((invoice) => ({
    organization_id: orgId,
    invoice_id: invoice.id,
    auditor_user_id: pick(users).id,
    status: pick(["pending", "in_review", "approved"] as const),
    discrepancy_amount: Number((Math.random() * 80).toFixed(2)),
    notes: "Automated seed freight audit.",
    audited_at: new Date().toISOString(),
  }));
  await supabase.from("freight_audits").insert(audits);

  const payments = (invoiceRows ?? []).slice(0, Math.max(1, Math.floor((invoiceRows?.length ?? 0) / 2))).map((invoice) => ({
    organization_id: orgId,
    invoice_id: invoice.id,
    paid_amount: invoice.audited_amount ?? invoice.billed_amount,
    currency: "USD",
    payment_method: pick(["ach", "wire", "card", "other"] as const),
    payment_reference: `PAY-SEED-${Date.now()}-${invoice.id.slice(0, 6)}`,
    paid_at: new Date().toISOString(),
  }));
  await supabase.from("payments").insert(payments);

  console.log("Seed completed.");
  console.log(`Carriers inserted: ${carriers.length}`);
  console.log(`Orders inserted: ${orders.length}`);
  console.log(`Shipments inserted: ${shipments.length}`);
}

void main();
