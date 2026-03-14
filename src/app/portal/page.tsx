"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/format";
import { listInvoices } from "@/services/invoicesApiService";
import { listOrders } from "@/services/ordersService";
import { listShipments } from "@/services/shipmentsService";

export default function CustomerPortalPage() {
  const { data: orders } = useQuery({
    queryKey: ["portal-orders"],
    queryFn: listOrders,
  });

  const { data: shipments } = useQuery({
    queryKey: ["portal-shipments"],
    queryFn: listShipments,
  });

  const { data: invoices } = useQuery({
    queryKey: ["portal-invoices"],
    queryFn: listInvoices,
  });

  const totalOrders = orders?.length ?? 0;
  const activeShipments = (shipments ?? []).filter((item) => item.status === "assigned" || item.status === "in_transit").length;
  const deliveredShipments = (shipments ?? []).filter((item) => item.status === "delivered").length;
  const openInvoices = (invoices ?? []).filter((item) => item.status !== "paid").length;

  return (
    <AppShell>
      <section className="mb-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Customer Portal</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">Shipment Visibility and Self-Service</h1>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="My Orders" value={totalOrders} />
        <MetricCard label="Active Shipments" value={activeShipments} accent="from-blue-600 to-sky-600" />
        <MetricCard label="Delivered Shipments" value={deliveredShipments} accent="from-emerald-600 to-teal-600" />
        <MetricCard label="Open Invoices" value={openInvoices} accent="from-amber-600 to-orange-600" />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="border-white/75 bg-white/70">
          <h2 className="mb-3 text-base font-semibold tracking-tight text-slate-900">Recent Shipments</h2>
          <div className="space-y-3">
            {(shipments ?? []).slice(0, 6).map((shipment) => (
              <Link
                key={shipment.id}
                href={`/shipments/${shipment.id}`}
                className="flex items-center justify-between rounded-xl border border-emerald-950/10 bg-white/75 px-3 py-2 transition hover:-translate-y-0.5 hover:border-emerald-600/30 hover:bg-white"
              >
                <div>
                  <p className="font-medium text-slate-900">{shipment.tracking_number}</p>
                  <p className="text-xs text-slate-500">ETA: {shipment.estimated_delivery ? formatDate(shipment.estimated_delivery) : "N/A"}</p>
                </div>
                <Badge value={shipment.status} />
              </Link>
            ))}
            {shipments?.length === 0 ? <p className="text-sm text-slate-500">No shipments available yet.</p> : null}
          </div>
        </Card>

        <Card className="border-white/75 bg-white/70">
          <h2 className="mb-3 text-base font-semibold tracking-tight text-slate-900">Quick Actions</h2>
          <div className="space-y-2 text-sm">
            <Link
              href="/orders/new"
              className="block rounded-xl border border-emerald-900/15 bg-white/80 px-3 py-2 font-semibold text-slate-800 transition hover:bg-emerald-900/5"
            >
              Create New Order
            </Link>
            <Link
              href="/tracking"
              className="block rounded-xl border border-emerald-900/15 bg-white/80 px-3 py-2 font-semibold text-slate-800 transition hover:bg-emerald-900/5"
            >
              Track Shipments
            </Link>
            <Link
              href="/invoices"
              className="block rounded-xl border border-emerald-900/15 bg-white/80 px-3 py-2 font-semibold text-slate-800 transition hover:bg-emerald-900/5"
            >
              Review Invoices
            </Link>
            <Link
              href="/profile"
              className="block rounded-xl border border-emerald-900/15 bg-white/80 px-3 py-2 font-semibold text-slate-800 transition hover:bg-emerald-900/5"
            >
              Update Profile
            </Link>
          </div>
        </Card>
      </section>

      <section className="mt-6">
        <Card className="border-white/75 bg-white/70">
          <h2 className="mb-3 text-base font-semibold tracking-tight text-slate-900">Recent Orders</h2>
          <div className="space-y-3">
            {(orders ?? []).slice(0, 6).map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between rounded-xl border border-emerald-950/10 bg-white/75 px-3 py-2 transition hover:-translate-y-0.5 hover:border-emerald-600/30 hover:bg-white"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {order.origin} to {order.destination}
                  </p>
                  <p className="text-xs text-slate-500">{order.product}</p>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">{order.status}</p>
              </Link>
            ))}
            {orders?.length === 0 ? <p className="text-sm text-slate-500">No orders created yet.</p> : null}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
