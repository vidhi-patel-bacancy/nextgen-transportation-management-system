"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CarrierForm, type CarrierFormValues } from "@/components/forms/carrier-form";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getCarrierById, updateCarrier } from "@/services/carriersService";

export default function CarrierDetailsPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const carrierId = params.id;

  const { data: carrier } = useQuery({
    queryKey: ["carrier", carrierId],
    queryFn: () => getCarrierById(carrierId),
  });

  const mutation = useMutation({
    mutationFn: async (values: CarrierFormValues) => updateCarrier(carrierId, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["carriers"] });
      await queryClient.invalidateQueries({ queryKey: ["carrier", carrierId] });
    },
  });

  return (
    <AppShell>
      <PageHeader title="Carrier Details" description="Edit carrier profile and contact data." />
      <Card>
        {carrier ? (
          <CarrierForm
            defaultValues={{
              company_name: carrier.company_name,
              contact_email: carrier.contact_email,
              phone: carrier.phone,
              transport_type: carrier.transport_type,
            }}
            submitting={mutation.isPending}
            onSubmit={async (values) => {
              await mutation.mutateAsync(values);
            }}
          />
        ) : (
          <p className="text-sm text-slate-500">Loading carrier details...</p>
        )}
        {mutation.error ? <p className="mt-3 text-sm text-rose-700">{(mutation.error as Error).message}</p> : null}
      </Card>
    </AppShell>
  );
}
