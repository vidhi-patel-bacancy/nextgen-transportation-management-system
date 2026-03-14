import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const styles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-[0_10px_22px_rgba(6,95,70,0.25)] hover:from-emerald-800 hover:to-teal-800",
  secondary: "border border-emerald-900/15 bg-white/80 text-slate-900 hover:bg-white",
  danger: "bg-gradient-to-r from-rose-700 to-red-700 text-white hover:from-rose-800 hover:to-red-800",
  ghost: "bg-transparent text-slate-700 hover:bg-emerald-900/10",
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-60",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
