"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const schema = z.object({
  origin: z.string().min(2),
  destination: z.string().min(2),
  product: z.string().min(2),
  weight: z.number().positive(),
  delivery_date: z.string().optional(),
  status: z.enum(["pending", "confirmed", "cancelled"]),
});

export type OrderFormValues = z.infer<typeof schema>;

interface OrderFormProps {
  defaultValues?: Partial<OrderFormValues>;
  submitting?: boolean;
  onSubmit: (values: OrderFormValues) => Promise<void>;
}

export function OrderForm({ defaultValues, submitting, onSubmit }: OrderFormProps) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      origin: "",
      destination: "",
      product: "",
      weight: 1,
      delivery_date: "",
      status: "pending",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        origin: defaultValues.origin ?? "",
        destination: defaultValues.destination ?? "",
        product: defaultValues.product ?? "",
        weight: defaultValues.weight ?? 1,
        delivery_date: defaultValues.delivery_date ?? "",
        status: defaultValues.status ?? "pending",
      });
    }
  }, [defaultValues, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit((values) => onSubmit(values))}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Origin</Label>
          <Input placeholder="Origin city or warehouse" {...register("origin")} />
          <p className="mt-1 text-xs text-rose-600">{errors.origin?.message}</p>
        </div>
        <div>
          <Label>Destination</Label>
          <Input placeholder="Destination city or warehouse" {...register("destination")} />
          <p className="mt-1 text-xs text-rose-600">{errors.destination?.message}</p>
        </div>
        <div>
          <Label>Product</Label>
          <Input placeholder="Product description" {...register("product")} />
          <p className="mt-1 text-xs text-rose-600">{errors.product?.message}</p>
        </div>
        <div>
          <Label>Weight (kg)</Label>
          <Input type="number" step="0.01" {...register("weight", { valueAsNumber: true })} />
          <p className="mt-1 text-xs text-rose-600">{errors.weight?.message}</p>
        </div>
        <div>
          <Label>Delivery Date</Label>
          <Input type="date" {...register("delivery_date")} />
        </div>
        <div>
          <Label>Status</Label>
          <Select {...register("status")}>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>
      <Button disabled={submitting} type="submit">
        {submitting ? "Saving..." : "Save Order"}
      </Button>
    </form>
  );
}
