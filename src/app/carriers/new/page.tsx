"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CarrierForm, type CarrierFormValues } from "@/components/forms/carrier-form";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { createCarrier } from "@/services/carriersService";

export default function NewCarrierPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: CarrierFormValues) => createCarrier(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["carriers"] });
      router.push("/carriers");
    },
  });

  return (
    <AppShell>
      <PageHeader title="Add Carrier" description="Register a carrier to assign shipments." />
      <Card>
        <CarrierForm
          submitting={mutation.isPending}
          onSubmit={async (values) => {
            await mutation.mutateAsync(values);
          }}
        />
        {mutation.error ? <p className="mt-3 text-sm text-rose-700">{(mutation.error as Error).message}</p> : null}
      </Card>
    </AppShell>
  );
}
