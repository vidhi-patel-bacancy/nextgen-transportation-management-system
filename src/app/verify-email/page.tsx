"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestSignupOtp, verifySignupOtp } from "@/services/authService";

const schema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

type VerifyValues = z.infer<typeof schema>;

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VerifyValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      otp: "",
    },
  });

  useEffect(() => {
    const email = searchParams.get("email");
    if (email) {
      setValue("email", email);
    }
  }, [searchParams, setValue]);

  const emailValue = watch("email");

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full animate-rise">
        <h1 className="text-2xl font-bold text-slate-900">Verify your email</h1>
        <p className="mb-5 text-sm text-slate-600">Enter the 6-digit OTP sent to your inbox.</p>
        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
            try {
              setSubmitting(true);
              setError(null);
              setSuccess(null);
              await verifySignupOtp(values.email, values.otp);
              router.replace(`/login?verified=1&email=${encodeURIComponent(values.email)}`);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Unable to verify OTP.");
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
          <div>
            <Label>OTP</Label>
            <Input inputMode="numeric" maxLength={6} placeholder="123456" {...register("otp")} />
            <p className="mt-1 text-xs text-rose-600">{errors.otp?.message}</p>
          </div>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Verifying..." : "Verify email"}
          </Button>
        </form>
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            className="font-semibold text-cyan-700"
            disabled={resending}
            onClick={async () => {
              try {
                setResending(true);
                setError(null);
                setSuccess(null);
                await requestSignupOtp(emailValue);
                setSuccess("A new OTP has been sent to your email.");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Unable to resend OTP.");
              } finally {
                setResending(false);
              }
            }}
          >
            {resending ? "Resending..." : "Resend OTP"}
          </button>
          <Link className="font-semibold text-cyan-700" href="/login">
            Back to login
          </Link>
        </div>
      </Card>
    </main>
  );
}
