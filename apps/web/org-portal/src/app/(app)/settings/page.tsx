"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type FeatureFlags = {
  queueEnabled: boolean;
  notificationsEnabled: boolean;
  aiAssistEnabled: boolean;
};

const STORAGE_KEY = "org-settings-config";

export default function SettingsPage() {
  const [flags, setFlags] = useState<FeatureFlags>({
    queueEnabled: true,
    notificationsEnabled: true,
    aiAssistEnabled: false,
  });

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      setFlags(JSON.parse(saved) as FeatureFlags);
    } catch {
      setFlags({ queueEnabled: true, notificationsEnabled: true, aiAssistEnabled: false });
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  }, [flags]);

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
      <header className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configuration center for organization-level runtime options.</p>
      </header>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Runtime Flags</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <span>Queue System</span>
            <input type="checkbox" checked={flags.queueEnabled} onChange={(e) => setFlags((v) => ({ ...v, queueEnabled: e.target.checked }))} />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <span>Notifications</span>
            <input type="checkbox" checked={flags.notificationsEnabled} onChange={(e) => setFlags((v) => ({ ...v, notificationsEnabled: e.target.checked }))} />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm sm:col-span-2">
            <span>AI Assistant</span>
            <input type="checkbox" checked={flags.aiAssistEnabled} onChange={(e) => setFlags((v) => ({ ...v, aiAssistEnabled: e.target.checked }))} />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Operations Modules</h2>
        <p className="mt-1 text-sm text-muted-foreground">Inventory and scheduling are now dedicated modules.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/dashboard/inventory" className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">Open Inventory</Link>
          <Link href="/dashboard/scheduling" className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">Open Scheduling</Link>
          <Link href="/dashboard/staff-management" className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">Open Staff Management</Link>
        </div>
      </section>
    </div>
  );
}
