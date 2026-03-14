# Cloud TMS User Guide (Step-by-Step by Role)

This guide explains exactly how each user role should use the website.

Roles covered:
- `admin`
- `manager`
- `carrier`
- `customer`

## 1. First-Time Setup (All Users)

1. Open the website.
2. Go to `/signup`.
3. Enter:
- Organization Name
- Email
- Password
- Role (`admin`, `manager`, `carrier`, or `customer`)
4. Click `Sign up`.
5. You will be redirected to `/dashboard`.
6. If you already have an account, use `/login`.

## 2. Common Navigation (After Login)

Use the left sidebar. Menu visibility depends on role permissions.

Main pages:
- Dashboard: `/dashboard`
- Orders: `/orders`
- Shipments: `/shipments`
- Carriers: `/carriers`
- Tracking: `/tracking`
- Reports: `/reports`
- Rates: `/rates`
- Invoices: `/invoices`
- Routes & Load Planning: `/routes`

## 3. Admin User Flow (Full Control)

### A. Setup Core Data

1. Open `Carriers`.
2. Click `Add Carrier`.
3. Fill carrier details and save.
4. Repeat for all carriers.

### B. Create/Manage Orders

1. Open `Orders`.
2. Click `Create Order`.
3. Enter origin, destination, product, weight, delivery date.
4. Save order.
5. Open any order from list to edit or delete.

### C. Create/Manage Shipments

1. Open `Shipments`.
2. In `Create Shipment`, select order + carrier.
3. Add tracking number, status, ETA.
4. Save shipment.
5. Open shipment details to:
- Update status/carrier/ETA
- Upload documents
- Add tracking events

### D. Configure Rates

1. Open `Rates`.
2. Create lane-based rates by mode.
3. Define weight bands and base/fuel pricing.
4. Save rate cards.

### E. Manage Invoice, Audit, Payment

1. Open `Invoices`.
2. Create invoice (optional shipment/carrier link).
3. System auto-runs 3-way audit matching.
4. Review `Freight Audits` table (confidence, expected, tolerance, discrepancy).
5. Add payment records for approved invoices.

### F. Route & Load Planning

1. Open `Routes`.
2. Create route plan (origin, destination, mode, distance, duration).
3. Click `Optimize` to recompute optimization score.
4. Create load plans and map shipment/route.

### G. Reporting

1. Open `Reports`.
2. Monitor on-time delivery, shipment volume, carrier performance.

## 4. Manager User Flow (Operational Control)

Manager flow is almost same as admin, except organization-level destructive actions are restricted.

Recommended daily steps:
1. Open `Dashboard` and review delays/active shipments.
2. Review new `Orders` and create needed `Shipments`.
3. Check `Tracking` for delays/exceptions.
4. Update `Rates` when lanes or pricing changes.
5. Process `Invoices` and verify auto-generated freight audits.
6. Record `Payments` for approved invoices.
7. Update `Routes` and `Load Plans` for optimization.

## 5. Carrier User Flow (Execution + Visibility)

### A. Login and Review Assignments

1. Login using carrier role account.
2. Open `Shipments` to see assigned shipments.

### B. Update Shipment Progress

1. Open shipment details.
2. Update shipment status as movement progresses.
3. Add tracking events (pickup, in transit, delay, delivered).
4. Upload documents (BOL, invoice, POD) where needed.

### C. Invoice Submission

1. Open `Invoices`.
2. Create invoice linked to shipment/carrier.
3. System auto-runs audit match and sets review status.

### D. Route Visibility

1. Open `Routes`.
2. Review existing plans.
3. Create/update plans if operations require route adjustments.

## 6. Customer User Flow (Self-Service)

### A. Create Orders

1. Open `Orders`.
2. Click `Create Order`.
3. Enter shipment request details and save.

### B. Track Progress

1. Open `Tracking`.
2. Select relevant shipment.
3. Review timeline and latest events.

### C. Review Rates and Invoices

1. Open `Rates` to view lane/mode pricing.
2. Open `Invoices` to see invoices related to your shipments.

## 7. Daily Operating Checklist

Use this quick sequence every day:

1. Dashboard: check active and delayed shipments.
2. Tracking: resolve delays/exceptions early.
3. Orders/Shipments: ensure new demand is assigned.
4. Rates: validate current lane pricing.
5. Invoices/Audits: verify confidence and discrepancy values.
6. Payments: close approved invoices.
7. Reports: confirm on-time and carrier KPIs.

## 8. Logout

1. Click `Logout` in top navigation.
2. You will return to login page.

---

If you add new roles or modules later, extend this file with a new role section and route-specific steps.
