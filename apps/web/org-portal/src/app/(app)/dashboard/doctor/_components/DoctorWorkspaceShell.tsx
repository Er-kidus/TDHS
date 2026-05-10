"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { RefreshCw } from "lucide-react";

type View = "overview" | "queue" | "workflow";

export function DoctorWorkspaceShell({
  view,
  onRefresh,
  loadingError,
  actionError,
  actionMessage,
  children,
}: {
  view: View;
  onRefresh: () => void;
  loadingError?: string;
  actionError?: string;
  actionMessage?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-screen-2xl flex-col gap-5">
      <header className="border-b border-border pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Organization Mode</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Doctor Workspace</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/dashboard/telemedicine" className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
              Telemedicine
            </Link>
            <button type="button" onClick={onRefresh} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>
        <nav className="mt-4 flex flex-wrap gap-2" aria-label="Doctor workspace sections">
          <SectionLink href="/dashboard/doctor" active={view === "overview"} label="Overview" />
          <SectionLink href="/dashboard/doctor/queue" active={view === "queue"} label="Queue" />
          <SectionLink href="/dashboard/doctor/workflow" active={view === "workflow"} label="Patient Workflow" />
        </nav>
      </header>

      <StatusMessage tone="danger" message={loadingError} />
      <StatusMessage tone="danger" message={actionError} />
      <StatusMessage tone="success" message={actionMessage} />
      {children}
    </div>
  );
}

function SectionLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link href={href} className={`rounded-lg px-3 py-2 text-sm font-semibold ${active ? "bg-primary text-primary-foreground" : "border border-border bg-background hover:bg-muted"}`}>
      {label}
    </Link>
  );
}

function StatusMessage({ message, tone }: { message?: string; tone: "danger" | "success" }) {
  if (!message) return null;
  const className =
    tone === "danger"
      ? "border-destructive/30 bg-destructive/5 text-destructive"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  return <p className={`rounded-lg border px-3 py-2 text-sm ${className}`}>{message}</p>;
}

export function StatGrid({ stats }: { stats: Array<{ label: string; value: number }> }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <article key={stat.label} className="rounded-lg border border-border bg-card p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{stat.label}</p>
          <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
        </article>
      ))}
    </section>
  );
}
