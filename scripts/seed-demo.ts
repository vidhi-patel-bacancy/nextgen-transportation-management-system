import { config } from "dotenv";

import { addDays, subDays } from "date-fns";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "../src/types/supabase";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const demoPassword = process.env.DEMO_USER_PASSWORD || "Demo@12345";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const organizationId = "11111111-1111-4111-8111-111111111111";

const demoUsers = [
  { email: "demo.admin@cloudtms.local", role: "admin" },
  { email: "demo.manager@cloudtms.local", role: "manager" },
  { email: "demo.carrier@cloudtms.local", role: "carrier" },
  { email: "demo.customer@cloudtms.local", role: "customer" },
] as const;

const cityPairs = [
  ["New York", "Chicago"],
  ["Dallas", "Atlanta"],
  ["Los Angeles", "Phoenix"],
  ["Seattle", "Denver"],
  ["Houston", "Miami"],
  ["San Jose", "Austin"],
  ["Boston", "Nashville"],
  ["San Diego", "Charlotte"],
  ["Portland", "Detroit"],
  ["Columbus", "Orlando"],
];

function makeId(scope: number, index: number): string {
  const group4 = `8${String(scope).padStart(3, "0").slice(0, 3)}`;
  const group5 = String(index).padStart(12, "0");
  return `00000000-0000-4000-${group4}-${group5}`;
}

async function ensureAuthUser(email: string) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;

  const existing = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  if (existing) {
    await supabase.auth.admin.updateUserById(existing.id, {
      password: demoPassword,
      email_confirm: true,
    });
    return existing.id;
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: demoPassword,
    email_confirm: true,
  });
  if (createError || !created.user) throw createError || new Error(`Unable to create ${email}`);

  return created.user.id;
}

async function main() {
  const { error: orgError } = await supabase.from("organizations").upsert(
    {
      id: organizationId,
      name: "Cloud TMS Demo Org",
    },
    { onConflict: "id" },
  );
  if (orgError) throw orgError;

  const userIds = new Map<string, string>();
  for (const user of demoUsers) {
    const authUserId = await ensureAuthUser(user.email);
    userIds.set(user.email, authUserId);

    const { error: profileError } = await supabase.from("users").upsert(
      {
        id: authUserId,
        email: user.email,
        role: user.role,
        organization_id: organizationId,
      },
      { onConflict: "id" },
    );
    if (profileError) throw profileError;
  }

  const carriers = Array.from({ length: 10 }).map((_, index) => ({
    id: makeId(101, index + 1),
    organization_id: organizationId,
    company_name: `Demo Carrier ${index + 1}`,
    contact_email: `carrier${index + 1}@demo-logistics.local`,
    phone: `+1-555-11${String(index + 1).padStart(2, "0")}`,
    transport_type: ["road", "air", "sea", "rail"][index % 4],
  }));

  const { error: carriersError } = await supabase.from("carriers").upsert(carriers, { onConflict: "id" });
  if (carriersError) throw carriersError;

  const customerId = userIds.get("demo.customer@cloudtms.local");
  if (!customerId) {
    throw new Error("Customer demo user not available.");
  }

  const orders = Array.from({ length: 10 }).map((_, index) => ({
    id: makeId(201, index + 1),
    organization_id: organizationId,
    customer_id: customerId,
    origin: cityPairs[index][0],
    destination: cityPairs[index][1],
    product: ["Electronics", "Medical Supplies", "Textiles", "Automotive Parts", "Food"][index % 5],
    weight: Number((450 + index * 37.5).toFixed(2)),
    status: ["pending", "confirmed", "confirmed", "pending", "cancelled"][index % 5] as
      | "pending"
      | "confirmed"
      | "cancelled",
    delivery_date: addDays(new Date(), index + 2).toISOString(),
    created_at: subDays(new Date(), index + 1).toISOString(),
  }));

  const { error: ordersError } = await supabase.from("orders").upsert(orders, { onConflict: "id" });
  if (ordersError) throw ordersError;

  const shipments = orders.map((order, index) => ({
    id: makeId(301, index + 1),
    organization_id: organizationId,
    order_id: order.id,
    carrier_id: carriers[index % carriers.length].id,
    tracking_number: `DEMO-TRK-${String(index + 1).padStart(4, "0")}`,
    status: ["created", "assigned", "in_transit", "delivered", "exception"][index % 5] as
      | "created"
      | "assigned"
      | "in_transit"
      | "delivered"
      | "exception",
    estimated_delivery: addDays(new Date(), index + 4).toISOString(),
    created_at: subDays(new Date(), index).toISOString(),
  }));

  const { error: shipmentsError } = await supabase.from("shipments").upsert(shipments, { onConflict: "id" });
  if (shipmentsError) throw shipmentsError;

  const trackingEvents = shipments.flatMap((shipment, index) => [
    {
      id: makeId(401, index * 2 + 1),
      organization_id: organizationId,
      shipment_id: shipment.id,
      status: "pickup" as const,
      location: cityPairs[index][0],
      timestamp: subDays(new Date(), index).toISOString(),
      notes: "Shipment picked up from origin facility.",
    },
    {
      id: makeId(401, index * 2 + 2),
      organization_id: organizationId,
      shipment_id: shipment.id,
      status: (["in_transit", "delay", "delivered"][index % 3] as "in_transit" | "delay" | "delivered"),
      location: cityPairs[index][1],
      timestamp: addDays(new Date(), 1).toISOString(),
      notes: "Latest system tracking update.",
    },
  ]);

  const { error: trackingError } = await supabase.from("tracking_events").upsert(trackingEvents, { onConflict: "id" });
  if (trackingError) throw trackingError;

  const documents = shipments.map((shipment, index) => ({
    id: makeId(501, index + 1),
    organization_id: organizationId,
    shipment_id: shipment.id,
    document_type: (["bill_of_lading", "invoice", "proof_of_delivery"][index % 3] as
      | "bill_of_lading"
      | "invoice"
      | "proof_of_delivery"),
    file_url: `https://example-bucket.s3.amazonaws.com/demo/${shipment.tracking_number}.pdf`,
    uploaded_at: subDays(new Date(), index).toISOString(),
  }));

  const { error: documentsError } = await supabase.from("documents").upsert(documents, { onConflict: "id" });
  if (documentsError) throw documentsError;

  const rates = Array.from({ length: 8 }).map((_, index) => ({
    id: makeId(601, index + 1),
    organization_id: organizationId,
    carrier_id: carriers[index % carriers.length].id,
    mode: (["ltl", "ftl", "parcel", "rail", "ocean", "air"][index % 6] as "ltl" | "ftl" | "parcel" | "rail" | "ocean" | "air"),
    origin_region: cityPairs[index % cityPairs.length][0],
    destination_region: cityPairs[index % cityPairs.length][1],
    min_weight: Number((index * 100).toFixed(2)),
    max_weight: Number((index * 100 + 1000).toFixed(2)),
    base_amount: Number((250 + index * 50).toFixed(2)),
    fuel_surcharge_pct: Number((5 + index * 0.5).toFixed(2)),
    currency: "USD",
    effective_from: new Date().toISOString().slice(0, 10),
    effective_to: null,
    is_active: true,
  }));
  const { error: ratesError } = await supabase.from("rates").upsert(rates, { onConflict: "id" });
  if (ratesError) throw ratesError;

  const routePlans = shipments.map((shipment, index) => ({
    id: makeId(701, index + 1),
    organization_id: organizationId,
    shipment_id: shipment.id,
    origin: cityPairs[index][0],
    destination: cityPairs[index][1],
    mode: (["ltl", "ftl", "parcel", "rail", "ocean", "air"][index % 6] as "ltl" | "ftl" | "parcel" | "rail" | "ocean" | "air"),
    distance_km: Number((350 + index * 25).toFixed(2)),
    estimated_duration_hours: Number((7 + index * 0.75).toFixed(2)),
    optimization_score: Number((78 + index).toFixed(2)),
    status: (["draft", "optimized", "approved", "dispatched"][index % 4] as "draft" | "optimized" | "approved" | "dispatched"),
    planned_departure: addDays(new Date(), 1).toISOString(),
    planned_arrival: addDays(new Date(), 2).toISOString(),
  }));
  const { error: routePlansError } = await supabase.from("route_plans").upsert(routePlans, { onConflict: "id" });
  if (routePlansError) throw routePlansError;

  const loadPlans = shipments.map((shipment, index) => ({
    id: makeId(801, index + 1),
    organization_id: organizationId,
    route_plan_id: routePlans[index]?.id ?? null,
    shipment_id: shipment.id,
    load_reference: `LP-DEMO-${String(index + 1).padStart(4, "0")}`,
    capacity_weight: 2000,
    utilized_weight: Number((500 + index * 50).toFixed(2)),
    status: (["draft", "optimized", "finalized"][index % 3] as "draft" | "optimized" | "finalized"),
  }));
  const { error: loadPlansError } = await supabase.from("load_plans").upsert(loadPlans, { onConflict: "id" });
  if (loadPlansError) throw loadPlansError;

  const invoices = shipments.map((shipment, index) => ({
    id: makeId(901, index + 1),
    organization_id: organizationId,
    shipment_id: shipment.id,
    carrier_id: shipment.carrier_id,
    invoice_number: `INV-DEMO-${String(index + 1).padStart(4, "0")}`,
    billed_amount: Number((700 + index * 65).toFixed(2)),
    audited_amount: Number((680 + index * 60).toFixed(2)),
    currency: "USD",
    status: (["received", "auditing", "approved", "paid"][index % 4] as "received" | "auditing" | "approved" | "paid"),
    due_date: addDays(new Date(), 14).toISOString().slice(0, 10),
    received_at: subDays(new Date(), index).toISOString(),
  }));
  const { error: invoicesError } = await supabase.from("invoices").upsert(invoices, { onConflict: "id" });
  if (invoicesError) throw invoicesError;

  const audits = invoices.map((invoice, index) => ({
    id: makeId(1001, index + 1),
    organization_id: organizationId,
    invoice_id: invoice.id,
    auditor_user_id: userIds.get("demo.manager@cloudtms.local") ?? null,
    status: (["pending", "in_review", "approved"][index % 3] as "pending" | "in_review" | "approved"),
    discrepancy_amount: Number((index % 2 === 0 ? 0 : 12.5).toFixed(2)),
    notes: "Automated demo freight audit record.",
    audited_at: addDays(new Date(), 1).toISOString(),
  }));
  const { error: auditsError } = await supabase.from("freight_audits").upsert(audits, { onConflict: "id" });
  if (auditsError) throw auditsError;

  const payments = invoices.slice(0, 6).map((invoice, index) => ({
    id: makeId(1101, index + 1),
    organization_id: organizationId,
    invoice_id: invoice.id,
    paid_amount: invoice.audited_amount ?? invoice.billed_amount,
    currency: "USD",
    payment_method: (["ach", "wire", "card"][index % 3] as "ach" | "wire" | "card"),
    payment_reference: `PAY-DEMO-${String(index + 1).padStart(4, "0")}`,
    paid_at: addDays(new Date(), 3).toISOString(),
  }));
  const { error: paymentsError } = await supabase.from("payments").upsert(payments, { onConflict: "id" });
  if (paymentsError) throw paymentsError;

  console.log("Demo data ready.");
  console.log(`Login email: demo.manager@cloudtms.local`);
  console.log(`Login password: ${demoPassword}`);
}

void main();
