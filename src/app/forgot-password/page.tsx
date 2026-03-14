"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/services/authService";

const schema = z.object({
  email: z.string().email(),
});

type ForgotValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotValues>({
    resolver: zodResolver(schema),
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-4">
      <Card className="w-full animate-rise border-white/80 bg-white/72">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Forgot password</h1>
        <p className="mb-5 text-sm text-slate-600">Enter your email to receive a reset link.</p>
        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
            try {
              setSubmitting(true);
              setError(null);
              setSuccess(null);
              const response = await requestPasswordReset(values.email);
              if (response.sandbox) {
                setSuccess("Reset email sent to your SMTP sandbox inbox (Mailtrap), not to a real mailbox.");
              } else {
                setSuccess("If your email exists, a reset link has been sent.");
              }
            } catch (err) {
              setError(err instanceof Error ? err.message : "Unable to process request.");
            } finally {
              setSubmitting(false);
            }
          })}
        >
          <div>
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
            <p className="mt-1 text-xs text-rose-600">{errors.email?.message}</p>
          </div>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send reset link"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          <Link className="font-semibold text-emerald-700" href="/login">
            Back to login
          </Link>
        </p>
      </Card>
    </main>
  );
}
