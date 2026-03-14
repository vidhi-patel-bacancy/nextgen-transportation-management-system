"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { DocumentType } from "@/types";

const schema = z.object({
  document_type: z.enum(["bill_of_lading", "invoice", "proof_of_delivery"]),
});

type DocumentUploadValues = z.infer<typeof schema>;

export function DocumentUploadForm({
  submitting,
  onSubmit,
}: {
  submitting?: boolean;
  onSubmit: (payload: { file: File; documentType: DocumentType }) => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DocumentUploadValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      document_type: "bill_of_lading",
    },
  });

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit(async (values) => {
        if (!file) return;
        await onSubmit({ file, documentType: values.document_type });
      })}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label>Document Type</Label>
          <Select {...register("document_type")}>
            <option value="bill_of_lading">Bill of Lading</option>
            <option value="invoice">Invoice</option>
            <option value="proof_of_delivery">Proof of Delivery</option>
          </Select>
          <p className="mt-1 text-xs text-rose-600">{errors.document_type?.message}</p>
        </div>
        <div>
          <Label>File</Label>
          <input
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="h-10 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-2 file:py-1"
          />
        </div>
      </div>
      <Button disabled={submitting || !file} type="submit">
        {submitting ? "Uploading..." : "Upload Document"}
      </Button>
    </form>
  );
}
