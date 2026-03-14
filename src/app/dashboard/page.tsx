"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import { getDashboardMetrics, listShipments } from "@/services/shipmentsService";

export default function DashboardPage() {
  const { data: metrics } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: getDashboardMetrics,
  });

  const { data: recentShipments } = useQuery({
    queryKey: ["dashboard-recent-shipments"],
    queryFn: listShipments,
  });

  return (
    <AppShell>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Shipments" value={metrics?.totalShipments ?? 0} />
        <MetricCard label="Active Shipments" value={metrics?.activeShipments ?? 0} accent="from-blue-600 to-sky-600" />
        <MetricCard label="Delayed Shipments" value={metrics?.delayedShipments ?? 0} accent="from-rose-600 to-orange-600" />
        <MetricCard label="Monthly Shipments" value={metrics?.monthlyShipments ?? 0} accent="from-emerald-600 to-teal-600" />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="border-white/75 bg-white/70">
          <h3 className="mb-3 text-base font-semibold tracking-tight text-slate-900">Latest Shipments</h3>
          <div className="space-y-3">
            {(recentShipments ?? []).slice(0, 8).map((shipment) => (
              <Link
                key={shipment.id}
                href={`/shipments/${shipment.id}`}
                className="flex items-center justify-between rounded-xl border border-emerald-950/10 bg-white/75 px-3 py-2 transition hover:-translate-y-0.5 hover:border-emerald-600/30 hover:bg-white"
              >
                <div>
                  <p className="font-medium text-slate-900">{shipment.tracking_number}</p>
                  <p className="text-xs text-slate-500">{formatDate(shipment.created_at)}</p>
                </div>
                <Badge value={shipment.status} />
              </Link>
            ))}
            {recentShipments?.length === 0 ? <p className="text-sm text-slate-500">No shipments available.</p> : null}
          </div>
        </Card>

        <Card className="border-white/75 bg-white/70">
          <h3 className="mb-3 text-base font-semibold tracking-tight text-slate-900">Quick Actions</h3>
          <div className="space-y-2 text-sm">
            <Link
              href="/orders/new"
              className="block rounded-xl border border-emerald-900/15 bg-white/80 px-3 py-2 font-semibold text-slate-800 transition hover:bg-emerald-900/5"
            >
              Create New Order
            </Link>
            <Link
              href="/shipments"
              className="block rounded-xl border border-emerald-900/15 bg-white/80 px-3 py-2 font-semibold text-slate-800 transition hover:bg-emerald-900/5"
            >
              Assign Shipment
            </Link>
            <Link
              href="/carriers/new"
              className="block rounded-xl border border-emerald-900/15 bg-white/80 px-3 py-2 font-semibold text-slate-800 transition hover:bg-emerald-900/5"
            >
              Add Carrier
            </Link>
            <Link
              href="/reports"
              className="block rounded-xl border border-emerald-900/15 bg-white/80 px-3 py-2 font-semibold text-slate-800 transition hover:bg-emerald-900/5"
            >
              View Reports
            </Link>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
