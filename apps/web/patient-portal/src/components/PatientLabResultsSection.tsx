"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, FlaskConical } from "lucide-react";

type LabResult = {
  id: string;
  test_name?: string;
  test?: string;
  status?: string;
  result_value?: string;
  result_notes?: string;
  normal_range?: string;
  abnormal?: boolean;
  created_at?: string;
  updated_at?: string;
};

export function PatientLabResultsSection({ labs }: { labs: LabResult[] }) {
  const [selectedId, setSelectedId] = useState(labs[0]?.id ?? "");

  useEffect(() => {
    if (!labs.length) {
      setSelectedId("");
      return;
    }

    if (!selectedId || !labs.some((item) => item.id === selectedId)) {
      setSelectedId(labs[0].id);
    }
  }, [labs, selectedId]);

  const selected = useMemo(() => labs.find((item) => item.id === selectedId) ?? labs[0] ?? null, [labs, selectedId]);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-info" />
            Lab Results
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Submitted lab results are shown here for the patient once the technician saves them.</p>
        </div>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">{labs.length} records</span>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-2">
          {labs.length ? (
            labs.map((item) => {
              const title = item.test_name || item.test || "Lab result";
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
                    <p className="mt-1 text-xs text-muted-foreground">{item.status || "pending"}</p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">No lab results have been submitted yet.</div>
          )}
        </div>

        <aside className="rounded-2xl border border-border bg-background p-4">
          {selected ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Result detail</p>
                <h4 className="mt-1 text-lg font-semibold">{selected.test_name || selected.test || "Lab result"}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{selected.status || "pending"}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Detail label="Result" value={selected.result_value || "Awaiting result"} emphasis={Boolean(selected.abnormal)} />
                <Detail label="Range" value={selected.normal_range || "-"} />
                <Detail label="Reviewed" value={selected.updated_at || selected.created_at ? new Date(selected.updated_at || selected.created_at || "").toLocaleString() : "-"} />
                <Detail label="Flag" value={selected.abnormal ? "Abnormal" : "Normal"} />
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Technician notes</p>
                <p className="mt-2 text-sm text-foreground">{selected.result_notes || "No notes were added to this result."}</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
                This record comes from the shared PostgreSQL workflow tables and is surfaced in the patient portal after the lab technician submits the final result.
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">Select a lab result to review the full details.</div>
          )}
        </aside>
      </div>
    </section>
  );
}

function Detail({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 ${emphasis ? "border-red-200 bg-red-50" : "border-border bg-card"}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}