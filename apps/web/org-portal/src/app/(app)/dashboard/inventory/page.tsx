"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type OrgIdentity = {
  organization_id?: string;
  role?: string;
};

type Appointment = {
  id: string;
  status?: string;
};

type InventoryState = {
  totalBeds: number;
  occupiedBedsBaseline: number;
  ventilatorsTotal: number;
  ventilatorsInUseBaseline: number;
  emergencyKits: number;
  staffOnBreakBaseline: number;
};

function toArrayPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

export default function InventoryPage() {
  const [organizationId, setOrganizationId] = useState("");
  const [role, setRole] = useState("staff");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inventory, setInventory] = useState<InventoryState>({
    totalBeds: 120,
    occupiedBedsBaseline: 70,
    ventilatorsTotal: 24,
    ventilatorsInUseBaseline: 10,
    emergencyKits: 39,
    staffOnBreakBaseline: 5,
  });

  const canEdit = role === "admin" || role === "superadmin";
  const storageKey = `org-inventory-control-${organizationId || "default"}`;

  useEffect(() => {
    async function bootstrap() {
      const meRes = await fetch("/api/org/me");
      const me = (await meRes.json().catch(() => ({}))) as OrgIdentity;
      setOrganizationId(me.organization_id || "");
      setRole((me.role || "staff").toLowerCase());

      const appointmentsRes = await fetch("/api/appointments?limit=500");
      const payload = (await appointmentsRes.json().catch(() => [])) as unknown;
      setAppointments(appointmentsRes.ok ? toArrayPayload<Appointment>(payload) : []);
    }

    void bootstrap();
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      setInventory(JSON.parse(saved) as InventoryState);
    } catch {
      // Keep defaults if storage is malformed.
    }
  }, [storageKey]);

  useEffect(() => {
    if (!organizationId) return;
    window.localStorage.setItem(storageKey, JSON.stringify(inventory));
  }, [inventory, storageKey, organizationId]);

  const dynamic = useMemo(() => {
    const booked = appointments.filter((a) => (a.status || "").toLowerCase() === "booked").length;
    const inProgress = appointments.filter((a) => (a.status || "").toLowerCase() === "in-progress").length;
    const cancelled = appointments.filter((a) => (a.status || "").toLowerCase() === "cancelled").length;
    const rescheduled = appointments.filter((a) => (a.status || "").toLowerCase() === "rescheduled").length;

    const occupiedBeds = Math.min(inventory.totalBeds, inventory.occupiedBedsBaseline + Math.round(inProgress * 0.5));
    const ventilatorsInUse = Math.min(inventory.ventilatorsTotal, inventory.ventilatorsInUseBaseline + Math.round(inProgress * 0.2));
    const staffOnBreak = Math.max(0, inventory.staffOnBreakBaseline + Math.round(cancelled * 0.02) - Math.round(booked * 0.01));

    return {
      booked,
      cancelled,
      rescheduled,
      inProgress,
      occupiedBeds,
      ventilatorsInUse,
      staffOnBreak,
    };
  }, [appointments, inventory]);

  const metrics = useMemo(() => {
    const availableBeds = Math.max(0, inventory.totalBeds - dynamic.occupiedBeds);
    const occupancyRate = inventory.totalBeds > 0 ? Math.round((dynamic.occupiedBeds / inventory.totalBeds) * 100) : 0;
    const ventilatorsAvailable = Math.max(0, inventory.ventilatorsTotal - dynamic.ventilatorsInUse);
    return {
      availableBeds,
      occupancyRate,
      ventilatorsAvailable,
    };
  }, [dynamic, inventory.totalBeds, inventory.ventilatorsTotal]);

  function setNumber<K extends keyof InventoryState>(key: K, value: string) {
    if (!canEdit) return;
    const parsed = Number(value);
    setInventory((current) => ({ ...current, [key]: Number.isFinite(parsed) ? parsed : 0 }));
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
      <header className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-2xl font-semibold tracking-tight">Inventory Control</h1>
        <p className="mt-1 text-sm text-muted-foreground">Baseline inventory is set by admin and rendered dynamically for each role using live activity signals.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Available Beds</p>
          <p className="mt-1 text-2xl font-semibold">{metrics.availableBeds}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Bed Occupancy</p>
          <p className="mt-1 text-2xl font-semibold">{metrics.occupancyRate}%</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Ventilators Free</p>
          <p className="mt-1 text-2xl font-semibold">{metrics.ventilatorsAvailable}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Workers on Break</p>
          <p className="mt-1 text-2xl font-semibold">{dynamic.staffOnBreak}</p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Live Activity Overlay</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-background p-3 text-xs"><span className="text-muted-foreground">Booked</span><p className="text-base font-semibold">{dynamic.booked}</p></div>
          <div className="rounded-lg border border-border bg-background p-3 text-xs"><span className="text-muted-foreground">Cancelled</span><p className="text-base font-semibold">{dynamic.cancelled}</p></div>
          <div className="rounded-lg border border-border bg-background p-3 text-xs"><span className="text-muted-foreground">Rescheduled</span><p className="text-base font-semibold">{dynamic.rescheduled}</p></div>
          <div className="rounded-lg border border-border bg-background p-3 text-xs"><span className="text-muted-foreground">In Progress</span><p className="text-base font-semibold">{dynamic.inProgress}</p></div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Inventory Baseline</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {canEdit ? "You can edit baseline inventory values for this organization." : "Read-only view. Admin controls baseline settings."}
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Total Beds</span>
            <input disabled={!canEdit} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm disabled:opacity-70" type="number" value={inventory.totalBeds} onChange={(e) => setNumber("totalBeds", e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Occupied Beds Baseline</span>
            <input disabled={!canEdit} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm disabled:opacity-70" type="number" value={inventory.occupiedBedsBaseline} onChange={(e) => setNumber("occupiedBedsBaseline", e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Ventilators Total</span>
            <input disabled={!canEdit} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm disabled:opacity-70" type="number" value={inventory.ventilatorsTotal} onChange={(e) => setNumber("ventilatorsTotal", e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Ventilators In Use Baseline</span>
            <input disabled={!canEdit} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm disabled:opacity-70" type="number" value={inventory.ventilatorsInUseBaseline} onChange={(e) => setNumber("ventilatorsInUseBaseline", e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Emergency Kits</span>
            <input disabled={!canEdit} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm disabled:opacity-70" type="number" value={inventory.emergencyKits} onChange={(e) => setNumber("emergencyKits", e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Staff On Break Baseline</span>
            <input disabled={!canEdit} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm disabled:opacity-70" type="number" value={inventory.staffOnBreakBaseline} onChange={(e) => setNumber("staffOnBreakBaseline", e.target.value)} />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 text-sm">
        <p className="text-muted-foreground">Need staffing assignments and shift plans? Open the dedicated scheduling system.</p>
        <Link href="/dashboard/scheduling" className="mt-2 inline-flex rounded-lg border border-border px-3 py-2 font-medium hover:bg-muted">Go to Scheduling</Link>
      </section>
    </div>
  );
}
