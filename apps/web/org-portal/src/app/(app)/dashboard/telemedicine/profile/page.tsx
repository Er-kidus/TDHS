"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BadgeCheck, CalendarClock, Globe2, ShieldCheck } from "lucide-react";

type TelemedicineProfile = {
  id: string;
  full_name: string;
  email?: string;
  role: string;
  telemedicine_enabled: boolean;
  telemedicine_specialty?: string;
  telemedicine_rate?: number;
  telemedicine_currency?: string;
  telemedicine_modes?: string[];
};

type ApiPayload = Record<string, unknown> | string | null;

async function readJsonResponse(response: Response): Promise<ApiPayload> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as ApiPayload;
  } catch {
    return text;
  }
}

function getErrorMessage(payload: ApiPayload, fallback: string): string {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = payload.error;
    if (typeof error === "string" && error.trim()) return error;
  }
  if (typeof payload === "string" && payload.trim()) return payload;
  return fallback;
}

export default function TelemedicineProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [profile, setProfile] = useState<TelemedicineProfile | null>(null);
  const [telemedicineEnabled, setTelemedicineEnabled] = useState(false);
  const [telemedicineSpecialty, setTelemedicineSpecialty] = useState("");
  const [telemedicineRate, setTelemedicineRate] = useState("");
  const [telemedicineCurrency, setTelemedicineCurrency] = useState("ETB");
  const [telemedicineModes, setTelemedicineModes] = useState<string[]>(["video", "voice", "chat"]);
  const [workMode, setWorkMode] = useState<"organization" | "telemedicine">("organization");
  const [pendingWorkMode, setPendingWorkMode] = useState<"organization" | "telemedicine" | null>(null);

  useEffect(() => {
    void loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/org/me/telemedicine", { cache: "no-store" });
      const payload = await readJsonResponse(res);
      if (!res.ok) {
        throw new Error(getErrorMessage(payload, "Unable to load telemedicine profile"));
      }
      const item = (payload || {}) as TelemedicineProfile;
      setProfile(item);
      setTelemedicineEnabled(Boolean(item.telemedicine_enabled));
      setTelemedicineSpecialty(item.telemedicine_specialty || "");
      setTelemedicineRate(item.telemedicine_rate ? String(item.telemedicine_rate) : "");
      setTelemedicineCurrency(item.telemedicine_currency || "ETB");
      setTelemedicineModes(item.telemedicine_modes && item.telemedicine_modes.length > 0 ? item.telemedicine_modes : ["video", "voice", "chat"]);
      setWorkMode(item.telemedicine_enabled ? "telemedicine" : "organization");
      setPendingWorkMode(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load telemedicine profile");
    } finally {
      setLoading(false);
    }
  }

  function toggleMode(mode: string) {
    setTelemedicineModes((current) => {
      if (current.includes(mode)) {
        const next = current.filter((item) => item !== mode);
        return next.length > 0 ? next : current;
      }
      return [...current, mode];
    });
  }

  function requestWorkModeSwitch(next: "organization" | "telemedicine") {
    if (next === workMode) return;
    setPendingWorkMode(next);
    setStatus("");
  }

  function confirmWorkModeSwitch() {
    if (!pendingWorkMode) return;
    setWorkMode(pendingWorkMode);
    setTelemedicineEnabled(pendingWorkMode === "telemedicine");
    setPendingWorkMode(null);
    setStatus("Mode switch confirmed. Save changes to apply.");
  }

  async function saveProfile() {
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const res = await fetch("/api/org/me/telemedicine", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telemedicine_enabled: telemedicineEnabled,
          telemedicine_specialty: telemedicineSpecialty.trim(),
          telemedicine_rate: Number(telemedicineRate) || 0,
          telemedicine_currency: telemedicineCurrency.trim().toUpperCase(),
          telemedicine_modes: telemedicineModes,
        }),
      });
      const payload = await readJsonResponse(res);
      if (!res.ok) {
        throw new Error(getErrorMessage(payload, "Unable to update telemedicine profile"));
      }
      setStatus("Telemedicine profile saved.");
      await loadProfile();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update telemedicine profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <header className="rounded-[28px] border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            {/* <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Telemedicine Superapp</p> */}
            <h1 className="text-3xl font-semibold tracking-tight">Telemedicine Profile</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">Configure your telemedicine identity, rates, availability, and supported consultation modes in one place.</p>
          </div>
          {/* <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/telemedicine" className="rounded-2xl border border-border bg-background px-4 py-2.5 text-sm hover:bg-muted/40">Workspace</Link>
            <Link href="/dashboard/telemedicine/queue" className="rounded-2xl border border-border bg-background px-4 py-2.5 text-sm hover:bg-muted/40">Queue</Link>
          </div> */}
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground"><BadgeCheck className="h-4 w-4" /> Profile status</div>
          <p className="mt-2 text-xl font-semibold">{telemedicineEnabled ? "Telemedicine on" : "Organization mode"}</p>
          <p className="mt-1 text-sm text-muted-foreground">Your current operating mode and access posture.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground"><Globe2 className="h-4 w-4" /> Modes</div>
          <p className="mt-2 text-xl font-semibold">{telemedicineModes.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">Supported consultation channels configured.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Billing</div>
          <p className="mt-2 text-xl font-semibold">{telemedicineCurrency} {telemedicineRate || "0"}</p>
          <p className="mt-1 text-sm text-muted-foreground">Current consultation rate for telemedicine visits.</p>
        </div>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading profile...</p> : null}
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {status ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{status}</p> : null}

      {!loading ? (
        <section className="rounded-[28px] border border-border bg-card p-5 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium">{profile?.full_name || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-sm font-medium">{profile?.role || "-"}</p>
            </div>
            {/* <div className="md:col-span-2 rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Practitioner work mode</p>
                  <p className="mt-1 text-sm text-muted-foreground">Switch between organization duties and telemedicine-only work.</p>
                </div>
                <CalendarClock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => requestWorkModeSwitch("organization")}
                  className={"rounded-2xl px-4 py-2.5 text-sm " + (workMode === "organization" ? "bg-primary text-primary-foreground" : "border border-border bg-background")}
                >
                  Organization mode
                </button>
                <button
                  type="button"
                  onClick={() => requestWorkModeSwitch("telemedicine")}
                  className={"rounded-2xl px-4 py-2.5 text-sm " + (workMode === "telemedicine" ? "bg-primary text-primary-foreground" : "border border-border bg-background")}
                >
                  Telemedicine gig mode
                </button>
              </div>
              {pendingWorkMode ? (
                <div className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                  <p>Confirm switch to <span className="font-semibold">{pendingWorkMode === "telemedicine" ? "Telemedicine gig mode" : "Organization mode"}</span>.</p>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={confirmWorkModeSwitch} className="rounded-2xl bg-amber-500 px-3 py-1.5 text-xs font-medium text-amber-950">Confirm switch</button>
                    <button type="button" onClick={() => setPendingWorkMode(null)} className="rounded-2xl border border-amber-300 px-3 py-1.5 text-xs">Cancel</button>
                  </div>
                </div>
              ) : null}
            </div> */}
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Specialty</label>
              <input value={telemedicineSpecialty} onChange={(event) => setTelemedicineSpecialty(event.target.value)} placeholder="Telemedicine specialty" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Rate</label>
              <input type="number" min={0} step="0.01" value={telemedicineRate} onChange={(event) => setTelemedicineRate(event.target.value)} placeholder="Consultation rate" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Currency</label>
              <input value={telemedicineCurrency} onChange={(event) => setTelemedicineCurrency(event.target.value.toUpperCase())} placeholder="ETB" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
            </div>
            <div className="md:col-span-2">
              <p className="mb-1 text-xs text-muted-foreground">Modes</p>
              <div className="flex flex-wrap gap-2">
                {(["video", "voice", "chat"] as const).map((mode) => (
                  <label key={mode} className="inline-flex items-center gap-2 rounded border border-border px-2 py-1 text-xs">
                    <input type="checkbox" checked={telemedicineModes.includes(mode)} onChange={() => toggleMode(mode)} disabled={workMode !== "telemedicine"} />
                    {mode}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => void saveProfile()} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
              {saving ? "Saving..." : "Save telemedicine profile"}
            </button>
            <button onClick={() => void loadProfile()} className="rounded-lg border border-border px-4 py-2 text-sm">Refresh</button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
