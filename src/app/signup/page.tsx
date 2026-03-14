"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { signup } from "@/services/authService";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "manager", "carrier", "customer"]),
  organizationName: z.string().min(2),
});

type SignupValues = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "manager",
    },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full animate-rise">
        <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
        <p className="mb-5 text-sm text-slate-600">Set up your company workspace to start tracking shipments.</p>
        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
            try {
              setSubmitting(true);
              setError(null);
              await signup(values);
              router.replace("/dashboard");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Unable to create account.");
            } finally {
              setSubmitting(false);
            }
          })}
        >
          <div>
            <Label>Organization Name</Label>
            <Input {...register("organizationName")} />
            <p className="mt-1 text-xs text-rose-600">{errors.organizationName?.message}</p>
          </div>
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
          <div>
            <Label>Role</Label>
            <Select {...register("role")}>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="carrier">Carrier</option>
              <option value="customer">Customer</option>
            </Select>
          </div>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Sign up"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-cyan-700" href="/login">
            Login
          </Link>
        </p>
      </Card>
    </main>
  );
}
