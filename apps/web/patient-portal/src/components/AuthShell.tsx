import { type ReactNode } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-zinc-50 via-zinc-50 to-white dark:from-zinc-950 dark:via-zinc-950 dark:to-black" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-zinc-200/60 blur-3xl dark:bg-zinc-800/40" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-zinc-200/60 blur-3xl dark:bg-zinc-800/40" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Tenadam
          </div>
          <ThemeToggle />
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        </div>

        {children}

        <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Secure patient access • JWT session
        </p>
      </div>
    </div>
  );
}
