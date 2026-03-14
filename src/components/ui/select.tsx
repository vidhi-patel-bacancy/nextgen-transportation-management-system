import { forwardRef, type SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-emerald-950/15 bg-white/85 px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
