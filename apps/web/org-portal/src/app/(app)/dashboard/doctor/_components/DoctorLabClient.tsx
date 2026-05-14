"use client";

import { useState } from "react";
import {
  FlaskConical,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Activity,
  ScanLine,
  FileText,
  X,
} from "lucide-react";

import { DoctorWorkspaceShell } from "./DoctorWorkspaceShell";
import LabOrderModal from "./LabOrderModal";
import { PatientPanel } from "./PatientPanel";
import { useDoctorWorkspace } from "./useDoctorWorkspace";
import { formatStatusLabel } from "./utils";

function ResultPreviewModal({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: any;
}) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-4xl rounded-3xl border border-border bg-background shadow-2xl">
          {/* HEADER */}
          <div className="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                {item.serviceArea === "imaging" ? (
                  <ScanLine className="h-6 w-6 text-primary" />
                ) : (
                  <FlaskConical className="h-6 w-6 text-primary" />
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Diagnostic Result
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight">
                  {item.testName}
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {formatStatusLabel(item.status)}
                  </span>

                  <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {item.serviceArea || "Laboratory"}
                  </span>

                  {item.criticalAlert && (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      Critical Result
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border transition hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* CONTENT */}
          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_320px]">
            {/* MAIN */}
            <div className="space-y-5">
              {/* RESULT */}
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-700" />

                  <h3 className="font-semibold text-emerald-950">
                    Result Summary
                  </h3>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Result Value
                    </p>

                    <p className="mt-2 text-3xl font-bold text-emerald-950">
                      {item.results?.value || "Pending"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Interpretation
                    </p>

                    <p className="mt-2 text-sm leading-relaxed text-emerald-950">
                      {item.results?.interpretation ||
                        "No interpretation available."}
                    </p>
                  </div>
                </div>
              </div>

              {/* NOTES */}
              <div className="rounded-3xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />

                  <h3 className="font-semibold">
                    Technician / Radiologist Notes
                  </h3>
                </div>

                <div className="mt-4 rounded-2xl bg-muted/40 p-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.results?.notes ||
                      "No additional notes have been added for this result."}
                  </p>
                </div>
              </div>

              {/* CLINICAL INDICATION */}
              <div className="rounded-3xl border border-border bg-card p-5">
                <h3 className="font-semibold">
                  Clinical Indication
                </h3>

                <div className="mt-4 rounded-2xl bg-muted/40 p-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.indication || "No indication documented."}
                  </p>
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-4">
              <div className="rounded-3xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Patient
                </p>

                <h3 className="mt-2 text-lg font-semibold">
                  {item.patientName || item.patientId}
                </h3>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-muted/40 p-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Priority
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {item.priority}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-muted/40 p-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Verification
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {item.verificationStatus || "Pending"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-muted/40 p-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Department
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {item.serviceArea || "Laboratory"}
                    </p>
                  </div>
                </div>
              </div>

              {item.criticalAlert && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-red-700" />

                    <div>
                      <h4 className="font-semibold text-red-700">
                        Critical Alert
                      </h4>

                      <p className="mt-1 text-sm text-red-600">
                        This diagnostic result has been marked as critical and
                        requires immediate clinical attention.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DoctorLabClient() {
  const workspace = useDoctorWorkspace();

  const [showLabModal, setShowLabModal] = useState(false);

  const [selectedResult, setSelectedResult] = useState<any | null>(null);

  return (
    <DoctorWorkspaceShell
      view="lab"
      onRefresh={() => void workspace.loadData()}
      loadingError={workspace.loadingError}
      actionError={workspace.actionError}
      actionMessage={workspace.actionMessage}
    >
     

        {/* MAIN CONTENT */}
        <div className="space-y-5">
          {/* HEADER */}
          <article className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Laboratory Workspace
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight">
                  Diagnostic Orders & Results
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Create laboratory or radiology orders, monitor verification
                  progress, and review finalized diagnostic reports.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowLabModal(true)}
                disabled={!workspace.selectedAppointment}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FlaskConical className="h-4 w-4" />
                Create Diagnostic Order
              </button>
            </div>
          </article>

          {/* RESULTS */}
          <div className="space-y-4">
            {workspace.workflow.labOrders.length ? (
              workspace.workflow.labOrders.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
                >
                  {/* TOP */}
                  <div className="border-b border-border bg-muted/30 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-semibold tracking-tight">
                            {item.testName}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                              item.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {formatStatusLabel(item.status)}
                          </span>

                          {item.criticalAlert && (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-red-700">
                              Critical
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                          <p>
                            Patient:{" "}
                            {item.patientName ||
                              workspace.selectedPatient?.full_name ||
                              item.patientId}
                          </p>

                          <p>
                            Service: {item.serviceArea || "Laboratory"}
                          </p>

                          <p>Priority: {item.priority}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedResult(item)}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 text-sm font-semibold transition hover:bg-muted"
                      >
                        <Eye className="h-4 w-4" />
                        View Full Result
                      </button>
                    </div>
                  </div>

                  {/* BODY */}
                  <div className="grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
                    {/* LEFT */}
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-border bg-background p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Clinical Indication
                        </p>

                        <p className="mt-2 text-sm leading-relaxed">
                          {item.indication ||
                            "No indication documented."}
                        </p>
                      </div>

                      {item.results ? (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-700" />

                            <h4 className="font-semibold text-emerald-950">
                              Result Available
                            </h4>
                          </div>

                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                Result
                              </p>

                              <p className="mt-2 text-2xl font-bold text-emerald-950">
                                {item.results.value}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                Notes
                              </p>

                              <p className="mt-2 text-sm leading-relaxed text-emerald-900">
                                {item.results.notes ||
                                  "No notes available."}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                          <Clock3 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                          <h4 className="text-sm font-semibold">
                            Awaiting Diagnostic Result
                          </h4>

                          <p className="mt-1 text-xs text-muted-foreground">
                            The laboratory or radiology team has not submitted
                            the finalized result yet.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* RIGHT */}
                    <aside className="space-y-4">
                      <div className="rounded-2xl border border-border bg-background p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Verification Status
                        </p>

                        <p className="mt-2 text-sm font-semibold">
                          {item.verificationStatus || "Pending"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border bg-background p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Department
                        </p>

                        <p className="mt-2 text-sm font-semibold capitalize">
                          {item.serviceArea || "Laboratory"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border bg-background p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Order Priority
                        </p>

                        <p className="mt-2 text-sm font-semibold capitalize">
                          {item.priority}
                        </p>
                      </div>
                    </aside>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
                <FlaskConical className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />

                <h3 className="text-xl font-semibold">
                  No Diagnostic Orders
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Laboratory and radiology requests for the selected patient
                  will appear here.
                </p>
              </div>
            )}
          </div>
        </div>


      {/* ORDER MODAL */}
      <LabOrderModal
        open={showLabModal}
        onClose={() => setShowLabModal(false)}
        onSend={async (
          tests,
          priority,
          serviceArea,
          indication,
        ) => {
          for (const testName of tests) {
            await workspace.submitDoctorAction(
              {
                action: "send_to_lab",
                appointmentId: workspace.selectedAppointment?.id,
                testName,
                indication,
                priority,
                serviceArea,
              },
              "Diagnostic order placed successfully.",
            );
          }
        }}
      />

      {/* RESULT MODAL */}
      <ResultPreviewModal
        open={!!selectedResult}
        item={selectedResult}
        onClose={() => setSelectedResult(null)}
      />
    </DoctorWorkspaceShell>
  );
}