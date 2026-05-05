"use client";

import { useEffect, useMemo, useState } from "react";

type OrgIdentity = {
  organization_id?: string;
};

type StaffMember = {
  id: string;
  full_name: string;
  role: string;
  active?: boolean;
};

type Shift = {
  id: string;
  staffName: string;
  role: string;
  department: string;
  date: string;
  shiftType: "morning" | "evening" | "night";
  status: "scheduled" | "on-break" | "active" | "completed";
  source: "manual" | "auto";
};

type FacilityTier = "health-center" | "primary-hospital" | "general-hospital" | "specialized-hospital";

const STORAGE_KEY = "org-staff-scheduling";

const MOH_BASELINE: Record<FacilityTier, { nursePerPatients: number; doctorPerPatients: number; receptionPerPatients: number }> = {
  "health-center": { nursePerPatients: 10, doctorPerPatients: 20, receptionPerPatients: 40 },
  "primary-hospital": { nursePerPatients: 8, doctorPerPatients: 16, receptionPerPatients: 35 },
  "general-hospital": { nursePerPatients: 6, doctorPerPatients: 12, receptionPerPatients: 30 },
  "specialized-hospital": { nursePerPatients: 5, doctorPerPatients: 10, receptionPerPatients: 25 },
};

const SHIFT_SPLIT: Array<{ type: Shift["shiftType"]; weight: number }> = [
  { type: "morning", weight: 0.45 },
  { type: "evening", weight: 0.35 },
  { type: "night", weight: 0.2 },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function toArrayPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

export default function SchedulingPage() {
  const [organizationId, setOrganizationId] = useState("");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [form, setForm] = useState({
    staffName: "",
    role: "nurse",
    department: "Outpatient",
    date: new Date().toISOString().slice(0, 10),
    shiftType: "morning" as Shift["shiftType"],
  });
  const [planning, setPlanning] = useState({
    expectedPatients: 180,
    facilityTier: "primary-hospital" as FacilityTier,
  });

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      setShifts(JSON.parse(saved) as Shift[]);
    } catch {
      setShifts([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    async function loadStaff() {
      setError(null);
      try {
        const meRes = await fetch("/api/org/me");
        if (!meRes.ok) throw new Error("Unable to load organization context");
        const me = (await meRes.json().catch(() => ({}))) as OrgIdentity;
        if (!me.organization_id) throw new Error("Organization context is missing.");
        setOrganizationId(me.organization_id);

        const staffRes = await fetch(`/api/org/organizations/${encodeURIComponent(me.organization_id)}/staff?limit=500`);
        const payload = (await staffRes.json().catch(() => [])) as unknown;
        setStaff(staffRes.ok ? toArrayPayload<StaffMember>(payload) : []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load staff for scheduling.");
      }
    }

    void loadStaff();
  }, []);

  const summary = useMemo(() => {
    return shifts.reduce(
      (acc, shift) => {
        acc.total += 1;
        if (shift.status === "active") acc.active += 1;
        if (shift.status === "on-break") acc.onBreak += 1;
        if (shift.status === "scheduled") acc.scheduled += 1;
        if (shift.source === "auto") acc.auto += 1;
        return acc;
      },
      { total: 0, active: 0, onBreak: 0, scheduled: 0, auto: 0 },
    );
  }, [shifts]);

  function addShift() {
    if (!form.staffName.trim()) return;
    const next: Shift = {
      id: uid(),
      staffName: form.staffName.trim(),
      role: form.role,
      department: form.department,
      date: form.date,
      shiftType: form.shiftType,
      status: "scheduled",
      source: "manual",
    };
    setShifts((current) => [next, ...current]);
    setForm((current) => ({ ...current, staffName: "" }));
  }

  function setStatus(id: string, status: Shift["status"]) {
    setShifts((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  function removeShift(id: string) {
    setShifts((current) => current.filter((item) => item.id !== id));
  }

  function allocateRoleShifts(pool: StaffMember[], needed: number, roleLabel: string, date: string, department: string): Shift[] {
    const out: Shift[] = [];
    let cursor = 0;
    const source = pool.length > 0 ? pool : [{ id: "gap", full_name: `${roleLabel} (Unfilled Slot)`, role: roleLabel, active: true }];

    for (const split of SHIFT_SPLIT) {
      const targetForShift = Math.max(1, Math.round(needed * split.weight));
      for (let i = 0; i < targetForShift; i += 1) {
        const candidate = source[cursor % source.length];
        cursor += 1;
        out.push({
          id: uid(),
          staffName: candidate.full_name,
          role: roleLabel,
          department,
          date,
          shiftType: split.type,
          status: "scheduled",
          source: "auto",
        });
      }
    }

    return out;
  }

  function runAutoScheduler() {
    setError(null);
    if (!organizationId) {
      setError("Organization context is required for scheduling.");
      return;
    }

    const baseline = MOH_BASELINE[planning.facilityTier];
    const expectedPatients = Math.max(1, planning.expectedPatients);

    const activeStaff = staff.filter((member) => member.active !== false);
    const nurses = activeStaff.filter((s) => (s.role || "").toLowerCase().includes("nurse"));
    const doctors = activeStaff.filter((s) => (s.role || "").toLowerCase().includes("doctor"));
    const receptions = activeStaff.filter((s) => {
      const role = (s.role || "").toLowerCase();
      return role.includes("reception") || role.includes("admin") || role.includes("staff");
    });

    const nurseNeeded = Math.max(1, Math.ceil(expectedPatients / baseline.nursePerPatients));
    const doctorNeeded = Math.max(1, Math.ceil(expectedPatients / baseline.doctorPerPatients));
    const receptionNeeded = Math.max(1, Math.ceil(expectedPatients / baseline.receptionPerPatients));

    const date = form.date;
    const department = form.department;

    const generated = [
      ...allocateRoleShifts(nurses, nurseNeeded, "nurse", date, department),
      ...allocateRoleShifts(doctors, doctorNeeded, "doctor", date, department),
      ...allocateRoleShifts(receptions, receptionNeeded, "reception", date, department),
    ];

    setShifts((current) => [...generated, ...current]);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
      <header className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-2xl font-semibold tracking-tight">Staff Scheduling System</h1>
        <p className="mt-1 text-sm text-muted-foreground">Dedicated scheduling workspace with automated shift generation based on MoH-inspired staffing baselines and expected patient load.</p>
      </header>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Total Shifts</p>
          <p className="mt-1 text-2xl font-semibold">{summary.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Scheduled</p>
          <p className="mt-1 text-2xl font-semibold">{summary.scheduled}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Active</p>
          <p className="mt-1 text-2xl font-semibold">{summary.active}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">On Break</p>
          <p className="mt-1 text-2xl font-semibold">{summary.onBreak}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Auto Planned</p>
          <p className="mt-1 text-2xl font-semibold">{summary.auto}</p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Auto Scheduler</h2>
        <p className="mt-1 text-xs text-muted-foreground">Assumptions: nurse ratio, doctor ratio, and reception coverage scaled by facility tier and expected patient volume.</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
          <input aria-label="Expected patients" className="h-9 rounded-lg border border-border bg-background px-3 text-sm" type="number" min={1} value={planning.expectedPatients} onChange={(e) => setPlanning((v) => ({ ...v, expectedPatients: Number(e.target.value) || 1 }))} />
          <select aria-label="Facility tier" className="h-9 rounded-lg border border-border bg-background px-3 text-sm" value={planning.facilityTier} onChange={(e) => setPlanning((v) => ({ ...v, facilityTier: e.target.value as FacilityTier }))}>
            <option value="health-center">Health Center</option>
            <option value="primary-hospital">Primary Hospital</option>
            <option value="general-hospital">General Hospital</option>
            <option value="specialized-hospital">Specialized Hospital</option>
          </select>
          <input aria-label="Planning date" className="h-9 rounded-lg border border-border bg-background px-3 text-sm" type="date" value={form.date} onChange={(e) => setForm((v) => ({ ...v, date: e.target.value }))} />
          <input aria-label="Planning department" className="h-9 rounded-lg border border-border bg-background px-3 text-sm" placeholder="Department" value={form.department} onChange={(e) => setForm((v) => ({ ...v, department: e.target.value }))} />
        </div>
        <button onClick={runAutoScheduler} className="mt-3 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted">Run Auto Scheduler</button>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Assign New Shift (Manual)</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
          <input className="h-9 rounded-lg border border-border bg-background px-3 text-sm" placeholder="Staff name" value={form.staffName} onChange={(e) => setForm((v) => ({ ...v, staffName: e.target.value }))} />
          <input className="h-9 rounded-lg border border-border bg-background px-3 text-sm" placeholder="Role" value={form.role} onChange={(e) => setForm((v) => ({ ...v, role: e.target.value }))} />
          <input className="h-9 rounded-lg border border-border bg-background px-3 text-sm" placeholder="Department" value={form.department} onChange={(e) => setForm((v) => ({ ...v, department: e.target.value }))} />
          <input aria-label="Shift date" className="h-9 rounded-lg border border-border bg-background px-3 text-sm" type="date" value={form.date} onChange={(e) => setForm((v) => ({ ...v, date: e.target.value }))} />
          <select aria-label="Shift type" className="h-9 rounded-lg border border-border bg-background px-3 text-sm" value={form.shiftType} onChange={(e) => setForm((v) => ({ ...v, shiftType: e.target.value as Shift["shiftType"] }))}>
            <option value="morning">Morning</option>
            <option value="evening">Evening</option>
            <option value="night">Night</option>
          </select>
        </div>
        <button onClick={addShift} className="mt-3 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">Add Shift</button>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Shift Board</h2>
        <div className="mt-3 space-y-2">
          {shifts.map((shift) => (
            <div key={shift.id} className="rounded-lg border border-border bg-background p-3 text-sm">
              <p className="font-medium">{shift.staffName} ({shift.role})</p>
              <p className="text-xs text-muted-foreground">{shift.department} | {shift.date} | {shift.shiftType} | source: {shift.source}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className="rounded border border-border px-2 py-1 text-xs" onClick={() => setStatus(shift.id, "scheduled")}>Scheduled</button>
                <button className="rounded border border-border px-2 py-1 text-xs" onClick={() => setStatus(shift.id, "active")}>Active</button>
                <button className="rounded border border-border px-2 py-1 text-xs" onClick={() => setStatus(shift.id, "on-break")}>On Break</button>
                <button className="rounded border border-border px-2 py-1 text-xs" onClick={() => setStatus(shift.id, "completed")}>Completed</button>
                <button className="rounded border border-border px-2 py-1 text-xs text-red-700" onClick={() => removeShift(shift.id)}>Remove</button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Current status: {shift.status}</p>
            </div>
          ))}
          {shifts.length === 0 ? <p className="text-sm text-muted-foreground">No shifts scheduled yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
