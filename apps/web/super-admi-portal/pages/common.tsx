import React from "react";
import { cn } from "@/lib/utils";

export function CardShell({
  title,
  description,
  headerRight,
  children,
  className,
}: {
  title: string;
  description?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border/70 bg-background/70 p-4 shadow-sm", className)}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {headerRight ? <div>{headerRight}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  trend: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group rounded-xl border border-border/70 bg-card/60 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
      </div>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
      <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-300">{trend}</p>
    </div>
  );
}
