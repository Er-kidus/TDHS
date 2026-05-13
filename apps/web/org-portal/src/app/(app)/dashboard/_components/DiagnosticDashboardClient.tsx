"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle, Clock, FlaskConical, ScanSearch, TestTube2, UserRound } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";

type DiagnosticServiceArea = "lab" | "imaging";

type DiagnosticOrderRecord = {
  id: string;
  orderId: string;
  appointmentId: string;
  patientId: string;
  patientName?: string;
  testName: string;
  indication: string;
  priority: "routine" | "urgent" | "asap";
  status: "pending_collection" | "received_in_lab" | "pending_review" | "finalized" | "critical";
  serviceArea?: DiagnosticServiceArea;
  createdAt: string;
  results?: {
    value?: string;
    notes?: string;
    enteredAt?: string;
  };
};

type Patient = {
  id: string;
  full_name: string;
};

type ResultDraft = {
  value: string;
  notes: string;
  critical: boolean;
};

const SERVICE_LABELS: Record<
  DiagnosticServiceArea,
  {
    title: string;
    subtitle: string;
    icon: typeof FlaskConical;
    pendingLabel: string;
    processingLabel: string;
    completedLabel: string;
    priorityLabel: string;
  }
> = {
  lab: {
    title: "Lab Dashboard",
    subtitle: "Select a patient, complete all requested tests, then submit all results to doctor at once.",
    icon: FlaskConical,
    pendingLabel: "Pending Orders",
    processingLabel: "In Processing",
    completedLabel: "Completed",
    priorityLabel: "High Priority",
  },
  imaging: {
    title: "Imaging Dashboard",
    subtitle: "Select a patient, complete all requested studies, then submit all reports to doctor at once.",
    icon: ScanSearch,
    pendingLabel: "Pending Requests",
    processingLabel: "In Progress",
    completedLabel: "Completed",
    priorityLabel: "High Priority",
  },
};

export function DiagnosticDashboardClient({ serviceArea }: { serviceArea: DiagnosticServiceArea }) {
  const config = SERVICE_LABELS[serviceArea];
  const [orders, setOrders] = useState<DiagnosticOrderRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [patientIdReentry, setPatientIdReentry] = useState("");
  const [resultDrafts, setResultDrafts] = useState<Record<string, ResultDraft>>({});
  const [submittingAll, setSubmittingAll] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, patientsRes] = await Promise.all([
        fetch(`/api/org/doctor-workflow?kind=labOrders&serviceArea=${serviceArea}`, { cache: "no-store" }),
        fetch("/api/org/patients?limit=300", { cache: "no-store" }),
      ]);

      const ordersBody = (await ordersRes.json().catch(() => [])) as DiagnosticOrderRecord[];
      const patientsBody = (await patientsRes.json().catch(() => [])) as Patient[];
      const nextOrders = Array.isArray(ordersBody) ? ordersBody.filter((item) => (item.serviceArea || "lab") === serviceArea) : [];

      setOrders(nextOrders);
      setPatients(Array.isArray(patientsBody) ? patientsBody : []);

      if (!selectedPatientId && nextOrders.length > 0) {
        setSelectedPatientId(nextOrders[0].patientId);
      } else if (selectedPatientId && !nextOrders.some((item) => item.patientId === selectedPatientId)) {
        setSelectedPatientId(nextOrders[0]?.patientId || "");
      }
    } finally {
      setLoading(false);
    }
  }, [serviceArea, selectedPatientId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Poll for new orders so lab technicians see incoming requests in near-real-time
  useEffect(() => {
    const id = setInterval(() => {
      void loadData();
    }, 5000);
    return () => clearInterval(id);
  }, [loadData]);

  const patientLookup = useMemo(() => new Map(patients.map((item) => [item.id, item.full_name])), [patients]);

  const metrics = useMemo(
    () => ({
      pending: orders.filter((item) => item.status === "pending_collection").length,
      processing: orders.filter((item) => item.status === "received_in_lab" || item.status === "pending_review").length,
      completed: orders.filter((item) => item.status === "finalized").length,
      critical: orders.filter((item) => item.priority === "asap" || item.priority === "urgent" || item.status === "critical").length,
    }),
    [orders],
  );

  const groupedByPatient = useMemo(() => {
    const map = new Map<string, DiagnosticOrderRecord[]>();
    for (const order of orders) {
      const current = map.get(order.patientId) || [];
      current.push(order);
      map.set(order.patientId, current);
    }
    for (const [key, value] of map.entries()) {
      value.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      map.set(key, value);
    }
    return map;
  }, [orders]);

  const patientQueue = useMemo(
    () =>
      Array.from(groupedByPatient.entries())
        .map(([patientId, patientOrders]) => {
          const openCount = patientOrders.filter((item) => item.status !== "finalized").length;
          const criticalCount = patientOrders.filter((item) => item.status === "critical").length;
          return {
            patientId,
            patientName: patientLookup.get(patientId) || patientOrders[0]?.patientName || patientId,
            totalCount: patientOrders.length,
            openCount,
            criticalCount,
            latestAt: patientOrders[0]?.createdAt,
          };
        })
        .sort((a, b) => new Date(b.latestAt || 0).getTime() - new Date(a.latestAt || 0).getTime()),
    [groupedByPatient, patientLookup],
  );

  const selectedPatientOrders = selectedPatientId ? groupedByPatient.get(selectedPatientId) || [] : [];

  useEffect(() => {
    if (!selectedPatientId) {
      setResultDrafts({});
      setPatientIdReentry("");
      return;
    }

    setPatientIdReentry(selectedPatientId);
    setResultDrafts((previous) => {
      const patientOrders = groupedByPatient.get(selectedPatientId) || [];
      const next: Record<string, ResultDraft> = {};
      for (const order of patientOrders) {
        const previousDraft = previous[order.id];
        next[order.id] = {
          value: previousDraft?.value ?? order.results?.value ?? "",
          notes: previousDraft?.notes ?? order.results?.notes ?? "",
          critical: previousDraft?.critical ?? order.status === "critical",
        };
      }
      return next;
    });
  }, [selectedPatientId, groupedByPatient]);

  const allTestsCompleted = useMemo(() => {
    if (selectedPatientOrders.length === 0) return false;
    return selectedPatientOrders.every((order) => (resultDrafts[order.id]?.value || "").trim().length > 0);
  }, [selectedPatientOrders, resultDrafts]);

  const Icon = config.icon;

  async function submitAllForPatient() {
    if (!selectedPatientId || selectedPatientOrders.length === 0) return;
    if (!allTestsCompleted || !patientIdReentry.trim()) return;

    setSubmittingAll(true);
    setSubmitMessage("");
    setSubmitError("");

    try {
      for (const order of selectedPatientOrders) {
        const draft = resultDrafts[order.id];
        const response = await fetch("/api/org/doctor-workflow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save_lab_results",
            appointmentId: order.appointmentId,
            orderId: order.orderId,
            resultValue: draft.value,
            resultNotes: draft.notes,
            patientIdReentry: patientIdReentry.trim(),
            criticalAlert: draft.critical,
          }),
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error || `Failed to save result for ${order.testName}`);
        }
      }

      setSubmitMessage(`${selectedPatientOrders.length} result(s) submitted to doctor successfully.`);
      await loadData();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit results.");
    } finally {
      setSubmittingAll(false);
    }
  }

  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold">{config.title}</h1>
        <p className="text-sm text-muted-foreground">{config.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title={config.pendingLabel} value={String(metrics.pending)} icon={<Clock className="h-5 w-5" />} variant="warning" />
        <StatCard title={config.processingLabel} value={String(metrics.processing)} icon={<Icon className="h-5 w-5" />} variant="primary" />
        <StatCard title={config.completedLabel} value={String(metrics.completed)} icon={<CheckCircle className="h-5 w-5" />} variant="success" />
        <StatCard title={config.priorityLabel} value={String(metrics.critical)} icon={<AlertCircle className="h-5 w-5" />} variant="destructive" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px,1fr]">
        <section className="rounded-2xl border bg-card p-4 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <UserRound className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Patients with Requests</h2>
          </div>

          <div className="space-y-2">
            {patientQueue.map((patient) => {
              const active = patient.patientId === selectedPatientId;
              return (
                <button
                  key={patient.patientId}
                  type="button"
                  onClick={() => {
                    setSelectedPatientId(patient.patientId);
                    setSubmitMessage("");
                    setSubmitError("");
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition ${active ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-muted/40"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{patient.patientName}</p>
                    {patient.criticalCount > 0 ? <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive">Critical {patient.criticalCount}</span> : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{patient.totalCount} test(s) requested</p>
                  <p className="mt-1 text-xs text-muted-foreground">{patient.openCount} pending for technician</p>
                </button>
              );
            })}

            {!loading && patientQueue.length === 0 ? <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No {serviceArea} requests in queue yet.</p> : null}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{selectedPatientId ? patientLookup.get(selectedPatientId) || selectedPatientId : "Select a patient"}</h3>
              <p className="text-sm text-muted-foreground">Fill all requested test results below, then submit once to doctor.</p>
            </div>
            <Icon className="h-5 w-5 text-primary" />
          </div>

          {selectedPatientOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">Choose a patient from the left panel to display all requested tests.</div>
          ) : (
            <div className="space-y-4">
              <label className="block space-y-1 text-sm">
                <span className="font-medium">Re-enter patient ID to verify before submit</span>
                <input
                  value={patientIdReentry}
                  onChange={(event) => setPatientIdReentry(event.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                />
              </label>

              {selectedPatientOrders.map((order) => {
                const draft = resultDrafts[order.id] || { value: "", notes: "", critical: order.status === "critical" };

                return (
                  <article key={order.id} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="flex items-center gap-2 text-base font-semibold">
                          <TestTube2 className="h-4 w-4 text-primary" /> {order.testName}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">{order.indication || "No indication added"}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge variant={order.priority === "routine" ? "scheduled" : order.priority === "urgent" ? "warning" : "urgent"} size="sm" dot>
                          {order.status.replaceAll("_", " ")}
                        </StatusBadge>
                        <span className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="space-y-1 text-sm">
                        <span className="font-medium">Result value</span>
                        <input
                          value={draft.value}
                          onChange={(event) => {
                            const value = event.target.value;
                            setResultDrafts((current) => ({
                              ...current,
                              [order.id]: { ...draft, value },
                            }));
                          }}
                          className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
                          placeholder="e.g. Positive, 4.6 mmol/L"
                        />
                      </label>

                      <label className="space-y-1 text-sm">
                        <span className="font-medium">Result notes</span>
                        <input
                          value={draft.notes}
                          onChange={(event) => {
                            const notes = event.target.value;
                            setResultDrafts((current) => ({
                              ...current,
                              [order.id]: { ...draft, notes },
                            }));
                          }}
                          className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
                          placeholder="Additional notes for doctor"
                        />
                      </label>
                    </div>

                    <label className="mt-3 inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={draft.critical}
                        onChange={(event) => {
                          const critical = event.target.checked;
                          setResultDrafts((current) => ({
                            ...current,
                            [order.id]: { ...draft, critical },
                          }));
                        }}
                      />
                      Mark this test as critical
                    </label>
                  </article>
                );
              })}

              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-medium">Completion status</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {allTestsCompleted
                    ? "All requested tests have results. You can submit now."
                    : "Fill result value for every requested test before submission."}
                </p>
              </div>

              {submitError ? <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{submitError}</p> : null}
              {submitMessage ? <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{submitMessage}</p> : null}

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={submittingAll || !allTestsCompleted || !patientIdReentry.trim()}
                  onClick={() => void submitAllForPatient()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {submittingAll ? "Submitting all results..." : "Submit All Results to Doctor"}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
