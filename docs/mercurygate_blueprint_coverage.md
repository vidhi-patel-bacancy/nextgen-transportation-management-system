# MercuryGate Blueprint Coverage Matrix

Source document: `/home/bacancy/Downloads/mercurygate_blueprint_20260311_003049.pdf` (generated March 11, 2026).

Status legend:
- `Implemented`: feature exists and is usable in current product flow.
- `Partial`: some pieces exist but key behavior from blueprint is still missing.
- `Missing`: not implemented yet.

## Core Features

| # | Feature | Priority | Status | Current evidence | Gap to close |
|---|---|---|---|---|---|
| 1 | Load Planning & Optimization | must-have | Partial | `route_plans` + `load_plans` foundations and `/routes` UI/API | Add automated optimization algorithms and constraints solver |
| 2 | Carrier Management | must-have | Partial | `src/app/carriers/*`, `src/services/carriersService.ts` | Add contracts, rate cards, capacity, SLA/performance scoring |
| 3 | Rate Management | must-have | Partial | `rates` schema + `/rates` API/UI | Add advanced pricing rules and automated quote engine |
| 4 | Shipment Tracking | must-have | Implemented | `src/app/tracking/page.tsx`, `src/services/trackingService.ts`, `tracking_events` table | Add proactive alerting and external carrier feeds |
| 5 | Order Management | must-have | Implemented | `src/app/orders/*`, `src/services/ordersService.ts`, `orders` table | Add workflow approvals and order templates |
| 6 | Freight Audit & Payment | must-have | Partial | `invoices`, `freight_audits`, `payments` schema + `/invoices` API/UI + weighted 3-way matching (rate, amount tolerance, shipment execution evidence) with explainable rule breakdown | Add settlement orchestration and external payment rails |
| 7 | Route Optimization | must-have | Partial | `route_plans` + `/routes` API/UI with computed optimization score and optimize endpoint | Add traffic/time-window/constraint-aware optimizer and alternatives ranking |
| 8 | Warehouse Integration | must-have | Missing | No WMS connector module | Add inbound/outbound warehouse sync + mapping |
| 9 | Customer Portal | must-have | Partial | Authenticated UI exists (`/dashboard`, `/shipments`), role includes `customer` | Add dedicated customer self-service views and restricted permissions |
| 10 | Document Management | must-have | Implemented | `src/components/forms/document-upload-form.tsx`, `src/app/api/documents/upload/route.ts`, `documents` table | Add versioning and secure signed URL downloads |
| 11 | Reporting & Analytics | must-have | Partial | `src/app/reports/page.tsx`, `src/services/reportsService.ts` | Add KPI library, custom filters/export, scheduled reports |
| 12 | Multi-modal Support | must-have | Partial | Carrier transport type (`road/air/sea/rail`) in `carrier-form` | Add mode-specific workflows (LTL/FTL/parcel/ocean/air/rail) |
| 13 | EDI Integration | must-have | Missing | No EDI parser/mapper/ack flow | Add EDI 204/210/214/990 endpoints and mapping rules |
| 14 | Load Tendering | important | Missing | No tender lifecycle | Add tender creation, carrier acceptance/rejection and fallback |
| 15 | Exception Management | important | Partial | Shipment status `exception`, tracking `delay` events | Add exception queues, ownership, SLA alerts, resolution workflow |
| 16 | Mobile App | important | Missing | Web-only Next.js app | Add mobile app or mobile field workflow (POD capture, status updates) |
| 17 | API Integration Hub | important | Partial | Upload route only (`/api/documents/upload`) | Add REST/webhook integration framework with auth + retries |
| 18 | Compliance Management | important | Missing | No compliance module | Add DOT/FMCSA/compliance checks and audit trail |
| 19 | Appointment Scheduling | important | Missing | No appointment model or scheduling UI | Add pickup/delivery slot planning and confirmations |
| 20 | Multi-tenant Architecture | important | Implemented | Tenant keys + strict RLS in `supabase/migrations/20260314133000_phase1_tenant_rbac_api.sql` | Continue tenant regression testing as features expand |
| 21 | Role-based Access Control | important | Implemented | Role-gated middleware/UI + RBAC RLS + API role checks (`src/middleware.ts`, `src/lib/auth/permissions.ts`, `src/app/api/*`) | Expand permission granularity for future modules |
| 22 | Shipment Consolidation | nice-to-have | Missing | No consolidation logic | Add consolidatable shipment grouping + cost simulation |
| 23 | Weather Integration | nice-to-have | Missing | No weather provider integration | Add route/weather risk overlay and ETA adjustment |
| 24 | Fuel Management | nice-to-have | Missing | No fuel cost/efficiency module | Add fuel expense tracking + route fuel optimization |

## Advanced / Differentiating Features

| # | Feature | Priority | Status | Gap to close |
|---|---|---|---|---|
| 1 | AI-Powered Predictive Analytics | innovative | Missing | Build ETA/risk prediction models + feature store |
| 2 | Dynamic Pricing Engine | innovative | Missing | Add market-aware real-time rate optimizer |
| 3 | IoT Device Integration | important | Missing | Add telematics/sensor ingestion APIs |
| 4 | Blockchain Supply Chain | innovative | Missing | Add immutable chain-of-custody ledger integration |
| 5 | Advanced Optimization Algorithms | important | Missing | Add multi-objective optimization (cost/service/carbon) |
| 6 | Digital Twin Simulation | innovative | Missing | Add network simulation sandbox |
| 7 | Autonomous Vehicle Integration | innovative | Missing | Add AV-specific route/control model |
| 8 | Carbon Footprint Tracking | important | Missing | Add shipment-level emissions calculation + reporting |
| 9 | Collaborative Planning Platform | important | Missing | Add multi-party plan workspace and change approvals |
| 10 | Network Optimization Engine | important | Missing | Add global lane/network optimization services |
| 11 | Advanced Risk Management | important | Missing | Add risk scoring, mitigation playbooks, insurer integrations |
| 12 | Voice Interface | nice-to-have | Missing | Add voice command/assistant layer |
| 13 | Augmented Reality Tools | innovative | Missing | Add AR pick/load guidance |
| 14 | Marketplace Integration | important | Missing | Add load board/marketplace connectors and spot bidding |

## Innovative Ideas (Beyond Current Market)

All listed ideas in the blueprint are currently `Missing` and should be treated as long-term R&D backlog items:
- AI demand forecasting (30-90 day horizon)
- Carbon credit trading
- Drone last-mile coordination
- Social sentiment support insights
- Crypto payments + smart contracts
- Quantum optimization
- Predictive maintenance for fleets
- VR training
- Biometric security for high-value shipments
- Space logistics planning
- Crowdsourced delivery network
- AI carrier negotiation
- Sustainability scoring gamification
- Smart city infrastructure integration

## Data Model Coverage

Blueprint entities vs current schema (`supabase/migrations/20260314120000_init_tms.sql`):

- Implemented: `Shipments`, `Orders`, `Carriers`, `Users`, `Documents`, `Tracking_Events`, `Organizations`
- Partial: `Customers` (implemented as `users` role), `Products` (single text field in orders)
- Missing: `Routes`, `Vehicles`, `Drivers`, `Rates`, `Invoices`, `Locations`, `Warehouses`, `Contracts`, `Exceptions`, `Appointments`, `Audits`, `Reports` (persisted), `Notifications`, `Integrations`

## API Endpoint Group Coverage

Blueprint API groups vs current implementation:
- Implemented: `/orders`, `/carriers`, `/shipments`, `/tracking` route-handler groups plus `/documents/upload`
- Missing as grouped REST APIs: `/auth`, `/users`, `/rates`, `/routes`, `/documents` (full CRUD), `/reports`, `/integrations`, `/notifications`, `/customers`, `/invoices`, `/analytics`, `/admin`, `/webhooks`

Current app pattern mostly uses client-side Supabase calls in `src/services/*` rather than dedicated server endpoint groups.

## MVP Alignment Check

Blueprint MVP asks for shipment creation/tracking, basic carrier management, simple rate lookup, order processing, document upload, customer portal, basic reporting, API integrations, and one mode focus.

Current project has strong coverage for shipment/order/carrier/tracking/document/report basics, but still lacks:
- Simple rate lookup
- Customer portal role-specific UX
- API integration hub

## Current Overall Coverage Snapshot

- Core features (24): `Implemented 6`, `Partial 10`, `Missing 8`
- Advanced features (14): `Implemented 0`, `Partial 0`, `Missing 14`
- Innovative ideas: `Missing (all)`

This means the current codebase is still a true MVP baseline and not yet full MercuryGate-level parity.
