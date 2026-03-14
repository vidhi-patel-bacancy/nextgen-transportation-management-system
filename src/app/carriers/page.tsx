"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveDataTable } from "@/components/tables/responsive-data-table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { hasRole } from "@/lib/auth/permissions";
import { listCarriers } from "@/services/carriersService";

export default function CarriersPage() {
  const { data: carriers = [] } = useQuery({ queryKey: ["carriers"], queryFn: listCarriers });
  const { role } = useAuth();

  return (
    <AppShell>
      <PageHeader
        title="Carriers"
        description="Manage contracted carriers and their transport capabilities."
        actions={
          hasRole(role, ["admin", "manager"]) ? (
            <Link href="/carriers/new">
              <Button>Add Carrier</Button>
            </Link>
          ) : null
        }
      />
      <ResponsiveDataTable
        title="Carrier List"
        data={carriers}
        searchableKeys={["company_name", "contact_email", "transport_type", "phone"]}
        columns={[
          { key: "company_name", label: "Company", sortable: true },
          { key: "contact_email", label: "Email", sortable: true },
          { key: "phone", label: "Phone", sortable: true },
          { key: "transport_type", label: "Transport", sortable: true },
          {
            key: "id",
            label: "Actions",
            render: (row) => (
              <Link className="font-semibold text-cyan-700" href={`/carriers/${row.id}`}>
                Details
              </Link>
            ),
          },
        ]}
      />
    </AppShell>
  );
}
