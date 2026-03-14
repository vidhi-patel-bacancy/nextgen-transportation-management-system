import { cn } from "@/lib/utils/cn";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/70 bg-[var(--panel)] p-5 shadow-card backdrop-blur-md supports-[backdrop-filter]:bg-[var(--panel)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
