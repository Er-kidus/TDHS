import type { ReactNode } from "react";

type Variant = "default" | "primary" | "success" | "warning" | "destructive";

const variantStyles: Record<Variant, string> = {
  default: "bg-card border-border",
  primary: "bg-primary/5 border-primary/20",
  success: "bg-success/5 border-success/20",
  warning: "bg-warning/5 border-warning/20",
  destructive: "bg-destructive/5 border-destructive/20",
};

export function StatCard(props: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  variant?: Variant;
  className?: string;
}) {
  const variant = props.variant ?? "default";
  const trend = props.trend;

  return (
    <div
      className={
        "rounded-lg border p-4 shadow-soft transition-shadow hover:shadow-medium " +
        variantStyles[variant] +
        (props.className ? " " + props.className : "")
      }
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{props.title}</p>
          <p className="text-2xl font-semibold tracking-tight">{props.value}</p>
          {props.subtitle ? <p className="text-xs text-muted-foreground">{props.subtitle}</p> : null}
          {trend ? (
            <p className={"text-xs font-medium " + (trend.value >= 0 ? "text-success" : "text-destructive")}>
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
            </p>
          ) : null}
        </div>
        {props.icon ? <div className="rounded-lg bg-primary/10 p-2.5 text-primary">{props.icon}</div> : null}
      </div>
    </div>
  );
}
