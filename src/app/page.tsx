import Link from "next/link";

import { ArrowRight, BarChart3, Package, Route, ShieldCheck, Truck, Users } from "lucide-react";

import { Card } from "@/components/ui/card";

const highlights = [
  {
    title: "Load Planning",
    description: "Plan and optimize routes, loads, and dispatch execution from one control tower.",
    icon: Route,
  },
  {
    title: "Real-time Tracking",
    description: "Track shipments, event timelines, and exceptions with live operational visibility.",
    icon: Truck,
  },
  {
    title: "Rates and Audits",
    description: "Manage rates, freight invoices, and audit confidence workflows with payment tracking.",
    icon: BarChart3,
  },
  {
    title: "Customer Self-Service",
    description: "Give customers their own portal to create orders and track delivery progress.",
    icon: Users,
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

        <section className="mb-12 grid gap-8 lg:grid-cols-[1.2fr,1fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-emerald-900/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Transportation Management System
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-5xl">
              Run logistics with one platform for ops teams and customers.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
              NextGen TMS combines order execution, shipment tracking, rate management, invoice audits, and customer self-service in a
              single cloud workspace.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(6,95,70,0.25)]"
              >
                Create Workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-lg border border-emerald-950/20 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-900"
              >
                Open Admin Panel
              </Link>
            </div>
          </div>

          <Card className="border-white/80 bg-white/70 p-6">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Built For Three Surfaces</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-700" />
                Public website for acquisition, pricing, and demos.
              </li>
              <li className="flex items-start gap-2">
                <Package className="mt-0.5 h-4 w-4 text-emerald-700" />
                Customer portal for order creation, tracking, invoices, and documents.
              </li>
              <li className="flex items-start gap-2">
                <BarChart3 className="mt-0.5 h-4 w-4 text-emerald-700" />
                Operations/admin panel for rates, carriers, routing, audit, and reporting.
              </li>
            </ul>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => (
            <Card key={item.title} className="border-white/80 bg-white/70">
              <item.icon className="h-5 w-5 text-emerald-700" />
              <h3 className="mt-3 text-base font-semibold tracking-tight text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
