import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        success: "bg-success/15 text-success",
        warning: "bg-warning/15 text-warning-foreground",
        destructive: "bg-destructive/15 text-destructive",
        info: "bg-info/15 text-info",
        critical: "bg-critical/15 text-critical animate-pulse",
        outline: "border border-border text-foreground",
        waiting: "bg-warning/15 text-warning-foreground",
        active: "bg-success/15 text-success",
        completed: "bg-muted text-muted-foreground",
        urgent: "bg-destructive text-destructive-foreground",
        scheduled: "bg-info/15 text-info",
        triage: "bg-warning text-warning-foreground",
      },
      size: {
        sm: "text-[10px] px-1.5 py-0",
        md: "text-xs px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ children, variant, size, className, dot }) => {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)}>
      {dot && (
        <span
          className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", {
            "bg-success": variant === "success" || variant === "active",
            "bg-warning": variant === "warning" || variant === "waiting" || variant === "triage",
            "bg-destructive": variant === "destructive" || variant === "urgent",
            "bg-info": variant === "info" || variant === "scheduled",
            "bg-critical": variant === "critical",
            "bg-muted-foreground": !variant || variant === "default" || variant === "outline" || variant === "completed",
          })}
        />
      )}
      {children}
    </span>
  );
};
