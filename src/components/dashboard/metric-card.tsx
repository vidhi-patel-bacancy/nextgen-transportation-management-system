import { Card } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  accent = "from-cyan-600 to-blue-600",
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <Card className="relative overflow-hidden border-white/80 bg-white/70">
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accent}`} />
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <div className={`pointer-events-none absolute -right-5 -top-8 h-20 w-20 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-xl`} />
    </Card>
  );
}
