"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveDataTable } from "@/components/tables/responsive-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { hasRole } from "@/lib/auth/permissions";
import { listShipments } from "@/services/shipmentsService";
import { createLoadPlan, createRoutePlan, listLoadPlans, listRoutePlans, optimizeRoutePlan } from "@/services/routesApiService";

export default function RoutesPage() {
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const canManage = hasRole(role, ["admin", "manager", "carrier"]);

  const { data: shipments = [] } = useQuery({ queryKey: ["shipments"], queryFn: listShipments });
  const { data: routes = [] } = useQuery({ queryKey: ["routes"], queryFn: listRoutePlans });
  const { data: loadPlans = [] } = useQuery({ queryKey: ["load-plans"], queryFn: listLoadPlans });

  const routeMutation = useMutation({
    mutationFn: async (formData: FormData) =>
      createRoutePlan({
        shipment_id: String(formData.get("shipment_id") || "") || null,
        origin: String(formData.get("origin")),
        destination: String(formData.get("destination")),
        mode: String(formData.get("mode")) as "ltl" | "ftl" | "parcel" | "rail" | "ocean" | "air",
        distance_km: Number(formData.get("distance_km") || 0),
        estimated_duration_hours: Number(formData.get("estimated_duration_hours") || 0),
        status: "draft",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });

  const loadMutation = useMutation({
    mutationFn: async (formData: FormData) =>
      createLoadPlan({
        route_plan_id: String(formData.get("route_plan_id") || "") || null,
        shipment_id: String(formData.get("shipment_id") || "") || null,
        load_reference: String(formData.get("load_reference")),
        capacity_weight: Number(formData.get("capacity_weight") || 0),
        utilized_weight: Number(formData.get("utilized_weight") || 0),
        status: "draft",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["load-plans"] });
    },
  });

  const optimizeMutation = useMutation({
    mutationFn: async (routeId: string) => optimizeRoutePlan(routeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });

  return (
    <AppShell>
      <PageHeader title="Routes & Load Planning" description="Create optimized route plans and capacity-based load plans." />

      {canManage ? (
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-3 text-base font-semibold text-slate-900">Create Route Plan</h3>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                routeMutation.mutate(new FormData(event.currentTarget));
                event.currentTarget.reset();
              }}
            >
              <div>
                <Label>Shipment</Label>
                <Select name="shipment_id" defaultValue="">
                  <option value="">Not linked</option>
                  {shipments.map((shipment) => (
                    <option key={shipment.id} value={shipment.id}>
                      {shipment.tracking_number}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Origin</Label>
                  <Input name="origin" required />
                </div>
                <div>
                  <Label>Destination</Label>
                  <Input name="destination" required />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
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
                  <Label>Distance (km)</Label>
                  <Input name="distance_km" type="number" step="0.01" required />
                </div>
                <div>
                  <Label>Duration (hrs)</Label>
                  <Input name="estimated_duration_hours" type="number" step="0.01" required />
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Optimization score is calculated automatically from mode, distance, duration, and route stop complexity.
              </p>
              <Button type="submit" disabled={routeMutation.isPending}>
                {routeMutation.isPending ? "Saving..." : "Save Route"}
              </Button>
            </form>
          </Card>

          <Card>
            <h3 className="mb-3 text-base font-semibold text-slate-900">Create Load Plan</h3>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                loadMutation.mutate(new FormData(event.currentTarget));
                event.currentTarget.reset();
              }}
            >
              <div>
                <Label>Route Plan</Label>
                <Select name="route_plan_id" defaultValue="">
                  <option value="">Not linked</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.origin} to {route.destination}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Shipment</Label>
                <Select name="shipment_id" defaultValue="">
                  <option value="">Not linked</option>
                  {shipments.map((shipment) => (
                    <option key={shipment.id} value={shipment.id}>
                      {shipment.tracking_number}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Load Reference</Label>
                <Input name="load_reference" required />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Capacity Weight</Label>
                  <Input name="capacity_weight" type="number" step="0.01" required />
                </div>
                <div>
                  <Label>Utilized Weight</Label>
                  <Input name="utilized_weight" type="number" step="0.01" defaultValue="0" required />
                </div>
              </div>
              <Button type="submit" disabled={loadMutation.isPending}>
                {loadMutation.isPending ? "Saving..." : "Save Load Plan"}
              </Button>
            </form>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <ResponsiveDataTable
          title="Route Plans"
          data={routes}
          searchableKeys={["origin", "destination", "mode", "status"]}
          columns={[
            { key: "origin", label: "Origin", sortable: true },
            { key: "destination", label: "Destination", sortable: true },
            { key: "mode", label: "Mode", sortable: true },
            {
              key: "status",
              label: "Status",
              sortable: true,
              render: (row) => <Badge value={row.status} />,
            },
            { key: "distance_km", label: "Distance (km)", sortable: true },
            { key: "optimization_score", label: "Score", sortable: true },
            {
              key: "id",
              label: "Actions",
              render: (row) => (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={optimizeMutation.isPending}
                  onClick={() => optimizeMutation.mutate(row.id)}
                >
                  Optimize
                </Button>
              ),
            },
          ]}
        />

        <ResponsiveDataTable
          title="Load Plans"
          data={loadPlans}
          searchableKeys={["load_reference", "status"]}
          columns={[
            { key: "load_reference", label: "Reference", sortable: true },
            {
              key: "status",
              label: "Status",
              sortable: true,
              render: (row) => <Badge value={row.status} />,
            },
            { key: "capacity_weight", label: "Capacity", sortable: true },
            { key: "utilized_weight", label: "Utilized", sortable: true },
          ]}
        />
      </div>
    </AppShell>
  );
}
