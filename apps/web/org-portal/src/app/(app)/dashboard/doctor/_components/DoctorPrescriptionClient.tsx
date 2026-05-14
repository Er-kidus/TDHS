"use client";

import { useEffect, useMemo, useState } from "react";
import { FileSignature, RefreshCw, ShieldCheck } from "lucide-react";
import { DoctorWorkspaceShell } from "./DoctorWorkspaceShell";
import { PatientPanel } from "./PatientPanel";
import { QueueList } from "./QueueList";
import { useDoctorWorkspace } from "./useDoctorWorkspace";

type PrescriptionFormState = {
  medication: string;
  dosage: string;
  frequency: string;
  durationDays: string;
  instructions: string;
};

const EMPTY_FORM: PrescriptionFormState = {
  medication: "",
  dosage: "",
  frequency: "",
  durationDays: "7",
  instructions: "",
};

export function DoctorPrescriptionClient() {
  const workspace = useDoctorWorkspace();
  const [form, setForm] = useState<PrescriptionFormState>(EMPTY_FORM);

  const latestPrescription = useMemo(() => workspace.workflow.prescriptions[0] || null, [workspace.workflow.prescriptions]);

  useEffect(() => {
    if (latestPrescription && workspace.selectedAppointment?.id === latestPrescription.appointmentId) {
      setForm({
        medication: latestPrescription.medication,
        dosage: latestPrescription.dosage,
        frequency: latestPrescription.frequency,
        durationDays: String(latestPrescription.durationDays),
        instructions: latestPrescription.instructions || "",
      });
      return;
    }

    setForm(EMPTY_FORM);
  }, [latestPrescription, workspace.selectedAppointment?.id]);

  return (
    <DoctorWorkspaceShell view="prescription" onRefresh={() => void workspace.loadData()} loadingError={workspace.loadingError} actionError={workspace.actionError} actionMessage={workspace.actionMessage}>


        <div className="space-y-4">
    

            {workspace.selectedPatient ? (
              <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-background p-4 md:grid-cols-4">
                <InfoBlock label="Patient" value={workspace.selectedPatient.full_name} />
                <InfoBlock label="Email" value={workspace.selectedPatient.email || "-"} />
                <InfoBlock label="Phone" value={workspace.selectedPatient.phone || "-"} />
                <InfoBlock label="Visit" value={workspace.selectedAppointment ? new Date(workspace.selectedAppointment.scheduled_at).toLocaleString() : "-"} />
              </div>
            ) : null}

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <form
                className="space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!workspace.selectedAppointment) {
                    return;
                  }

                  await workspace.submitDoctorAction(
                    {
                      action: "open_prescription",
                      appointmentId: workspace.selectedAppointment.id,
                      medication: form.medication,
                      dosage: form.dosage,
                      frequency: form.frequency,
                      durationDays: Number(form.durationDays),
                      instructions: form.instructions,
                    },
                    "Prescription saved to the doctor workflow.",
                  );

                  setForm(EMPTY_FORM);
                }}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Medication" value={form.medication} onChange={(value) => setForm((current) => ({ ...current, medication: value }))} placeholder="Amoxicillin" />
                  <Field label="Dose" value={form.dosage} onChange={(value) => setForm((current) => ({ ...current, dosage: value }))} placeholder="500 mg" />
                  <Field label="Frequency" value={form.frequency} onChange={(value) => setForm((current) => ({ ...current, frequency: value }))} placeholder="Twice daily" />
                  <Field label="Duration (days)" type="number" value={form.durationDays} onChange={(value) => setForm((current) => ({ ...current, durationDays: value }))} />
                </div>

                <label className="block space-y-2 text-sm">
                  <span className="font-medium text-foreground">Clinical instructions</span>
                  <textarea
                    value={form.instructions}
                    onChange={(event) => setForm((current) => ({ ...current, instructions: event.target.value }))}
                    placeholder="Take with food, monitor for side effects, review in 7 days."
                    className="min-h-32 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-ring/40"
                  />
                </label>

                <div className="flex flex-wrap gap-2">
                  <button type="submit" disabled={!workspace.selectedAppointment || workspace.isSubmittingAction} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                    <FileSignature className="h-4 w-4" />
                    {workspace.isSubmittingAction ? "Saving..." : "Save Prescription"}
                  </button>
                  <button type="button" onClick={() => setForm(EMPTY_FORM)} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted">
                    <RefreshCw className="h-4 w-4" />
                    Reset form
                  </button>
                </div>
              </form>

              <aside className="space-y-4 rounded-2xl border border-border bg-background p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Recent prescriptions</p>
                  <h3 className="mt-1 text-base font-semibold">Saved clinical orders</h3>
                </div>
                <div className="space-y-3">
                  {workspace.workflow.prescriptions.length ? (
                    workspace.workflow.prescriptions.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-border bg-card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{item.medication}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{item.dosage} • {item.frequency}</p>
                          </div>
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">{item.status}</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{item.durationDays} days {item.instructions ? `• ${item.instructions}` : ""}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No prescriptions saved yet for the selected patient.</p>
                  )}
                </div>

              </aside>
            </div>
          {/* </article> */}
        </div>
      {/* </section> */}
    </DoctorWorkspaceShell>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <input
        type={type}
        min={type === "number" ? 1 : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:ring-2 focus:ring-ring/40"
      />
    </label>
  );
}