export type UserRole = "admin" | "manager" | "carrier" | "customer";

export type OrderStatus = "pending" | "confirmed" | "cancelled";

export type ShipmentStatus = "created" | "assigned" | "in_transit" | "delivered" | "exception";

export type TrackingEventStatus = "pickup" | "in_transit" | "delay" | "delivered";

export type DocumentType = "bill_of_lading" | "invoice" | "proof_of_delivery";
export type TransportMode = "ltl" | "ftl" | "parcel" | "rail" | "ocean" | "air";
export type InvoiceStatus = "received" | "auditing" | "approved" | "rejected" | "paid";
export type FreightAuditStatus = "pending" | "in_review" | "approved" | "rejected";
export type RoutePlanStatus = "draft" | "optimized" | "approved" | "dispatched" | "archived";
export type LoadPlanStatus = "draft" | "optimized" | "finalized";

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  organization_id: string;
  email_verified_at: string | null;
  signup_otp_hash: string | null;
  signup_otp_expires_at: string | null;
  signup_otp_sent_at: string | null;
  password_reset_token_hash: string | null;
  password_reset_expires_at: string | null;
  password_reset_sent_at: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  organization_id: string;
  customer_id: string;
  origin: string;
  destination: string;
  product: string;
  weight: number;
  status: OrderStatus;
  delivery_date: string | null;
  created_at: string;
}

export interface Carrier {
  id: string;
  organization_id: string;
  company_name: string;
  contact_email: string;
  phone: string;
  transport_type: string;
}

export interface Shipment {
  id: string;
  organization_id: string;
  order_id: string;
  carrier_id: string;
  tracking_number: string;
  status: ShipmentStatus;
  estimated_delivery: string | null;
  created_at: string;
}

export interface TrackingEvent {
  id: string;
  organization_id: string;
  shipment_id: string;
  status: TrackingEventStatus;
  location: string;
  timestamp: string;
  notes: string | null;
}

export interface ShipmentDocument {
  id: string;
  organization_id: string;
  shipment_id: string;
  document_type: DocumentType;
  file_url: string;
  uploaded_at: string;
}

export interface Rate {
  id: string;
  organization_id: string;
  carrier_id: string | null;
  mode: TransportMode;
  origin_region: string;
  destination_region: string;
  min_weight: number;
  max_weight: number;
  base_amount: number;
  fuel_surcharge_pct: number;
  currency: string;
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Invoice {
  id: string;
  organization_id: string;
  shipment_id: string | null;
  carrier_id: string | null;
  invoice_number: string;
  billed_amount: number;
  audited_amount: number | null;
  currency: string;
  status: InvoiceStatus;
  due_date: string | null;
  received_at: string;
  created_at: string;
}

export interface FreightAudit {
  id: string;
  organization_id: string;
  invoice_id: string;
  auditor_user_id: string | null;
  status: FreightAuditStatus;
  discrepancy_amount: number;
  expected_amount: number | null;
  tolerance_amount: number | null;
  match_confidence: number;
  matched_rate_id: string | null;
  rule_breakdown: AuditRuleBreakdown[];
  notes: string | null;
  audited_at: string | null;
  created_at: string;
}

export interface AuditRuleBreakdown {
  rule_id: string;
  label: string;
  weight: number;
  score: number;
  passed: boolean;
  details: string;
}

export interface Payment {
  id: string;
  organization_id: string;
  invoice_id: string;
  paid_amount: number;
  currency: string;
  payment_method: "ach" | "wire" | "card" | "other";
  payment_reference: string | null;
  paid_at: string;
  created_at: string;
}

export interface RoutePlan {
  id: string;
  organization_id: string;
  shipment_id: string | null;
  origin: string;
  destination: string;
  mode: TransportMode;
  distance_km: number | null;
  estimated_duration_hours: number | null;
  optimization_score: number | null;
  status: RoutePlanStatus;
  planned_departure: string | null;
  planned_arrival: string | null;
  created_at: string;
}

export interface RouteStop {
  id: string;
  organization_id: string;
  route_plan_id: string;
  stop_sequence: number;
  stop_type: "pickup" | "dropoff" | "waypoint";
  location: string;
  eta: string | null;
  etd: string | null;
  notes: string | null;
  created_at: string;
}

export interface LoadPlan {
  id: string;
  organization_id: string;
  route_plan_id: string | null;
  shipment_id: string | null;
  load_reference: string;
  capacity_weight: number;
  utilized_weight: number;
  status: LoadPlanStatus;
  created_at: string;
}

export interface DashboardMetrics {
  totalShipments: number;
  activeShipments: number;
  delayedShipments: number;
  monthlyShipments: number;
}

export interface CarrierPerformanceMetric {
  carrierName: string;
  total: number;
  delivered: number;
  onTimeRate: number;
}

export interface MonthlyShipmentMetric {
  month: string;
  count: number;
}
