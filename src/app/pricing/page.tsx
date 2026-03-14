import Link from "next/link";

import { CheckCircle2 } from "lucide-react";

import { Card } from "@/components/ui/card";

const tiers = [
  {
    name: "Starter",
    price: "$299/mo",
    description: "For teams starting digital transport operations.",
    points: ["Up to 1,500 shipments/month", "Orders, shipments, tracking, documents", "Basic reports and email support"],
  },
  {
    name: "Growth",
    price: "$899/mo",
    description: "For growing shippers and 3PLs with audit and routing needs.",
    points: ["Up to 10,000 shipments/month", "Rates, route plans, freight audits, invoices", "Priority support and onboarding"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For multi-site logistics networks with strict SLA requirements.",
    points: ["High-volume or unlimited shipment scale", "Custom integrations, SSO, and security controls", "Dedicated success manager"],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Pricing</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Plans for Every Logistics Stage</h1>
          </div>
          <Link className="text-sm font-semibold text-emerald-700" href="/">
            Back to Home
          </Link>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card key={tier.name} className="border-white/80 bg-white/72">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">{tier.name}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{tier.price}</p>
              <p className="mt-2 text-sm text-slate-600">{tier.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {tier.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-700" />
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                className="mt-5 inline-flex rounded-lg bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-2 text-sm font-semibold text-white"
                href="/signup"
              >
                Get Started
              </Link>
            </Card>
          ))}
        </section>

        <section className="mt-8">
          <Card className="border-white/80 bg-white/72">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Included in All Plans</h2>
            <p className="mt-2 text-sm text-slate-600">
              Multi-tenant security, role-based access, API-ready architecture, and customer portal access are included in all plans.
            </p>
            <p className="mt-4 text-sm text-slate-600">
              Need transaction-based pricing, annual billing, or implementation services? Contact us for a custom quote.
            </p>
            <div className="mt-4">
              <Link className="text-sm font-semibold text-emerald-700" href="/contact">
                Contact Sales
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
