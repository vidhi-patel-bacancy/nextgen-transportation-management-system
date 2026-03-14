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
import { formatDate } from "@/lib/utils/format";
import { listCarriers } from "@/services/carriersService";
import { createFreightAudit, createInvoice, createPayment, listFreightAudits, listInvoices, listPayments } from "@/services/invoicesApiService";
import { listShipments } from "@/services/shipmentsService";

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const canCreate = hasRole(role, ["admin", "manager", "carrier"]);
  const canAuditOrPay = hasRole(role, ["admin", "manager"]);

  const { data: invoices = [] } = useQuery({ queryKey: ["invoices"], queryFn: listInvoices });
  const { data: audits = [] } = useQuery({ queryKey: ["freight-audits"], queryFn: listFreightAudits, enabled: canAuditOrPay });
  const { data: payments = [] } = useQuery({ queryKey: ["payments"], queryFn: listPayments, enabled: canAuditOrPay });
  const { data: shipments = [] } = useQuery({ queryKey: ["shipments"], queryFn: listShipments });
  const { data: carriers = [] } = useQuery({ queryKey: ["carriers"], queryFn: listCarriers });

  const mutation = useMutation({
    mutationFn: async (formData: FormData) =>
      createInvoice({
        shipment_id: String(formData.get("shipment_id") || "") || null,
        carrier_id: String(formData.get("carrier_id") || "") || null,
        invoice_number: String(formData.get("invoice_number")),
        billed_amount: Number(formData.get("billed_amount") || 0),
        currency: String(formData.get("currency") || "USD").toUpperCase(),
        status: "received",
        due_date: String(formData.get("due_date") || "") || null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const auditMutation = useMutation({
    mutationFn: async (formData: FormData) =>
      createFreightAudit({
        invoice_id: String(formData.get("invoice_id")),
        status: String(formData.get("status")) as "pending" | "in_review" | "approved" | "rejected",
        discrepancy_amount: Number(formData.get("discrepancy_amount") || 0),
        notes: String(formData.get("notes") || "") || null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["freight-audits"] });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (formData: FormData) =>
      createPayment({
        invoice_id: String(formData.get("invoice_id")),
        paid_amount: Number(formData.get("paid_amount") || 0),
        currency: String(formData.get("currency") || "USD"),
        payment_method: String(formData.get("payment_method")) as "ach" | "wire" | "card" | "other",
        payment_reference: String(formData.get("payment_reference") || "") || null,
        paid_at: String(formData.get("paid_at")),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });

  return (
    <AppShell>
      <PageHeader title="Invoices" description="Capture freight invoices and run audit/payment workflows." />

      {canCreate ? (
        <Card className="mb-6">
          <h3 className="mb-3 text-base font-semibold text-slate-900">Create Invoice</h3>
          <form
            className="grid gap-3 md:grid-cols-4"
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate(new FormData(event.currentTarget));
              event.currentTarget.reset();
            }}
          >
            <div>
              <Label>Invoice Number</Label>
              <Input name="invoice_number" required />
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
              <Label>Carrier</Label>
              <Select name="carrier_id" defaultValue="">
                <option value="">Not linked</option>
                {carriers.map((carrier) => (
                  <option key={carrier.id} value={carrier.id}>
                    {carrier.company_name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Billed Amount</Label>
              <Input name="billed_amount" type="number" step="0.01" required />
            </div>
            <div>
              <Label>Currency</Label>
              <Input name="currency" defaultValue="USD" required />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input name="due_date" type="date" />
            </div>
            <div className="self-end">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save Invoice"}
              </Button>
            </div>
          </form>
          {mutation.error ? <p className="mt-3 text-sm text-rose-700">{(mutation.error as Error).message}</p> : null}
        </Card>
      ) : null}

      <ResponsiveDataTable
        title="Invoice Register"
        data={invoices}
        searchableKeys={["invoice_number", "status", "currency"]}
        columns={[
          { key: "invoice_number", label: "Invoice #", sortable: true },
          { key: "billed_amount", label: "Billed", sortable: true },
          { key: "audited_amount", label: "Audited", sortable: true },
          { key: "currency", label: "Currency", sortable: true },
          {
            key: "status",
            label: "Status",
            sortable: true,
            render: (row) => <Badge value={row.status} />,
          },
          {
            key: "due_date",
            label: "Due Date",
            sortable: true,
            render: (row) => formatDate(row.due_date),
          },
        ]}
      />

      {canAuditOrPay ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-3 text-base font-semibold text-slate-900">Create Freight Audit</h3>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                auditMutation.mutate(new FormData(event.currentTarget));
                event.currentTarget.reset();
              }}
            >
              <div>
                <Label>Invoice</Label>
                <Select name="invoice_id" required defaultValue="">
                  <option value="" disabled>
                    Select invoice
                  </option>
                  {invoices.map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoice_number}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select name="status" defaultValue="pending">
                  <option value="pending">Pending</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </div>
              <div>
                <Label>Discrepancy Amount</Label>
                <Input name="discrepancy_amount" type="number" step="0.01" defaultValue="0" required />
              </div>
              <div>
                <Label>Notes</Label>
                <Input name="notes" />
              </div>
              <Button type="submit" disabled={auditMutation.isPending}>
                {auditMutation.isPending ? "Saving..." : "Save Audit"}
              </Button>
            </form>
          </Card>

          <Card>
            <h3 className="mb-3 text-base font-semibold text-slate-900">Create Payment</h3>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                paymentMutation.mutate(new FormData(event.currentTarget));
                event.currentTarget.reset();
              }}
            >
              <div>
                <Label>Invoice</Label>
                <Select name="invoice_id" required defaultValue="">
                  <option value="" disabled>
                    Select invoice
                  </option>
                  {invoices.map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoice_number}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Paid Amount</Label>
                <Input name="paid_amount" type="number" step="0.01" required />
              </div>
              <div>
                <Label>Currency</Label>
                <Input name="currency" defaultValue="USD" required />
              </div>
              <div>
                <Label>Method</Label>
                <Select name="payment_method" defaultValue="ach">
                  <option value="ach">ACH</option>
                  <option value="wire">Wire</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <div>
                <Label>Paid At</Label>
                <Input name="paid_at" type="datetime-local" required />
              </div>
              <div>
                <Label>Reference</Label>
                <Input name="payment_reference" />
              </div>
              <Button type="submit" disabled={paymentMutation.isPending}>
                {paymentMutation.isPending ? "Saving..." : "Save Payment"}
              </Button>
            </form>
          </Card>
        </div>
      ) : null}

      {canAuditOrPay ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ResponsiveDataTable
            title="Freight Audits"
            data={audits}
            searchableKeys={["status", "notes", "invoice_id"]}
            columns={[
              { key: "invoice_id", label: "Invoice Id", sortable: true },
              { key: "status", label: "Status", sortable: true, render: (row) => <Badge value={row.status} /> },
              { key: "match_confidence", label: "Confidence %", sortable: true },
              { key: "expected_amount", label: "Expected", sortable: true },
              { key: "tolerance_amount", label: "Tolerance", sortable: true },
              { key: "discrepancy_amount", label: "Discrepancy", sortable: true },
              { key: "audited_at", label: "Audited At", sortable: true, render: (row) => formatDate(row.audited_at) },
            ]}
          />
          <ResponsiveDataTable
            title="Payments"
            data={payments}
            searchableKeys={["payment_method", "payment_reference", "invoice_id"]}
            columns={[
              { key: "invoice_id", label: "Invoice Id", sortable: true },
              { key: "paid_amount", label: "Amount", sortable: true },
              { key: "currency", label: "Currency", sortable: true },
              { key: "payment_method", label: "Method", sortable: true },
              { key: "paid_at", label: "Paid At", sortable: true, render: (row) => formatDate(row.paid_at) },
            ]}
          />
        </div>
      ) : null}
    </AppShell>
  );
}
