"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveDataTable } from "@/components/tables/responsive-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";
import { listOrders } from "@/services/ordersService";

export default function OrdersPage() {
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: listOrders,
  });

  return (
    <AppShell>
      <PageHeader
        title="Orders"
        description="Manage freight orders, destinations, and product details."
        actions={
          <Link href="/orders/new">
            <Button>Create Order</Button>
          </Link>
        }
      />

      <ResponsiveDataTable
        title="Order List"
        data={orders}
        searchableKeys={["origin", "destination", "product", "status"]}
        columns={[
          { key: "origin", label: "Origin", sortable: true },
          { key: "destination", label: "Destination", sortable: true },
          { key: "product", label: "Product", sortable: true },
          {
            key: "status",
            label: "Status",
            sortable: true,
            render: (row) => <Badge value={row.status} />,
          },
          {
            key: "delivery_date",
            label: "Delivery Date",
            sortable: true,
            render: (row) => formatDate(row.delivery_date),
          },
          {
            key: "id",
            label: "Actions",
            render: (row) => (
              <Link className="font-semibold text-cyan-700" href={`/orders/${row.id}`}>
                View
              </Link>
            ),
          },
        ]}
      />
    </AppShell>
  );
}
