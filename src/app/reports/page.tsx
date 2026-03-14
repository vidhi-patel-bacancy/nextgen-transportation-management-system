"use client";

import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getCarrierPerformance, getOnTimeDeliveryRate, getShipmentsPerMonth } from "@/services/reportsService";

export default function ReportsPage() {
  const { data: monthly = [] } = useQuery({
    queryKey: ["report-monthly-shipments"],
    queryFn: getShipmentsPerMonth,
  });
  const { data: onTimeDelivery = 0 } = useQuery({
    queryKey: ["report-on-time"],
    queryFn: getOnTimeDeliveryRate,
  });
  const { data: carrierPerformance = [] } = useQuery({
    queryKey: ["report-carrier-performance"],
    queryFn: getCarrierPerformance,
  });

  const maxMonthly = Math.max(1, ...monthly.map((item) => item.count));

  return (
    <AppShell>
      <PageHeader title="Reports" description="Operational analytics for shipment throughput and performance." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">On-time Delivery</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{onTimeDelivery}%</p>
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="mb-3 text-base font-semibold text-slate-900">Shipments per Month</h3>
          <div className="space-y-3">
            {monthly.map((item) => (
              <div key={item.month} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.month}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-cyan-700" style={{ width: `${(item.count / maxMonthly) * 100}%` }} />
                </div>
              </div>
            ))}
            {monthly.length === 0 ? <p className="text-sm text-slate-500">No data available.</p> : null}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h3 className="mb-3 text-base font-semibold text-slate-900">Carrier Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-600">
              <tr>
                <th className="px-3 py-2">Carrier</th>
                <th className="px-3 py-2">Total Shipments</th>
                <th className="px-3 py-2">Delivered</th>
                <th className="px-3 py-2">On-time %</th>
              </tr>
            </thead>
            <tbody>
              {carrierPerformance.map((item) => (
                <tr key={item.carrierName} className="border-t">
                  <td className="px-3 py-2">{item.carrierName}</td>
                  <td className="px-3 py-2">{item.total}</td>
                  <td className="px-3 py-2">{item.delivered}</td>
                  <td className="px-3 py-2">{item.onTimeRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
