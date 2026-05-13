"use client";

import { useState } from "react";
import { Activity, CalendarPlus2, ClipboardList, FilePlus2, FlaskConical, Stethoscope } from "lucide-react";
import LabOrderModal from "./LabOrderModal";
import type { ActionPanel, Appointment } from "./types";

export function WorkflowForms({
  appointment,
  defaultFollowUpDate,
  canStartConsult,
  canOrderDuringConsult,
  canCompleteVisit,
  isSubmitting,
  onSubmitAction,
}: {
  appointment: Appointment | null;
  defaultFollowUpDate: string;
  canStartConsult: boolean;
  canOrderDuringConsult: boolean;
  canCompleteVisit: boolean;
  isSubmitting: boolean;
  onSubmitAction: (payload: Record<string, unknown>, successMessage: string) => Promise<void>;
}) {
  const [activePanel, setActivePanel] = useState<ActionPanel>("consult");
  const [labForm, setLabForm] = useState({ testName: "", indication: "", priority: "routine" as "routine" | "urgent" | "asap", serviceArea: "lab" as "lab" | "imaging" });
  const [prescriptionForm, setPrescriptionForm] = useState({ medication: "", dosage: "", frequency: "", durationDays: "5", instructions: "" });
  const [followUpForm, setFollowUpForm] = useState({ scheduledAt: defaultFollowUpDate, reason: `Follow-up for ${appointment?.reason || "recent consultation"}`, notes: "" });
  const [showLabModal, setShowLabModal] = useState(false);
  const [completeForm, setCompleteForm] = useState({ summary: "", disposition: "completed" });

  if (!appointment) {
    return (
      <article className="rounded-lg border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
        Select a patient to open clinical actions.
      </article>
    );
  }

  async function startConsult() {
    if (!appointment) return;
    await onSubmitAction({ action: "start_consult", appointmentId: appointment.id }, "Consultation started.");
    setActivePanel("lab");
  }

  async function routeToOpd() {
    if (!appointment) return;
    await onSubmitAction({ action: "route_to_opd", appointmentId: appointment.id }, "Patient routed to OPD.");
  }

  return (
    <article className="rounded-lg border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap gap-2">
        <ActionButton active={activePanel === "consult"} disabled={!canStartConsult || isSubmitting} onClick={() => void startConsult()} icon={<Stethoscope className="h-4 w-4" />} label="Start" />
        <ActionButton
          active={activePanel === "lab"}
          disabled={!canOrderDuringConsult}
          onClick={() => {
            setActivePanel("lab");
            setShowLabModal(true);
          }}
          icon={<FlaskConical className="h-4 w-4" />}
          label="Lab"
        />
        <ActionButton active={activePanel === "prescription"} disabled={!canOrderDuringConsult} onClick={() => setActivePanel("prescription")} icon={<FilePlus2 className="h-4 w-4" />} label="Prescription" />
        <ActionButton active={activePanel === "followup"} disabled={!canOrderDuringConsult} onClick={() => setActivePanel("followup")} icon={<CalendarPlus2 className="h-4 w-4" />} label="Follow-up" />
        <ActionButton active={false} disabled={!canOrderDuringConsult || isSubmitting} onClick={() => void routeToOpd()} icon={<Activity className="h-4 w-4" />} label="OPD" />
        <ActionButton active={activePanel === "complete"} disabled={!canCompleteVisit} onClick={() => setActivePanel("complete")} icon={<ClipboardList className="h-4 w-4" />} label="Complete" />
      </div>

      <div className="mt-5 border-t border-border pt-5">
        {activePanel === "consult" ? <p className="text-sm text-muted-foreground">Start the consultation to mark the visit as active.</p> : null}

        {activePanel === "lab" ? (
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">Use the Lab modal to create diagnostic orders. The modal opened when you clicked <strong>Lab</strong> will let you pick categories and tests.</p>
          </div>
        ) : null}

          <LabOrderModal
            open={showLabModal}
            onClose={() => setShowLabModal(false)}
            onSend={async (tests, priority, serviceArea, indication) => {
              // Send each selected test as an individual lab order (server accepts single testName per request)
              for (const testName of tests) {
                await onSubmitAction({ action: "send_to_lab", appointmentId: appointment.id, testName, indication, priority, serviceArea }, "Lab order placed.");
              }
            }}
          />

        {activePanel === "prescription" ? (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              await onSubmitAction({ action: "open_prescription", appointmentId: appointment.id, ...prescriptionForm, durationDays: Number(prescriptionForm.durationDays) }, "Prescription saved.");
              setPrescriptionForm({ medication: "", dosage: "", frequency: "", durationDays: "5", instructions: "" });
            }}
            className="space-y-4"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Medication" value={prescriptionForm.medication} onChange={(value) => setPrescriptionForm((current) => ({ ...current, medication: value }))} placeholder="Amoxicillin" />
              <Field label="Dosage" value={prescriptionForm.dosage} onChange={(value) => setPrescriptionForm((current) => ({ ...current, dosage: value }))} placeholder="500 mg" />
              <Field label="Frequency" value={prescriptionForm.frequency} onChange={(value) => setPrescriptionForm((current) => ({ ...current, frequency: value }))} placeholder="Twice daily" />
              <Field label="Duration days" type="number" value={prescriptionForm.durationDays} onChange={(value) => setPrescriptionForm((current) => ({ ...current, durationDays: value }))} />
            </div>
            <TextArea label="Instructions" value={prescriptionForm.instructions} onChange={(value) => setPrescriptionForm((current) => ({ ...current, instructions: value }))} />
            <SubmitButton disabled={isSubmitting || !canOrderDuringConsult} label="Save Prescription" busy={isSubmitting} />
          </form>
        ) : null}

        {activePanel === "followup" ? (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              await onSubmitAction({ action: "another_appointment", appointmentId: appointment.id, ...followUpForm }, "Follow-up created.");
            }}
            className="space-y-4"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Date and time" type="datetime-local" value={followUpForm.scheduledAt} onChange={(value) => setFollowUpForm((current) => ({ ...current, scheduledAt: value }))} />
              <Field label="Reason" value={followUpForm.reason} onChange={(value) => setFollowUpForm((current) => ({ ...current, reason: value }))} />
            </div>
            <TextArea label="Notes" value={followUpForm.notes} onChange={(value) => setFollowUpForm((current) => ({ ...current, notes: value }))} />
            <SubmitButton disabled={isSubmitting || !canOrderDuringConsult} label="Create Follow-up" busy={isSubmitting} />
          </form>
        ) : null}

        {activePanel === "complete" ? (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              await onSubmitAction({ action: "complete_visit", appointmentId: appointment.id, ...completeForm }, "Visit completed.");
              setCompleteForm({ summary: "", disposition: "completed" });
            }}
            className="space-y-4"
          >
            <TextArea label="Visit summary" value={completeForm.summary} onChange={(value) => setCompleteForm((current) => ({ ...current, summary: value }))} />
            <Field label="Disposition" value={completeForm.disposition} onChange={(value) => setCompleteForm((current) => ({ ...current, disposition: value }))} />
            <SubmitButton disabled={isSubmitting || !canCompleteVisit} label="Complete Visit" busy={isSubmitting} />
          </form>
        ) : null}
      </div>
    </article>
  );
}

function ActionButton({ active, disabled, onClick, icon, label }: { active: boolean; disabled?: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold disabled:opacity-50 ${active ? "bg-primary text-primary-foreground" : "border border-border bg-background hover:bg-muted"}`}>
      {icon}
      {label}
    </button>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      <input type={type} min={type === "number" ? 1 : undefined} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
    </label>
  );
}

function SubmitButton({ disabled, busy, label }: { disabled?: boolean; busy?: boolean; label: string }) {
  return (
    <button type="submit" disabled={disabled} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
      {busy ? "Saving..." : label}
    </button>
  );
}
