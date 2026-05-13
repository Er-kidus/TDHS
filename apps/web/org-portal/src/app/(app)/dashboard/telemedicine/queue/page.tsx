"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type QueueSession = {
  id: string;
  patient_id: string;
  doctor_id?: string;
  doctor_name: string;
  scheduled_at: string;
  preferred_mode?: "video" | "voice" | "chat";
  requested_amount?: number;
  requested_currency?: string;
  status: string;
  connection_status: string;
  notes?: string;
};

type Patient = {
  id: string;
  full_name: string;
  phone?: string;
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

export default function TelemedicineQueuePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [queueSessions, setQueueSessions] = useState<QueueSession[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [acceptingId, setAcceptingId] = useState("");
  const [lastRefreshAt, setLastRefreshAt] = useState<Date | null>(null);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 10000);
    return () => window.clearInterval(timer);
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [queueRes, patientsRes] = await Promise.all([
        fetch("/api/org/telemedicine/queue", { cache: "no-store" }),
        fetch("/api/org/patients?limit=300", { cache: "no-store" }),
      ]);

      const queuePayload = await readJsonResponse(queueRes);
      if (!queueRes.ok) {
        throw new Error(getErrorMessage(queuePayload, "Unable to load telemedicine queue"));
      }
      setQueueSessions(Array.isArray(queuePayload) ? (queuePayload as QueueSession[]) : []);
      setLastRefreshAt(new Date());

      if (patientsRes.ok) {
        const patientPayload = await readJsonResponse(patientsRes);
        setPatients(Array.isArray(patientPayload) ? (patientPayload as Patient[]) : []);
      } else {
        setPatients([]);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load telemedicine queue");
    } finally {
      setLoading(false);
    }
  }

  const patientLookup = useMemo(() => new Map(patients.map((patient) => [patient.id, patient])), [patients]);

  async function acceptQueueItem(item: QueueSession) {
    setAcceptingId(item.id);
    setError("");
    try {
      const response = await fetch("/api/org/telemedicine/queue/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: item.id }),
      });
      const payload = await readJsonResponse(response);
      if (!response.ok) {
        throw new Error(getErrorMessage(payload, "Unable to accept telemedicine request"));
      }
      await load();
    } catch (acceptError) {
      setError(acceptError instanceof Error ? acceptError.message : "Unable to accept telemedicine request");
    } finally {
      setAcceptingId("");
    }
  }

  const visibleQueue = useMemo(
    () => queueSessions.filter((item) => item.status === "pending" || item.status === "accepted" || item.status === "in_progress"),
    [queueSessions],
  );

  return (
    <div className="relative mx-auto max-w-6xl space-y-4 overflow-hidden p-4 md:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_40%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_36%)]" />

      <header className="relative rounded-3xl border border-border/70 bg-card/95 p-5 shadow-soft backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Telemedicine queue</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Review pending requests and move into live consult workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">Use the queue to accept incoming telemedicine requests and open the workspace in one step.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/dashboard/telemedicine" className="rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-muted/40">Workspace</Link>
          <Link href="/dashboard/telemedicine/profile" className="rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-muted/40">My Profile</Link>
          <span className="rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground">Live refresh {lastRefreshAt ? lastRefreshAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'pending'}</span>
        </div>
      </header>

      {loading ? <p className="text-sm text-muted-foreground">Loading queue...</p> : null}
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {!loading ? (
        <section className="rounded-3xl border border-border/70 bg-card/95 p-5 shadow-soft backdrop-blur">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Pending & Active Queue</h2>
            <button onClick={() => void load()} className="rounded-2xl border border-border px-3 py-1.5 text-xs transition hover:bg-muted/40">Refresh</button>
          </div>
          <div className="space-y-2">
            {visibleQueue.map((item, index) => {
              const patient = patientLookup.get(item.patient_id);
              return (
                <article key={item.id} className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{patient?.full_name || item.patient_id}</p>
                      <p className="text-xs text-muted-foreground">Mode: {item.preferred_mode || "video"} • {new Date(item.scheduled_at).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Requested rate: {item.requested_amount || 0} {item.requested_currency || "ETB"}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">#{index + 1}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => void acceptQueueItem(item)}
                      disabled={item.status !== "pending" || acceptingId === item.id}
                      className="rounded-2xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-60"
                    >
                      {acceptingId === item.id ? "Accepting..." : item.status === "pending" ? "Accept" : "Accepted"}
                    </button>
                    <Link href={`/dashboard/telemedicine?session_id=${encodeURIComponent(item.id)}`} className="rounded-2xl border border-border px-3 py-1.5 text-xs transition hover:bg-muted/40">Open Workspace</Link>
                  </div>
                </article>
              );
            })}
            {visibleQueue.length === 0 ? <p className="text-sm text-muted-foreground">No telemedicine queue requests right now.</p> : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
