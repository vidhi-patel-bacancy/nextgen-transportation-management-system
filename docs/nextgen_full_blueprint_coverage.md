# NextGen TMS Full Blueprint Coverage

Last updated: March 14, 2026
Reference: "NextGen Transportation Management System (TMS) / MercuryGate analysis" (generated March 11, 2026)

Status legend:
- `Implemented`: production-usable in current app
- `Partial`: foundation exists, but not full blueprint depth
- `Missing`: not yet implemented

## 1) Core Features (24)

| # | Feature | Priority | Status | Current project evidence | What remains |
|---|---|---|---|---|---|
| 1 | Load Planning & Optimization | must-have | Partial | `load_plans`, `route_plans`, `/routes`, `/api/load-plans`, `/api/routes/[id]/optimize` | Constraint-based auto optimizer, consolidation/what-if engine |
| 2 | Carrier Management | must-have | Partial | `/carriers`, `/api/carriers`, `carriers` table | Contracts, scorecards, capacity/SLA management |
| 3 | Rate Management | must-have | Partial | `/rates`, `/api/rates`, `rates` table | Complex rules hierarchy, auto quote/rule conflict resolution |
| 4 | Shipment Tracking | must-have | Implemented | `/tracking`, `/api/tracking`, `tracking_events` | Carrier EDI/GPS feed ingestion + alert subscriptions |
| 5 | Order Management | must-have | Implemented | `/orders`, `/api/orders`, `orders` table | Approvals/templates/bulk ops |
| 6 | Freight Audit & Payment | must-have | Partial | `/invoices`, `/api/invoices`, `/api/freight-audits`, `/api/payments`, `freight_audits` | Settlement automation + external payment rails |
| 7 | Route Optimization | must-have | Partial | `/routes`, `/api/routes`, optimize endpoint, `route_plans/route_stops` | Traffic/time-window/vehicle constraint solver |
| 8 | Warehouse Integration | must-have | Missing | No WMS connector module | WMS sync adapters + mapping UI |
| 9 | Customer Portal | must-have | Partial | `customer` role, scoped RLS, shared UI routes | Dedicated customer dashboard/self-service portal UX |
| 10 | Document Management | must-have | Implemented | `/api/documents/upload`, `documents`, S3 integration | Signed download URLs, versioning, retention policy |
| 11 | Reporting & Analytics | must-have | Partial | `/reports`, `reportsService.ts` | Saved filters, exports, scheduled report delivery |
| 12 | Multi-modal Support | must-have | Partial | modes in `rates`, `route_plans`, carrier transport type | Mode-specific workflows (LTL/FTL/parcel/ocean/air/rail) |
| 13 | EDI Integration | must-have | Missing | No EDI endpoints yet | 204/210/214/990 parsing + ACK and retry flow |
| 14 | Load Tendering | important | Missing | No tender lifecycle table/API | Tender orchestration + accept/reject + fallback |
| 15 | Exception Management | important | Partial | `exception` shipment status + tracking delay events | Exception queue, ownership, SLA/escalation |
| 16 | Mobile App | important | Partial | Responsive web app | Native/PWA driver workflows, camera POD capture |
| 17 | API Integration Hub | important | Partial | Route-handler APIs exist for core modules | Connector registry, webhooks, retries, DLQ |
| 18 | Compliance Management | important | Missing | No compliance module | DOT/FMCSA rules, evidence and audit timelines |
| 19 | Appointment Scheduling | important | Missing | No appointment model | Pickup/drop slot engine + calendar UI |
| 20 | Multi-tenant Architecture | important | Implemented | strict `organization_id` + RLS in phase1 migration | Tenant-level observability and tenant-admin tools |
| 21 | Role-based Access Control | important | Implemented | middleware role guards + SQL RBAC/RLS + UI role menus | Fine-grained permission matrix per action |
| 22 | Shipment Consolidation | nice-to-have | Missing | No consolidation model | Candidate engine + cost-saving recommendations |
| 23 | Weather Integration | nice-to-have | Missing | No weather provider integration | Weather risk overlay + ETA impact |
| 24 | Fuel Management | nice-to-have | Missing | No fuel domain model | Fuel spend/efficiency + optimization insights |

## 2) Advanced / Differentiating Features (14)

| # | Feature | Priority | Status | Target phase |
|---|---|---|---|---|
| 1 | AI-Powered Predictive Analytics | innovative | Missing | Phase 5 |
| 2 | Dynamic Pricing Engine | innovative | Missing | Phase 5 |
| 3 | IoT Device Integration | important | Missing | Phase 5 |
| 4 | Blockchain Supply Chain | innovative | Missing | R&D track |
| 5 | Advanced Optimization Algorithms | important | Partial | Phase 5 |
| 6 | Digital Twin Simulation | innovative | Missing | R&D track |
| 7 | Autonomous Vehicle Integration | innovative | Missing | R&D track |
| 8 | Carbon Footprint Tracking | important | Missing | Phase 5 |
| 9 | Collaborative Planning Platform | important | Missing | Phase 5 |
| 10 | Network Optimization Engine | important | Missing | Phase 5 |
| 11 | Advanced Risk Management | important | Missing | Phase 5 |
| 12 | Voice Interface | nice-to-have | Missing | R&D track |
| 13 | Augmented Reality Tools | innovative | Missing | R&D track |
| 14 | Marketplace Integration | important | Missing | Phase 5 |

## 3) Innovative Ideas Register (All Covered as R&D Backlog)

All 14 ideas from blueprint are now explicitly tracked as `R&D epics` in execution roadmap:
- AI demand forecasting (30-90 days)
- Carbon credit trading
- Drone last-mile coordination
- Social sentiment service insights
- Crypto payments + smart contracts
- Quantum optimization
- Predictive fleet maintenance
- VR training modules
- Biometric security for high-value cargo
- Space logistics planning
- Crowdsourced freight network
- AI carrier negotiation
- Sustainability scoring gamification
- Smart-city integration

## 4) Data Model Entity Coverage

| Entity from blueprint | Coverage in current project |
|---|---|
| Shipments | Implemented (`shipments`) |
| Orders | Implemented (`orders`) |
| Carriers | Implemented (`carriers`) |
| Customers | Partial (`users` with `customer` role) |
| Routes | Partial (`route_plans`, `route_stops`) |
| Vehicles | Missing |
| Drivers | Missing |
| Rates | Implemented (`rates`) |
| Invoices | Implemented (`invoices`) |
| Documents | Implemented (`documents`) |
| Locations | Missing (currently free-text origin/destination/location fields) |
| Products | Partial (`orders.product` text only) |
| Warehouses | Missing |
| Users | Implemented (`users`) |
| Contracts | Missing |
| Tracking_Events | Implemented (`tracking_events`) |
| Exceptions | Missing dedicated table (only status/events) |
| Appointments | Missing |
| Audits | Implemented (`freight_audits`) |
| Reports | Partial (computed at runtime, no persisted report objects) |
| Notifications | Missing |
| Integrations | Missing |

## 5) API Endpoint Group Coverage

| API group requested | Coverage |
|---|---|
| `/auth` | Partial (`/api/auth/send-signup-otp`, `/verify-signup-otp`, `/forgot-password`, `/reset-password`) |
| `/users` | Missing |
| `/shipments` | Implemented (`/api/shipments`, `/api/shipments/[id]`) |
| `/orders` | Implemented (`/api/orders`, `/api/orders/[id]`) |
| `/carriers` | Implemented (`/api/carriers`, `/api/carriers/[id]`) |
| `/rates` | Implemented (`/api/rates`, `/api/rates/[id]`) |
| `/tracking` | Implemented (`/api/tracking`) |
| `/routes` | Implemented (`/api/routes`, `/api/routes/[id]`, `/api/routes/[id]/optimize`) |
| `/documents` | Partial (`/api/documents/upload`) |
| `/reports` | Missing dedicated route group |
| `/integrations` | Missing |
| `/notifications` | Missing |
| `/customers` | Missing |
| `/invoices` | Implemented (`/api/invoices`, `/api/invoices/[id]`) |
| `/analytics` | Missing |
| `/admin` | Missing |
| `/webhooks` | Missing |

## 6) Monetization Strategy Coverage

All 10 monetization points are now tracked in roadmap scope as `Commercial Workstream` items.

| Strategy | Current status |
|---|---|
| SaaS subscription tiers | Missing |
| Per-shipment transaction pricing | Missing |
| Marketplace commissions | Missing |
| Premium analytics add-ons | Missing |
| Professional services packages | Missing |
| API usage fees | Missing |
| White-label licensing | Missing |
| Data monetization | Missing |
| Freight financing/payment fees | Missing |
| Carbon/sustainability premiums | Missing |

## 7) KPI / Metrics Coverage

| KPI from blueprint | Current capture status |
|---|---|
| MRR | Missing |
| CAC | Missing |
| CLV | Missing |
| Churn / retention | Missing |
| Avg shipments per customer | Partial (derivable from existing tables) |
| API call volume/performance | Partial (not centrally instrumented) |
| Uptime/reliability | Missing app-level SLO dashboards |
| Cost savings delivered | Missing |
| On-time delivery rate | Partial (`/reports` computes on-time trend) |
| User adoption/engagement | Missing |
| Integration success rate | Missing |
| Support ticket volume/resolution | Missing |

## 8) GTM / Competitive / Positioning Coverage

These are now covered as explicit planning tracks in execution roadmap:
- Mid-market shipper + 3PL ICP focus
- ROI-first pilot design
- Vertical templates (manufacturing, retail, etc.)
- Carrier partnership playbook
- Competitive benchmark pack (Oracle/SAP/Manhattan vs MercuryGate/Descartes/BluJay)

## 9) Coverage Summary

- Core features: `Implemented 6 / Partial 10 / Missing 8`
- Advanced differentiators: `Implemented 0 / Partial 1 / Missing 13`
- Innovative ideas: `0 implemented, 14 tracked as R&D epics`
- Data entities: `Implemented 9 / Partial 4 / Missing 9`
- API groups: `Implemented 7 / Partial 2 / Missing 8`

This file ensures every blueprint point is mapped to a current status and tracked in-project.
