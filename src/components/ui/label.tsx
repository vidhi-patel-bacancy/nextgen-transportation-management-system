import { cn } from "@/lib/utils/cn";

export function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={cn("mb-1 block text-sm font-semibold text-slate-700", className)}>{children}</label>;
}
