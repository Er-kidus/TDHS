import * as React from "react";

export function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        "rounded-3xl border border-zinc-200/60 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-zinc-950/60 " +
        (className ?? "")
      }
    >
      {children}
    </div>
  );
}
