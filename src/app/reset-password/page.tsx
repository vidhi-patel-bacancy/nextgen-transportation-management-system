"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordWithToken } from "@/services/authService";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordPageFallback />}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";
  const hasValidLink = Boolean(email && token);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetValues>({
    resolver: zodResolver(schema),
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-4">
      <Card className="w-full animate-rise border-white/80 bg-white/72">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reset password</h1>
        <p className="mb-5 text-sm text-slate-600">Set a new password for your account.</p>
        {!hasValidLink ? <p className="mb-4 text-sm text-rose-700">This reset link is invalid. Request a new one.</p> : null}
        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
            if (!hasValidLink) {
              setError("This reset link is invalid.");
              return;
            }

            try {
              setSubmitting(true);
              setError(null);
              await resetPasswordWithToken({
                email,
                token,
                password: values.password,
              });
              router.replace(`/login?reset=1&email=${encodeURIComponent(email)}`);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Unable to reset password.");
            } finally {
              setSubmitting(false);
            }
          })}
        >
          <div>
            <Label>New password</Label>
            <Input type="password" {...register("password")} />
            <p className="mt-1 text-xs text-rose-600">{errors.password?.message}</p>
          </div>
          <div>
            <Label>Confirm password</Label>
            <Input type="password" {...register("confirmPassword")} />
            <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword?.message}</p>
          </div>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={submitting || !hasValidLink}>
            {submitting ? "Resetting..." : "Reset password"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          <Link className="font-semibold text-emerald-700" href="/forgot-password">
            Request new reset link
          </Link>
        </p>
      </Card>
    </main>
  );
}

function ResetPasswordPageFallback() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-4">
      <Card className="w-full animate-rise border-white/80 bg-white/72">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reset password</h1>
        <p className="mb-5 text-sm text-slate-600">Loading reset details...</p>
      </Card>
    </main>
  );
}
