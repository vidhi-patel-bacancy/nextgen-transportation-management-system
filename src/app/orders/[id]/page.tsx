"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { OrderForm, type OrderFormValues } from "@/components/forms/order-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { hasRole } from "@/lib/auth/permissions";
import { deleteOrder, getOrderById, updateOrder } from "@/services/ordersService";

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = params.id;
  const { role } = useAuth();

  const { data: order } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderById(orderId),
  });

  const updateMutation = useMutation({
    mutationFn: async (values: OrderFormValues) =>
      updateOrder(orderId, {
        origin: values.origin,
        destination: values.destination,
        product: values.product,
        weight: values.weight,
        status: values.status,
        delivery_date: values.delivery_date ? new Date(values.delivery_date).toISOString() : null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => deleteOrder(orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      router.push("/orders");
    },
  });

  return (
    <AppShell>
      <PageHeader
        title="Order Details"
        description="Update order data or remove the order."
        actions={
          hasRole(role, ["admin", "manager"]) ? (
            <Button variant="danger" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete Order"}
            </Button>
          ) : null
        }
      />
      <Card>
        {order ? (
          <OrderForm
            defaultValues={{
              origin: order.origin,
              destination: order.destination,
              product: order.product,
              weight: order.weight,
              status: order.status,
              delivery_date: order.delivery_date?.slice(0, 10) ?? "",
            }}
            submitting={updateMutation.isPending}
            onSubmit={async (values) => {
              await updateMutation.mutateAsync(values);
            }}
          />
        ) : (
          <p className="text-sm text-slate-500">Loading order...</p>
        )}
        {updateMutation.error ? <p className="mt-3 text-sm text-rose-700">{(updateMutation.error as Error).message}</p> : null}
      </Card>
    </AppShell>
  );
}
