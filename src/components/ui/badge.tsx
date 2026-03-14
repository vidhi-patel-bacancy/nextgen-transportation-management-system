import { cn } from "@/lib/utils/cn";

const badgeStyles: Record<string, string> = {
  created: "bg-slate-100 text-slate-700",
  assigned: "bg-blue-100 text-blue-700",
  in_transit: "bg-amber-100 text-amber-800",
  delivered: "bg-emerald-100 text-emerald-700",
  exception: "bg-rose-100 text-rose-700",
  pending: "bg-slate-100 text-slate-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  delay: "bg-rose-100 text-rose-700",
  pickup: "bg-cyan-100 text-cyan-700",
};

export function Badge({ value, className }: { value: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize tracking-wide",
        badgeStyles[value] ?? "bg-slate-100 text-slate-700",
        className,
      )}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
