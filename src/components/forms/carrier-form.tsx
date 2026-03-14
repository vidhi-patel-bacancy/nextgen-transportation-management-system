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
  company_name: z.string().min(2),
  contact_email: z.string().email(),
  phone: z.string().min(7),
  transport_type: z.string().min(2),
});

export type CarrierFormValues = z.infer<typeof schema>;

interface CarrierFormProps {
  defaultValues?: Partial<CarrierFormValues>;
  submitting?: boolean;
  onSubmit: (values: CarrierFormValues) => Promise<void>;
}

export function CarrierForm({ defaultValues, submitting, onSubmit }: CarrierFormProps) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<CarrierFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_name: "",
      contact_email: "",
      phone: "",
      transport_type: "road",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit((values) => onSubmit(values))}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Company Name</Label>
          <Input {...register("company_name")} />
          <p className="mt-1 text-xs text-rose-600">{errors.company_name?.message}</p>
        </div>
        <div>
          <Label>Contact Email</Label>
          <Input type="email" {...register("contact_email")} />
          <p className="mt-1 text-xs text-rose-600">{errors.contact_email?.message}</p>
        </div>
        <div>
          <Label>Phone</Label>
          <Input {...register("phone")} />
          <p className="mt-1 text-xs text-rose-600">{errors.phone?.message}</p>
        </div>
        <div>
          <Label>Transport Type</Label>
          <Select {...register("transport_type")}>
            <option value="road">Road</option>
            <option value="air">Air</option>
            <option value="sea">Sea</option>
            <option value="rail">Rail</option>
          </Select>
          <p className="mt-1 text-xs text-rose-600">{errors.transport_type?.message}</p>
        </div>
      </div>
      <Button disabled={submitting} type="submit">
        {submitting ? "Saving..." : "Save Carrier"}
      </Button>
    </form>
  );
}
