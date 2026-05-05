import { type ReactNode } from "react";

export function GlassCard({ children }: { children: ReactNode }) {
  return (
    <div className="w-full rounded-3xl border border-white/20 bg-white/70 p-6 shadow-xl shadow-zinc-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-black/20 sm:p-8">
      {children}
    </div>
  );
}
