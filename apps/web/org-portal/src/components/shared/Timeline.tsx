import type { ReactNode } from "react";

type Variant = "default" | "success" | "warning" | "destructive" | "info";

export type TimelineItem = {
  id: string;
  title: string;
  description?: string;
  time: string;
  icon?: ReactNode;
  variant?: Variant;
};

const dotColors: Record<Variant, string> = {
  default: "bg-border",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
};

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <div className={"space-y-0" + (className ? " " + className : "")}>
      {items.map((item, index) => {
        const variant: Variant = item.variant ?? "default";
        return (
          <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
            {index < items.length - 1 ? <div className="absolute left-[11px] top-6 h-full w-px bg-border" /> : null}
            <div className="relative flex-shrink-0">
              <div
                className={
                  "h-6 w-6 rounded-full border-2 border-card flex items-center justify-center " +
                  dotColors[variant]
                }
              >
                {item.icon ? <span className="text-card text-xs">{item.icon}</span> : null}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
              </div>
              {item.description ? <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
