import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";

const modules = [
  {
    title: "Order and Shipment Control",
    description: "Create orders, assign carriers, and monitor shipment status from pickup to delivery.",
  },
  {
    title: "Rates, Routes, and Invoices",
    description: "Manage pricing, route plans, freight audits, and payment records in one workflow.",
  },
  {
    title: "Role-based Access",
    description: "Separate experiences for operations teams and customers with tenant-safe data access.",
  },
  {
    title: "Reports and Visibility",
    description: "Track operational KPIs, delayed shipments, and carrier performance using live data.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 pb-16 pt-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-14 flex items-center justify-between rounded-2xl border border-white/70 bg-white/60 px-4 py-3 backdrop-blur-md">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">NextGen TMS</p>
            <p className="text-sm text-slate-600">Logistics Command Platform</p>
          </div>
          <nav className="flex items-center gap-2 text-sm md:gap-3">
            <Link className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100/80" href="/pricing">
              Pricing
            </Link>
            <Link className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100/80" href="/contact">
              Contact
            </Link>
            <Link className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100/80" href="/login">
              Login
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-700 to-teal-700 px-3 py-2 font-semibold text-white"
              href="/signup"
            >
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </header>

        <section className="mb-10 grid gap-8 lg:grid-cols-[1.2fr,1fr] lg:items-start">
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-5xl">Simple and informative TMS for daily logistics operations.</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
              NextGen TMS helps shippers and logistics teams manage orders, shipments, carriers, rates, routes, and freight invoices
              without a complicated setup.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(6,95,70,0.25)]"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg border border-emerald-950/20 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-900"
              >
                Login
              </Link>
            </div>
          </div>

          <Card className="border-white/80 bg-white/70 p-6">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">What You Get</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li>1. Operations panel for dispatch, planning, and audit workflows.</li>
              <li>2. Customer portal for order requests, tracking, and invoice visibility.</li>
              <li>3. API-ready architecture for integration with ERP/WMS and partners.</li>
              <li>4. Multi-tenant role-based access control with secure data isolation.</li>
            </ul>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-slate-950">Core Modules</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((item) => (
              <Card key={item.title} className="border-white/80 bg-white/70">
                <h3 className="text-base font-semibold tracking-tight text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-white/80 bg-white/70">
            <h3 className="text-base font-semibold tracking-tight text-slate-900">For Shippers</h3>
            <p className="mt-2 text-sm text-slate-600">Manage freight execution, cost control, and on-time delivery from one dashboard.</p>
          </Card>
          <Card className="border-white/80 bg-white/70">
            <h3 className="text-base font-semibold tracking-tight text-slate-900">For 3PL Teams</h3>
            <p className="mt-2 text-sm text-slate-600">Coordinate customer orders, carrier assignments, and operational exceptions at scale.</p>
          </Card>
          <Card className="border-white/80 bg-white/70">
            <h3 className="text-base font-semibold tracking-tight text-slate-900">For Customers</h3>
            <p className="mt-2 text-sm text-slate-600">Create shipment requests and track progress in a dedicated self-service portal.</p>
          </Card>
        </section>

        <section className="mt-10 rounded-2xl border border-white/70 bg-white/65 p-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-950">Get Started in 3 Steps</h2>
          <p className="mt-2 text-sm text-slate-600">
            1) Create your workspace. 2) Configure carriers and rates. 3) Start processing live orders and shipments.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Create Workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="inline-flex rounded-lg border border-emerald-900/20 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900">
              Talk to Sales
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
