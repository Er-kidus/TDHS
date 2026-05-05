import type { ReactNode } from "react";

type Variant =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "critical"
  | "outline"
  | "waiting"
  | "active"
  | "completed"
  | "urgent"
  | "scheduled"
  | "triage";

type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/15 text-destructive",
  info: "bg-info/15 text-info",
  critical: "bg-critical/15 text-critical",
  outline: "border border-border text-foreground",
  waiting: "bg-warning/15 text-warning",
  active: "bg-success/15 text-success",
  completed: "bg-muted text-muted-foreground",
  urgent: "bg-destructive text-destructive-foreground",
  scheduled: "bg-info/15 text-info",
  triage: "bg-warning text-warning-foreground",
};

const sizeClass: Record<Size, string> = {
  sm: "text-[10px] px-1.5 py-0",
  md: "text-xs px-2.5 py-0.5",
  lg: "text-sm px-3 py-1",
};

function dotClassForVariant(variant: Variant): string {
  if (variant === "success" || variant === "active") return "bg-success";
  if (variant === "warning" || variant === "waiting" || variant === "triage") return "bg-warning";
  if (variant === "destructive" || variant === "urgent" || variant === "critical") return "bg-destructive";
  if (variant === "info" || variant === "scheduled") return "bg-info";
  if (variant === "completed") return "bg-muted-foreground";
  return "bg-muted-foreground";
}

export function StatusBadge(props: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  dot?: boolean;
}) {
  const variant = props.variant ?? "default";
  const size = props.size ?? "md";
  const base = "inline-flex items-center rounded-full font-medium transition-colors";

  return (
    <span className={base + " " + sizeClass[size] + " " + variantClass[variant] + (props.className ? " " + props.className : "")}>
      {props.dot ? <span className={"mr-1.5 h-1.5 w-1.5 rounded-full " + dotClassForVariant(variant)} /> : null}
      {props.children}
    </span>
  );
}
