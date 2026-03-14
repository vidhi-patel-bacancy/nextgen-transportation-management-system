"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const schema = z.object({
  status: z.enum(["pickup", "in_transit", "delay", "delivered"]),
  location: z.string().min(2),
  timestamp: z.string().min(1),
  notes: z.string().optional(),
});

export type TrackingEventFormValues = z.infer<typeof schema>;

export function TrackingEventForm({
  submitting,
  onSubmit,
}: {
  submitting?: boolean;
  onSubmit: (values: TrackingEventFormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TrackingEventFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "pickup",
      location: "",
      timestamp: new Date().toISOString().slice(0, 16),
      notes: "",
    },
  });

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
        reset({
          status: values.status,
          location: "",
          timestamp: new Date().toISOString().slice(0, 16),
          notes: "",
        });
      })}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label>Status</Label>
          <Select {...register("status")}>
            <option value="pickup">Pickup</option>
            <option value="in_transit">In Transit</option>
            <option value="delay">Delay</option>
            <option value="delivered">Delivered</option>
          </Select>
        </div>
        <div>
          <Label>Location</Label>
          <Input placeholder="Current location" {...register("location")} />
          <p className="mt-1 text-xs text-rose-600">{errors.location?.message}</p>
        </div>
        <div>
          <Label>Timestamp</Label>
          <Input type="datetime-local" {...register("timestamp")} />
        </div>
        <div>
          <Label>Notes</Label>
          <Input placeholder="Optional notes" {...register("notes")} />
        </div>
      </div>
      <Button disabled={submitting} type="submit">
        {submitting ? "Saving..." : "Add Tracking Event"}
      </Button>
    </form>
  );
}
