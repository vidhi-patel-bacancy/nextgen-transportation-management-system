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
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
    </Card>
  );
}
