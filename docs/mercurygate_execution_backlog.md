# MercuryGate Blueprint Execution Backlog

Objective: close every `Partial` and `Missing` item from `docs/mercurygate_blueprint_coverage.md` so no blueprint point is left untracked.

Status update (March 14, 2026):
- Phase 1 baseline has been implemented in code (tenant `organization_id` propagation, stricter RLS/RBAC policies, app route role-gating, and `/api` route-handler groups for orders/carriers/shipments/tracking).
- Phase 2 foundation has started in code (`rates`, `invoices`, `freight_audits`, `payments`, `route_plans`, `route_stops`, `load_plans` plus `/rates`, `/invoices`, `/routes` workflows and API groups).
- Automated invoice-to-rate audit matching is now wired into invoice creation; route optimization scoring is now computed server-side and can be re-run via optimize endpoint.
- 3-way matching now includes weighted rule confidence with explainable breakdown (`contract rate`, `amount tolerance`, `shipment execution evidence`) persisted in `freight_audits`.

## Phase 1 - Foundation (tenant, security, platform)

1. Multi-tenant hardening
- Add `organization_id` to all business tables (orders, carriers, shipments, tracking_events, documents).
- Replace permissive RLS (`using (true)`) with tenant-scoped policies.
- Enforce tenant context for every query/mutation path.

2. RBAC enforcement
- Define permissions matrix (`admin`, `manager`, `carrier`, `customer`).
- Enforce server-side checks for create/update/delete actions.
- Hide unauthorized routes/actions in UI navigation.

3. API surface baseline
- Introduce route-handler groups for core domains (`/api/orders`, `/api/shipments`, `/api/carriers`, etc.).
- Add request validation + error contracts.
- Add audit logging and request tracing IDs.

## Phase 2 - Must-have core gaps

1. Rate Management
- Create `rates`, `rate_rules`, `rate_cards` schema.
- Implement lookup API by origin, destination, mode, carrier, weight.
- Add rate management UI and version/effective date handling.

2. Freight Audit & Payment
- Create `invoices`, `freight_audits`, `payments` schema.
- Implement invoice-to-shipment matching and discrepancy detection.
- Add audit queue + approval workflow.

3. Route Optimization + Load Planning
- Create route and stop entities.
- Implement optimization service (distance/time-window/vehicle constraints).
- Add load planning UI with consolidation suggestions.

4. Warehouse Integration
- Add connectors abstraction (`integrations`, `integration_runs`).
- Build WMS sync jobs (orders, inventory, fulfillment milestones).
- Add mapping UI for warehouse/location identifiers.

5. EDI Integration
- Add EDI ingestion/serialization service and transaction logs.
- Support priority transaction sets (204, 210, 214, 990).
- Add retry/acknowledgment and failure handling dashboard.

## Phase 3 - Important operational gaps

1. Load Tendering
- Tender entity with states (`draft`, `sent`, `accepted`, `rejected`, `expired`).
- Automated cascade tendering when carrier rejects.

2. Exception Management
- Exception queue with severity, owner, SLA, resolution notes.
- Proactive alerts via email/webhook.

3. Appointment Scheduling
- Pickup/delivery appointment slots and conflict checks.
- Calendar board with auto-reminders.

4. Compliance Management
- Rule engine for DOT/FMCSA checks.
- Compliance document validity tracking and alerts.

5. API Integration Hub
- Central connector registry for ERP/WMS/CRM.
- Webhook subscriptions, signing, retries, dead-letter queue.

6. Customer Portal
- Customer-specific dashboards with strict data scoping.
- Self-service order/tracking/document views.

7. Mobile Experience
- Responsive field workflows now, native/mobile app later.
- Driver workflows: POD capture, status updates, exception reporting.

## Phase 4 - Nice-to-have core gaps

1. Shipment Consolidation
- Consolidation candidate engine with savings score.
- Manual/auto merge + approval flow.

2. Weather Integration
- Route weather risk enrichment.
- ETA and exception impact calculations.

3. Fuel Management
- Fuel spend tracking by carrier/lane.
- Fuel efficiency KPIs and optimization insights.

## Phase 5 - Advanced differentiators

1. AI and optimization
- Predictive ETA/risk models.
- Dynamic pricing model.
- Multi-objective network optimization engine.

2. Ecosystem integrations
- IoT telematics adapters.
- Freight marketplace adapters.

3. Sustainability and resilience
- Carbon footprint computation and reporting.
- Advanced risk scoring and mitigation playbooks.

4. Experimental innovation track
- Keep all blueprint "Innovative Ideas" as separate R&D epics with success criteria and stage gates.

## Execution Rules

1. No feature is marked complete until it has: schema, API/service, UI workflow, auth/RLS, and tests.
2. Every phase must ship with migration scripts and rollback strategy.
3. Every integration feature must have observability (structured logs, retries, alerting).
4. Every tenant-affecting change must include an RLS regression test suite.
