import React from "react";
import { cn } from "@/lib/utils";

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  time: string;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "destructive" | "info";
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const dotColors = {
  default: "bg-border",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
};

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, index) => (
        <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
          {index < items.length - 1 && (
            <div className="absolute left-[11px] top-6 h-full w-px bg-border" />
          )}
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                "h-6 w-6 rounded-full border-2 border-card flex items-center justify-center",
                dotColors[item.variant || "default"]
              )}
            >
              {item.icon && <span className="text-card text-xs">{item.icon}</span>}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
