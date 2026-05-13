"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, FileSignature } from "lucide-react";

type Prescription = {
  id: string;
  medication_name?: string;
  medication?: string;
  dosage?: string;
  frequency?: string;
  prescribing_doctor?: string;
  status?: string;
  instructions?: string;
  duration_days?: number;
  created_at?: string;
  updated_at?: string;
};

export function PatientPrescriptionsSection({ prescriptions }: { prescriptions: Prescription[] }) {
  const [selectedId, setSelectedId] = useState(prescriptions[0]?.id ?? "");

  useEffect(() => {
    if (!prescriptions.length) {
      setSelectedId("");
      return;
    }

    if (!selectedId || !prescriptions.some((item) => item.id === selectedId)) {
      setSelectedId(prescriptions[0].id);
    }
  }, [prescriptions, selectedId]);

  const selected = useMemo(() => prescriptions.find((item) => item.id === selectedId) ?? prescriptions[0] ?? null, [prescriptions, selectedId]);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <FileSignature className="h-4 w-4 text-primary" />
            Prescriptions
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Click a prescription to open the full medication details.</p>
        </div>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">{prescriptions.length} records</span>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-2">
          {prescriptions.length ? (
            prescriptions.map((item) => {
              const title = item.medication_name || item.medication || "Prescription";
              const active = item.id === selected?.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`flex w-full items-start justify-between gap-3 rounded-2xl border p-4 text-left transition ${active ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted"}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{[item.dosage, item.frequency].filter(Boolean).join(" • ") || "Open to view dose and schedule"}</p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">No prescriptions have been released yet.</div>
          )}
        </div>

        <aside className="rounded-2xl border border-border bg-background p-4">
          {selected ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Medication detail</p>
                <h4 className="mt-1 text-lg font-semibold">{selected.medication_name || selected.medication || "Prescription"}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{selected.status || "pending"}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Detail label="Dose" value={selected.dosage || "-"} />
                <Detail label="Frequency" value={selected.frequency || "-"} />
                <Detail label="Duration" value={selected.duration_days ? `${selected.duration_days} days` : "-"} />
                <Detail label="Prescriber" value={selected.prescribing_doctor || "Doctor"} />
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Instructions</p>
                <p className="mt-2 text-sm text-foreground">{selected.instructions || "No special instructions were recorded."}</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
                Saved on {formatDate(selected.updated_at || selected.created_at)}. The record is fetched from the patient portal API and reflects the doctor workflow data stored in PostgreSQL.
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">Select a prescription to review the details.</div>
          )}
        </aside>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}