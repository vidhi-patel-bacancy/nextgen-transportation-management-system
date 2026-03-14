import Link from "next/link";

import { CheckCircle2 } from "lucide-react";

import { Card } from "@/components/ui/card";

const tiers = [
  {
    name: "Starter",
    price: "$299/mo",
    description: "Best for small operations teams getting started with a cloud TMS.",
    points: ["Up to 1,500 shipments/month", "Orders, shipments, tracking, documents", "Email support"],
  },
  {
    name: "Growth",
    price: "$899/mo",
    description: "For growing shippers and 3PLs with advanced routing and audit workflows.",
    points: ["Up to 10,000 shipments/month", "Rates, invoices, freight audits, routes", "Priority support + onboarding"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For multi-site, high-scale networks with custom integration and SLA requirements.",
    points: ["Unlimited shipment scale", "Custom integrations and SSO", "Dedicated success manager"],
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
      </div>
    </main>
  );
}
