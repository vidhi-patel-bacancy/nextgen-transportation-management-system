"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TrackingEventForm, type TrackingEventFormValues } from "@/components/forms/tracking-event-form";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { TrackingTimeline } from "@/components/dashboard/tracking-timeline";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { listShipments } from "@/services/shipmentsService";
import { createTrackingEvent, listTrackingEvents } from "@/services/trackingService";

export default function TrackingPage() {
  const queryClient = useQueryClient();
  const { data: shipments = [] } = useQuery({ queryKey: ["shipments"], queryFn: listShipments });
  const [selectedShipment, setSelectedShipment] = useState<string>("all");

  const { data: events = [] } = useQuery({
    queryKey: ["tracking-events", selectedShipment],
    queryFn: () => listTrackingEvents(selectedShipment === "all" ? undefined : selectedShipment),
  });

  const mutation = useMutation({
    mutationFn: async (values: TrackingEventFormValues) => {
      if (selectedShipment === "all") {
        throw new Error("Select a shipment before adding events.");
      }

      return createTrackingEvent({
        shipment_id: selectedShipment,
        status: values.status,
        location: values.location,
        timestamp: new Date(values.timestamp).toISOString(),
        notes: values.notes || null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tracking-events", selectedShipment] });
      await queryClient.invalidateQueries({ queryKey: ["tracking-events", "all"] });
    },
  });

  const selectedLabel = useMemo(
    () => shipments.find((item) => item.id === selectedShipment)?.tracking_number ?? "All Shipments",
    [selectedShipment, shipments],
  );

  return (
    <AppShell>
      <PageHeader title="Tracking" description="Track shipment milestones and add operational updates." />
      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        <Card>
          <div className="mb-4">
            <Label>Shipment</Label>
            <Select value={selectedShipment} onChange={(event) => setSelectedShipment(event.target.value)}>
              <option value="all">All Shipments</option>
              {shipments.map((shipment) => (
                <option key={shipment.id} value={shipment.id}>
                  {shipment.tracking_number}
                </option>
              ))}
            </Select>
          </div>
          <h3 className="mb-3 text-base font-semibold text-slate-900">Add Tracking Event</h3>
          <TrackingEventForm
            submitting={mutation.isPending}
            onSubmit={async (values) => {
              await mutation.mutateAsync(values);
            }}
          />
          {mutation.error ? <p className="mt-3 text-sm text-rose-700">{(mutation.error as Error).message}</p> : null}
        </Card>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">{selectedLabel} timeline</p>
          <TrackingTimeline events={events} />
        </div>
      </div>
    </AppShell>
  );
}
