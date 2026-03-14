"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { OrderForm, type OrderFormValues } from "@/components/forms/order-form";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { createOrder } from "@/services/ordersService";

export default function NewOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async (values: OrderFormValues) => {
      if (!user?.id) {
        throw new Error("User session not available.");
      }

      return createOrder({
        customer_id: user.id,
        origin: values.origin,
        destination: values.destination,
        product: values.product,
        weight: values.weight,
        status: values.status,
        delivery_date: values.delivery_date ? new Date(values.delivery_date).toISOString() : null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      router.push("/orders");
    },
  });

  return (
    <AppShell>
      <PageHeader title="Create Order" description="Register a new customer order for shipment planning." />
      <Card>
        <OrderForm
          onSubmit={async (values) => {
            await mutation.mutateAsync(values);
          }}
          submitting={mutation.isPending}
        />
        {mutation.error ? <p className="mt-3 text-sm text-rose-700">{(mutation.error as Error).message}</p> : null}
      </Card>
    </AppShell>
  );
}
