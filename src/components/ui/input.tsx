import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-emerald-950/15 bg-white/85 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100",
        className,
      )}
      {...props}
    />
  );
});
