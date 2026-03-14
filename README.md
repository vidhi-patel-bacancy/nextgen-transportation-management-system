# Cloud TMS MVP

Production-ready MVP for a cloud Transportation Management System built with:

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- React Hook Form + Zod validation
- TanStack React Query
- Supabase (Postgres + Auth)
- AWS S3 for shipping documents

## Features

- Authentication: signup, login, logout, session persistence, middleware route protection
- Dashboard metrics: total, active, delayed, monthly shipments
- Orders module: create, update, delete, list, detail
- Shipments module: create from order, assign carrier, update status
- Carriers module: list, add, edit, detail
- Tracking module: timeline + event creation
- Documents module: S3 upload + Supabase metadata storage
- Reports: shipments per month, on-time delivery, carrier performance
- Rates module: lane/mode rate card creation and lookup
- Invoices module: freight invoice register with audit/payment capture
- Routes module: route plans + load plans for optimization workflows

## Structure

Core folders:

- `src/app/*` route modules
- `src/components/*` UI/layout/forms/tables/dashboard
- `src/lib/*` Supabase, S3, API helpers, utilities
- `src/services/*` typed Supabase service layer
- `src/types/*` domain and database types
- `supabase/migrations/*` SQL migration files
- `scripts/seed.ts` seed script

## Environment

Create/update `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=

SUPABASE_SERVICE_ROLE_KEY=
```

## Supabase Setup

1. Create a Supabase project.
2. Run SQL migrations in `supabase/migrations/*` (including tenant/RBAC hardening migrations).
3. In Authentication settings, enable email/password auth.
4. Copy project URL and anon key into `.env.local`.
5. For seeding and admin scripts, add service role key to `.env.local`.

## AWS S3 Setup

1. Create an S3 bucket for shipment documents.
2. Create an IAM user with `s3:PutObject`, `s3:DeleteObject`, `s3:GetObject` on that bucket.
3. Add IAM access key/secret + region + bucket name to `.env.local`.
4. Keep bucket private in production; expose files via signed URLs or CloudFront.

## Runtime Requirement

- Node.js 22+ (project is configured with `engines.node >=22.0.0` and `.nvmrc`)

## Local Run

```bash
npm install
npm run dev
```

Optional seed:

```bash
npm run seed
```

Demo auth + portal data seed:

```bash
npm run seed:demo
```

## Notes

- Middleware protects: `/dashboard`, `/orders`, `/shipments`, `/carriers`, `/tracking`, `/reports`, `/rates`, `/invoices`, `/routes`.

## Blueprint Tracking

- Coverage matrix: `docs/mercurygate_blueprint_coverage.md`
- Execution backlog: `docs/mercurygate_execution_backlog.md`
- User role guide: `docs/user-role-step-by-step-guide.md`
