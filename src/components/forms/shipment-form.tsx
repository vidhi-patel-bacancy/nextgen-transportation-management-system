"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Database } from "@/types/supabase";

const schema = z.object({
  order_id: z.string().uuid(),
  carrier_id: z.string().uuid(),
  tracking_number: z.string().min(4),
  status: z.enum(["created", "assigned", "in_transit", "delivered", "exception"]),
  estimated_delivery: z.string().optional(),
});

export type ShipmentFormValues = z.infer<typeof schema>;

interface ShipmentFormProps {
  orders: Database["public"]["Tables"]["orders"]["Row"][];
  carriers: Database["public"]["Tables"]["carriers"]["Row"][];
  submitting?: boolean;
  onSubmit: (values: ShipmentFormValues) => Promise<void>;
}

export function ShipmentForm({ orders, carriers, submitting, onSubmit }: ShipmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShipmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      order_id: orders[0]?.id ?? "",
      carrier_id: carriers[0]?.id ?? "",
      tracking_number: "",
      status: "created",
      estimated_delivery: "",
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit((values) => onSubmit(values))}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Order</Label>
          <Select {...register("order_id")}>
            <option value="">Select order</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.origin} to {order.destination}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-rose-600">{errors.order_id?.message}</p>
        </div>
        <div>
          <Label>Carrier</Label>
          <Select {...register("carrier_id")}>
            <option value="">Select carrier</option>
            {carriers.map((carrier) => (
              <option key={carrier.id} value={carrier.id}>
                {carrier.company_name}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-rose-600">{errors.carrier_id?.message}</p>
        </div>
        <div>
          <Label>Tracking Number</Label>
          <Input placeholder="TRK-0000001" {...register("tracking_number")} />
          <p className="mt-1 text-xs text-rose-600">{errors.tracking_number?.message}</p>
        </div>
        <div>
          <Label>Status</Label>
          <Select {...register("status")}>
            <option value="created">Created</option>
            <option value="assigned">Assigned</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="exception">Exception</option>
          </Select>
        </div>
        <div>
          <Label>Estimated Delivery</Label>
          <Input type="datetime-local" {...register("estimated_delivery")} />
        </div>
      </div>
      <Button disabled={submitting} type="submit">
        {submitting ? "Creating..." : "Create Shipment"}
      </Button>
    </form>
  );
}
