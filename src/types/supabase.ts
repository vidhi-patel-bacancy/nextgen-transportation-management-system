import type {
  DocumentType,
  AuditRuleBreakdown,
  FreightAuditStatus,
  InvoiceStatus,
  LoadPlanStatus,
  OrderStatus,
  RoutePlanStatus,
  ShipmentStatus,
  TrackingEventStatus,
  TransportMode,
  UserRole,
} from "./index";

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          organization_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: UserRole;
          organization_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          organization_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
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
        };
        Insert: {
          id?: string;
          organization_id?: string;
          customer_id: string;
          origin: string;
          destination: string;
          product: string;
          weight: number;
          status?: OrderStatus;
          delivery_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          customer_id?: string;
          origin?: string;
          destination?: string;
          product?: string;
          weight?: number;
          status?: OrderStatus;
          delivery_date?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      carriers: {
        Row: {
          id: string;
          organization_id: string;
          company_name: string;
          contact_email: string;
          phone: string;
          transport_type: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          company_name: string;
          contact_email: string;
          phone: string;
          transport_type: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          company_name?: string;
          contact_email?: string;
          phone?: string;
          transport_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "carriers_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      shipments: {
        Row: {
          id: string;
          organization_id: string;
          order_id: string;
          carrier_id: string;
          tracking_number: string;
          status: ShipmentStatus;
          estimated_delivery: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          order_id: string;
          carrier_id: string;
          tracking_number: string;
          status?: ShipmentStatus;
          estimated_delivery?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          order_id?: string;
          carrier_id?: string;
          tracking_number?: string;
          status?: ShipmentStatus;
          estimated_delivery?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shipments_carrier_id_fkey";
            columns: ["carrier_id"];
            referencedRelation: "carriers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shipments_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shipments_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      tracking_events: {
        Row: {
          id: string;
          organization_id: string;
          shipment_id: string;
          status: TrackingEventStatus;
          location: string;
          timestamp: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          shipment_id: string;
          status: TrackingEventStatus;
          location: string;
          timestamp?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          shipment_id?: string;
          status?: TrackingEventStatus;
          location?: string;
          timestamp?: string;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tracking_events_shipment_id_fkey";
            columns: ["shipment_id"];
            referencedRelation: "shipments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tracking_events_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      documents: {
        Row: {
          id: string;
          organization_id: string;
          shipment_id: string;
          document_type: DocumentType;
          file_url: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          shipment_id: string;
          document_type: DocumentType;
          file_url: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          shipment_id?: string;
          document_type?: DocumentType;
          file_url?: string;
          uploaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_shipment_id_fkey";
            columns: ["shipment_id"];
            referencedRelation: "shipments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      rates: {
        Row: {
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
        };
        Insert: {
          id?: string;
          organization_id?: string;
          carrier_id?: string | null;
          mode: TransportMode;
          origin_region: string;
          destination_region: string;
          min_weight?: number;
          max_weight: number;
          base_amount: number;
          fuel_surcharge_pct?: number;
          currency?: string;
          effective_from: string;
          effective_to?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          carrier_id?: string | null;
          mode?: TransportMode;
          origin_region?: string;
          destination_region?: string;
          min_weight?: number;
          max_weight?: number;
          base_amount?: number;
          fuel_surcharge_pct?: number;
          currency?: string;
          effective_from?: string;
          effective_to?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rates_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rates_carrier_id_fkey";
            columns: ["carrier_id"];
            referencedRelation: "carriers";
            referencedColumns: ["id"];
          },
        ];
      };
      route_plans: {
        Row: {
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
        };
        Insert: {
          id?: string;
          organization_id?: string;
          shipment_id?: string | null;
          origin: string;
          destination: string;
          mode: TransportMode;
          distance_km?: number | null;
          estimated_duration_hours?: number | null;
          optimization_score?: number | null;
          status?: RoutePlanStatus;
          planned_departure?: string | null;
          planned_arrival?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          shipment_id?: string | null;
          origin?: string;
          destination?: string;
          mode?: TransportMode;
          distance_km?: number | null;
          estimated_duration_hours?: number | null;
          optimization_score?: number | null;
          status?: RoutePlanStatus;
          planned_departure?: string | null;
          planned_arrival?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "route_plans_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "route_plans_shipment_id_fkey";
            columns: ["shipment_id"];
            referencedRelation: "shipments";
            referencedColumns: ["id"];
          },
        ];
      };
      route_stops: {
        Row: {
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
        };
        Insert: {
          id?: string;
          organization_id?: string;
          route_plan_id: string;
          stop_sequence: number;
          stop_type: "pickup" | "dropoff" | "waypoint";
          location: string;
          eta?: string | null;
          etd?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          route_plan_id?: string;
          stop_sequence?: number;
          stop_type?: "pickup" | "dropoff" | "waypoint";
          location?: string;
          eta?: string | null;
          etd?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "route_stops_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "route_stops_route_plan_id_fkey";
            columns: ["route_plan_id"];
            referencedRelation: "route_plans";
            referencedColumns: ["id"];
          },
        ];
      };
      load_plans: {
        Row: {
          id: string;
          organization_id: string;
          route_plan_id: string | null;
          shipment_id: string | null;
          load_reference: string;
          capacity_weight: number;
          utilized_weight: number;
          status: LoadPlanStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          route_plan_id?: string | null;
          shipment_id?: string | null;
          load_reference: string;
          capacity_weight: number;
          utilized_weight?: number;
          status?: LoadPlanStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          route_plan_id?: string | null;
          shipment_id?: string | null;
          load_reference?: string;
          capacity_weight?: number;
          utilized_weight?: number;
          status?: LoadPlanStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "load_plans_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "load_plans_route_plan_id_fkey";
            columns: ["route_plan_id"];
            referencedRelation: "route_plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "load_plans_shipment_id_fkey";
            columns: ["shipment_id"];
            referencedRelation: "shipments";
            referencedColumns: ["id"];
          },
        ];
      };
      invoices: {
        Row: {
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
        };
        Insert: {
          id?: string;
          organization_id?: string;
          shipment_id?: string | null;
          carrier_id?: string | null;
          invoice_number: string;
          billed_amount: number;
          audited_amount?: number | null;
          currency?: string;
          status?: InvoiceStatus;
          due_date?: string | null;
          received_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          shipment_id?: string | null;
          carrier_id?: string | null;
          invoice_number?: string;
          billed_amount?: number;
          audited_amount?: number | null;
          currency?: string;
          status?: InvoiceStatus;
          due_date?: string | null;
          received_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_shipment_id_fkey";
            columns: ["shipment_id"];
            referencedRelation: "shipments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_carrier_id_fkey";
            columns: ["carrier_id"];
            referencedRelation: "carriers";
            referencedColumns: ["id"];
          },
        ];
      };
      freight_audits: {
        Row: {
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
        };
        Insert: {
          id?: string;
          organization_id?: string;
          invoice_id: string;
          auditor_user_id?: string | null;
          status?: FreightAuditStatus;
          discrepancy_amount?: number;
          expected_amount?: number | null;
          tolerance_amount?: number | null;
          match_confidence?: number;
          matched_rate_id?: string | null;
          rule_breakdown?: AuditRuleBreakdown[];
          notes?: string | null;
          audited_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          invoice_id?: string;
          auditor_user_id?: string | null;
          status?: FreightAuditStatus;
          discrepancy_amount?: number;
          expected_amount?: number | null;
          tolerance_amount?: number | null;
          match_confidence?: number;
          matched_rate_id?: string | null;
          rule_breakdown?: AuditRuleBreakdown[];
          notes?: string | null;
          audited_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "freight_audits_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "freight_audits_invoice_id_fkey";
            columns: ["invoice_id"];
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "freight_audits_auditor_user_id_fkey";
            columns: ["auditor_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "freight_audits_matched_rate_id_fkey";
            columns: ["matched_rate_id"];
            referencedRelation: "rates";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          organization_id: string;
          invoice_id: string;
          paid_amount: number;
          currency: string;
          payment_method: "ach" | "wire" | "card" | "other";
          payment_reference: string | null;
          paid_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          invoice_id: string;
          paid_amount: number;
          currency?: string;
          payment_method: "ach" | "wire" | "card" | "other";
          payment_reference?: string | null;
          paid_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          invoice_id?: string;
          paid_amount?: number;
          currency?: string;
          payment_method?: "ach" | "wire" | "card" | "other";
          payment_reference?: string | null;
          paid_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_invoice_id_fkey";
            columns: ["invoice_id"];
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
