import type { ReactNode } from "react";

export function StatCard({
  icon,
  label,
  value,
  hint,
  variant = "default",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  variant?: "default" | "warning" | "danger";
}) {
  const tone =
    variant === "danger"
      ? "border-critical/25 bg-critical/5"
      : variant === "warning"
        ? "border-warning/30 bg-warning/5"
        : "border-border bg-card";

  return (
    <div className={"rounded-2xl border p-4 shadow-soft " + tone}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="text-primary">{icon}</div>
      </div>

      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}