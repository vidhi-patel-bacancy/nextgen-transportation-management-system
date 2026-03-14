# NextGen TMS Roadmap (All Blueprint Points Tracked)

Last updated: March 14, 2026
Companion: `docs/nextgen_full_blueprint_coverage.md`

## Delivery Principles

1. Every feature closes only when schema + API + UI + RBAC/RLS + tests are complete.
2. Every integration includes retries, idempotency, observability, and dead-letter handling.
3. Every tenant-sensitive change requires RLS regression checks.
4. Innovative ideas stay in R&D until ROI and feasibility are proven.

## Phase 0 (Current Baseline)

Already in code:
- Auth, tenant/RBAC baseline, orders, shipments, carriers, tracking
- Rates/invoices/audits/payments baseline
- Routes/load plans baseline
- Reporting baseline, role-gated UI

## Phase 1 (Must-have Completion)

Goal: close remaining must-have gaps first.

### Core feature closure
- Load planning & route optimization: add hard constraints (time windows, capacity, service levels) and ranking alternatives.
- Carrier management: contracts, scorecards, capacity.
- Rate management: rule hierarchy and pricing conflict resolution.
- Freight audit/payment: approval flow + payment orchestration.
- Warehouse integration: WMS connector framework + mapping UI.
- Customer portal: dedicated customer dashboard and self-service UX.
- Reporting: scheduled reports + export + KPI presets.
- Multi-modal: enforce mode-specific validation and workflows.
- EDI: 204/210/214/990 pipeline with ACK and retries.

### Data/API completion
- Add missing must-have entities: `warehouses`, `locations`, `contracts`.
- Expand `/documents` from upload-only to full CRUD + signed download.
- Add `/reports` API endpoints.

## Phase 2 (Important Features)

Goal: operational maturity.

### Core feature closure
- Load tendering lifecycle + cascade tendering.
- Exception management queue + SLA/escalations.
- Mobile field workflows (PWA/native readiness).
- API integration hub with connector registry.
- Compliance management (DOT/FMCSA rule packs).
- Appointment scheduling (pickup/delivery slot engine).

### Data/API completion
- Add entities: `exceptions`, `appointments`, `integrations`, `notifications`.
- Add APIs: `/integrations`, `/webhooks`, `/notifications`, `/admin`, `/users`, `/customers`.

## Phase 3 (Nice-to-have Core)

Goal: optimization and operational efficiency gains.

- Shipment consolidation engine.
- Weather-aware routing and ETA risk.
- Fuel management and lane/carrier fuel analytics.

## Phase 4 (Advanced Differentiators)

Goal: build competitive moat.

- AI predictive analytics (ETA/risk).
- Dynamic pricing engine.
- IoT integrations (telematics/sensors).
- Advanced optimization algorithms.
- Carbon footprint tracking.
- Collaborative planning workspace.
- Network optimization engine.
- Advanced risk management.
- Marketplace/load board integrations.

## Phase 5 (Commercial + Platform Scale)

Goal: turn product capability into scalable revenue.

### Monetization workstream (all 10 points)
- SaaS plans by volume/features.
- Per-shipment billing.
- Marketplace commission model.
- Premium analytics upsell.
- Professional services packaging.
- API usage billing.
- White-label packaging.
- Data products (anonymized benchmarks).
- Freight financing/payment revenue features.
- Sustainability/carbon premium offerings.

### KPI workstream (all 12 tracked)
- Commercial: MRR, CAC, CLV, churn.
- Operational: avg shipments/customer, on-time %, cost savings.
- Platform: API latency/error rate, uptime/SLOs, integration success.
- Product/support: DAU/WAU + support SLA metrics.

### GTM workstream
- ICP: mid-market shippers + 3PL.
- Vertical templates for faster onboarding.
- ROI pilot framework (baseline vs post-go-live savings).
- Partner strategy with regional carriers.

## Phase 6 (R&D Track for Innovative Ideas)

All blueprint innovation ideas are captured here with stage gates:
- AI demand forecasting
- Carbon credit trading
- Drone coordination
- Social sentiment insights
- Crypto payments / smart contracts
- Quantum optimization
- Predictive maintenance
- VR training
- Biometric shipment security
- Space logistics
- Crowdsourced freight
- AI carrier negotiation
- Sustainability gamification
- Smart-city logistics

Exit criteria for any R&D item:
1. clear customer pain + monetization path
2. pilot customer identified
3. bounded architecture impact
4. measurable success metric

## Current Priority Sprints (next 6 sprints)

1. Sprint 1: `/reports` API + documents CRUD/signed links + customer dashboard shell.
2. Sprint 2: EDI 214 + exception queue + alerting foundation.
3. Sprint 3: load tendering + carrier contract model + scorecards.
4. Sprint 4: appointment scheduling + compliance rule engine v1.
5. Sprint 5: integration hub + webhooks + retry/DLQ observability.
6. Sprint 6: shipment consolidation + weather enrichment + fuel KPIs.

This roadmap ensures every blueprint point has a tracked destination in the project plan.
