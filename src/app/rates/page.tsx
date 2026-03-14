"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveDataTable } from "@/components/tables/responsive-data-table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { hasRole } from "@/lib/auth/permissions";
import { listCarriers } from "@/services/carriersService";
import { createRate, listRates } from "@/services/ratesApiService";

export default function RatesPage() {
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const canManage = hasRole(role, ["admin", "manager"]);

  const { data: rates = [] } = useQuery({ queryKey: ["rates"], queryFn: listRates });
  const { data: carriers = [] } = useQuery({ queryKey: ["carriers"], queryFn: listCarriers });

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return createRate({
        carrier_id: String(formData.get("carrier_id") || "") || null,
        mode: String(formData.get("mode")) as "ltl" | "ftl" | "parcel" | "rail" | "ocean" | "air",
        origin_region: String(formData.get("origin_region")),
        destination_region: String(formData.get("destination_region")),
        min_weight: Number(formData.get("min_weight") || 0),
        max_weight: Number(formData.get("max_weight") || 0),
        base_amount: Number(formData.get("base_amount") || 0),
        fuel_surcharge_pct: Number(formData.get("fuel_surcharge_pct") || 0),
        currency: String(formData.get("currency") || "USD").toUpperCase(),
        effective_from: String(formData.get("effective_from")),
        effective_to: String(formData.get("effective_to") || "") || null,
        is_active: true,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rates"] });
    },
  });

  return (
    <AppShell>
      <PageHeader title="Rates" description="Maintain lane and mode pricing rules for shipment quoting." />

      {canManage ? (
        <Card className="mb-6">
          <h3 className="mb-3 text-base font-semibold text-slate-900">Create Rate</h3>
          <form
            className="grid gap-3 md:grid-cols-4"
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate(new FormData(event.currentTarget));
              event.currentTarget.reset();
            }}
          >
            <div>
              <Label>Carrier</Label>
              <Select name="carrier_id" defaultValue="">
                <option value="">Any carrier</option>
                {carriers.map((carrier) => (
                  <option key={carrier.id} value={carrier.id}>
                    {carrier.company_name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Mode</Label>
              <Select name="mode" defaultValue="ltl">
                <option value="ltl">LTL</option>
                <option value="ftl">FTL</option>
                <option value="parcel">Parcel</option>
                <option value="rail">Rail</option>
                <option value="ocean">Ocean</option>
                <option value="air">Air</option>
              </Select>
            </div>
            <div>
              <Label>Origin Region</Label>
              <Input name="origin_region" required />
            </div>
            <div>
              <Label>Destination Region</Label>
              <Input name="destination_region" required />
            </div>
            <div>
              <Label>Min Weight</Label>
              <Input name="min_weight" type="number" step="0.01" defaultValue="0" required />
            </div>
            <div>
              <Label>Max Weight</Label>
              <Input name="max_weight" type="number" step="0.01" required />
            </div>
            <div>
              <Label>Base Amount</Label>
              <Input name="base_amount" type="number" step="0.01" required />
            </div>
            <div>
              <Label>Fuel %</Label>
              <Input name="fuel_surcharge_pct" type="number" step="0.01" defaultValue="0" required />
            </div>
            <div>
              <Label>Currency</Label>
              <Input name="currency" defaultValue="USD" required />
            </div>
            <div>
              <Label>Effective From</Label>
              <Input name="effective_from" type="date" required />
            </div>
            <div>
              <Label>Effective To</Label>
              <Input name="effective_to" type="date" />
            </div>
            <div className="self-end">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save Rate"}
              </Button>
            </div>
          </form>
          {mutation.error ? <p className="mt-3 text-sm text-rose-700">{(mutation.error as Error).message}</p> : null}
        </Card>
      ) : null}

      <ResponsiveDataTable
        title="Rate Cards"
        data={rates}
        searchableKeys={["origin_region", "destination_region", "mode", "currency"]}
        columns={[
          { key: "mode", label: "Mode", sortable: true },
          { key: "origin_region", label: "Origin", sortable: true },
          { key: "destination_region", label: "Destination", sortable: true },
          { key: "min_weight", label: "Min Wt", sortable: true },
          { key: "max_weight", label: "Max Wt", sortable: true },
          { key: "base_amount", label: "Base", sortable: true },
          { key: "fuel_surcharge_pct", label: "Fuel %", sortable: true },
          { key: "currency", label: "Currency", sortable: true },
        ]}
      />
    </AppShell>
  );
}
