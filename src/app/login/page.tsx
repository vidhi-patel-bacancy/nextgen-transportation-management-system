"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/services/authService";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const infoMessage = useMemo(() => {
    if (searchParams.get("verified") === "1") {
      return "Email verified successfully. You can log in now.";
    }

    if (searchParams.get("reset") === "1") {
      return "Password reset successful. Please log in with your new password.";
    }

    return null;
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: searchParams.get("email") ?? "",
    },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full animate-rise">
        <h1 className="text-2xl font-bold text-slate-900">Login to Cloud TMS</h1>
        <p className="mb-5 text-sm text-slate-600">Use your credentials to access operations dashboard.</p>
        {infoMessage ? <p className="mb-3 rounded bg-emerald-50 p-2 text-sm text-emerald-700">{infoMessage}</p> : null}
        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
            try {
              setSubmitting(true);
              setError(null);
              await login(values.email, values.password);
              router.replace("/dashboard");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Unable to login.");
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
            <Label>Password</Label>
            <Input type="password" {...register("password")} />
            <p className="mt-1 text-xs text-rose-600">{errors.password?.message}</p>
          </div>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Logging in..." : "Login"}
          </Button>
        </form>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <p>
            No account?{" "}
            <Link className="font-semibold text-cyan-700" href="/signup">
              Sign up
            </Link>
          </p>
          <Link className="font-semibold text-cyan-700" href="/forgot-password">
            Forgot password?
          </Link>
        </div>
      </Card>
    </main>
  );
}
