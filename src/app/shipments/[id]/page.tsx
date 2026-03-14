"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DocumentUploadForm } from "@/components/forms/document-upload-form";
import { TrackingEventForm, type TrackingEventFormValues } from "@/components/forms/tracking-event-form";
import { TrackingTimeline } from "@/components/dashboard/tracking-timeline";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/utils/format";
import { uploadDocumentFile } from "@/lib/api/documents";
import { listCarriers } from "@/services/carriersService";
import { createDocument, listDocuments } from "@/services/documentsService";
import { getShipmentById, updateShipment } from "@/services/shipmentsService";
import { createTrackingEvent, listTrackingEvents } from "@/services/trackingService";

export default function ShipmentDetailsPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const shipmentId = params.id;

  const { data: shipment } = useQuery({
    queryKey: ["shipment", shipmentId],
    queryFn: () => getShipmentById(shipmentId),
  });
  const { data: carriers = [] } = useQuery({
    queryKey: ["carriers"],
    queryFn: listCarriers,
  });
  const { data: events = [] } = useQuery({
    queryKey: ["tracking-events", shipmentId],
    queryFn: () => listTrackingEvents(shipmentId),
  });
  const { data: documents = [] } = useQuery({
    queryKey: ["documents", shipmentId],
    queryFn: () => listDocuments(shipmentId),
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const carrierId = String(formData.get("carrier_id"));
      const status = String(formData.get("status"));
      const estimatedDelivery = String(formData.get("estimated_delivery"));

      return updateShipment(shipmentId, {
        carrier_id: carrierId,
        status: status as "created" | "assigned" | "in_transit" | "delivered" | "exception",
        estimated_delivery: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shipment", shipmentId] });
      await queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
  });

  const trackingMutation = useMutation({
    mutationFn: async (values: TrackingEventFormValues) =>
      createTrackingEvent({
        shipment_id: shipmentId,
        status: values.status,
        location: values.location,
        timestamp: new Date(values.timestamp).toISOString(),
        notes: values.notes || null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tracking-events", shipmentId] });
    },
  });

  const documentMutation = useMutation({
    mutationFn: async (payload: { file: File; documentType: "bill_of_lading" | "invoice" | "proof_of_delivery" }) => {
      const uploaded = await uploadDocumentFile(payload.file);
      return createDocument({
        shipment_id: shipmentId,
        document_type: payload.documentType,
        file_url: uploaded.url,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["documents", shipmentId] });
    },
  });

  return (
    <AppShell>
      <PageHeader
        title={`Shipment ${shipment?.tracking_number ?? ""}`}
        description="Manage status, tracking events, and shipment documents."
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <Card>
          <h3 className="mb-4 text-base font-semibold text-slate-900">Shipment Configuration</h3>
          {shipment ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                updateMutation.mutate(new FormData(event.currentTarget));
              }}
            >
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Tracking Number</Label>
                  <Input value={shipment.tracking_number} disabled />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select defaultValue={shipment.status} name="status">
                    <option value="created">Created</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="exception">Exception</option>
                  </Select>
                </div>
                <div>
                  <Label>Carrier</Label>
                  <Select defaultValue={shipment.carrier_id} name="carrier_id">
                    {carriers.map((carrier) => (
                      <option key={carrier.id} value={carrier.id}>
                        {carrier.company_name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Estimated Delivery</Label>
                  <Input
                    type="datetime-local"
                    defaultValue={shipment.estimated_delivery ? shipment.estimated_delivery.slice(0, 16) : ""}
                    name="estimated_delivery"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button disabled={updateMutation.isPending} type="submit">
                  {updateMutation.isPending ? "Updating..." : "Update Shipment"}
                </Button>
                <Badge value={shipment.status} />
              </div>
            </form>
          ) : (
            <p className="text-sm text-slate-500">Loading shipment...</p>
          )}
        </Card>

        <Card>
          <h3 className="mb-3 text-base font-semibold text-slate-900">Documents</h3>
          <DocumentUploadForm
            submitting={documentMutation.isPending}
            onSubmit={async (payload) => {
              await documentMutation.mutateAsync(payload);
            }}
          />
          <div className="mt-4 space-y-2">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                href={doc.file_url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
              >
                <p className="font-semibold text-slate-800">{doc.document_type.replaceAll("_", " ")}</p>
                <p className="text-xs text-slate-500">Uploaded {formatDate(doc.uploaded_at)}</p>
              </Link>
            ))}
            {documents.length === 0 ? <p className="text-sm text-slate-500">No documents uploaded yet.</p> : null}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr,1fr]">
        <Card>
          <h3 className="mb-3 text-base font-semibold text-slate-900">Add Tracking Event</h3>
          <TrackingEventForm
            submitting={trackingMutation.isPending}
            onSubmit={async (values) => {
              await trackingMutation.mutateAsync(values);
            }}
          />
        </Card>
        <TrackingTimeline events={events} />
      </div>
    </AppShell>
  );
}
