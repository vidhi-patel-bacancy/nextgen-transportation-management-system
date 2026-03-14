"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ShipmentForm, type ShipmentFormValues } from "@/components/forms/shipment-form";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveDataTable } from "@/components/tables/responsive-data-table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { hasRole } from "@/lib/auth/permissions";
import { listOrders } from "@/services/ordersService";
import { listCarriers } from "@/services/carriersService";
import { createShipment, listShipments } from "@/services/shipmentsService";
import { formatDate } from "@/lib/utils/format";

export default function ShipmentsPage() {
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const { data: shipments = [] } = useQuery({ queryKey: ["shipments"], queryFn: listShipments });
  const { data: orders = [] } = useQuery({ queryKey: ["orders"], queryFn: listOrders });
  const { data: carriers = [] } = useQuery({ queryKey: ["carriers"], queryFn: listCarriers });

  const mutation = useMutation({
    mutationFn: async (values: ShipmentFormValues) =>
      createShipment({
        order_id: values.order_id,
        carrier_id: values.carrier_id,
        tracking_number: values.tracking_number,
        status: values.status,
        estimated_delivery: values.estimated_delivery ? new Date(values.estimated_delivery).toISOString() : null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
  });

  const orderMap = new Map(orders.map((order) => [order.id, `${order.origin} to ${order.destination}`]));
  const carrierMap = new Map(carriers.map((carrier) => [carrier.id, carrier.company_name]));

  return (
    <AppShell>
      <PageHeader title="Shipments" description="Create shipments from orders, assign carriers, and monitor movement." />

      {hasRole(role, ["admin", "manager"]) ? (
        <Card className="mb-6">
          <h3 className="mb-3 text-base font-semibold text-slate-900">Create Shipment</h3>
          <ShipmentForm
            orders={orders}
            carriers={carriers}
            submitting={mutation.isPending}
            onSubmit={async (values) => {
              await mutation.mutateAsync(values);
            }}
          />
          {mutation.error ? <p className="mt-3 text-sm text-rose-700">{(mutation.error as Error).message}</p> : null}
        </Card>
      ) : null}

      <ResponsiveDataTable
        title="Shipment List"
        data={shipments}
        searchableKeys={["tracking_number", "status", "order_id"]}
        columns={[
          { key: "tracking_number", label: "Tracking #", sortable: true },
          {
            key: "order_id",
            label: "Order",
            sortable: true,
            render: (row) => orderMap.get(row.order_id) ?? row.order_id.slice(0, 8),
          },
          {
            key: "carrier_id",
            label: "Carrier",
            sortable: true,
            render: (row) => carrierMap.get(row.carrier_id) ?? row.carrier_id.slice(0, 8),
          },
          {
            key: "status",
            label: "Status",
            sortable: true,
            render: (row) => <Badge value={row.status} />,
          },
          {
            key: "estimated_delivery",
            label: "ETA",
            sortable: true,
            render: (row) => formatDate(row.estimated_delivery),
          },
          {
            key: "id",
            label: "Actions",
            render: (row) => (
              <Link className="font-semibold text-cyan-700" href={`/shipments/${row.id}`}>
                View
              </Link>
            ),
          },
        ]}
      />
    </AppShell>
  );
}
