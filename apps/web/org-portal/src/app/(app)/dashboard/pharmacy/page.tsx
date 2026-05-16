"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AlertTriangle, CheckCircle, Clock, Package, Pill } from "lucide-react";
import { MedSafeAi } from "@/components/ai/MedSafeAi";

type PrescriptionRecord = {
  id: string;
  appointmentId: string;
  patientId: string;
  medication: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
  status: "draft" | "pending_dispense" | "dispensed";
  createdAt: string;
};

type Patient = {
  id: string;
  full_name: string;
};

export default function PharmacyDashboardPage() {
  const searchParams = useSearchParams();
  const highlightedPatientId = searchParams.get("patientId") || "";
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [prescriptionsRes, patientsRes] = await Promise.all([
          fetch("/api/org/doctor-workflow?kind=prescriptions", { cache: "no-store" }),
          fetch("/api/org/patients?limit=300", { cache: "no-store" }),
        ]);
        const prescriptionsBody = (await prescriptionsRes.json().catch(() => [])) as PrescriptionRecord[];
        const patientsBody = (await patientsRes.json().catch(() => [])) as Patient[];
        setPrescriptions(Array.isArray(prescriptionsBody) ? prescriptionsBody : []);
        setPatients(Array.isArray(patientsBody) ? patientsBody : []);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const patientLookup = useMemo(() => new Map(patients.map((item) => [item.id, item.full_name])), [patients]);
  const filteredPrescriptions = useMemo(
    () => (highlightedPatientId ? prescriptions.filter((item) => item.patientId === highlightedPatientId) : prescriptions),
    [highlightedPatientId, prescriptions],
  );

  const metrics = useMemo(
    () => ({
      pending: filteredPrescriptions.filter((item) => item.status === "pending_dispense" || item.status === "draft").length,
      dispensed: filteredPrescriptions.filter((item) => item.status === "dispensed").length,
      alerts: filteredPrescriptions.filter((item) => item.instructions?.toLowerCase().includes("allergy") || item.instructions?.toLowerCase().includes("interaction")).length,
      queueSize: filteredPrescriptions.length,
    }),
    [filteredPrescriptions],
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-2xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold">Pharmacy Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Prescription queue and medication handoff from doctor workflow.
          {highlightedPatientId ? ` Showing prescriptions for patient ${patientLookup.get(highlightedPatientId) || highlightedPatientId}.` : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Pending" value={String(metrics.pending)} icon={<Clock className="h-5 w-5" />} variant="warning" />
        <StatCard title="Dispensed" value={String(metrics.dispensed)} icon={<CheckCircle className="h-5 w-5" />} variant="success" />
        <StatCard title="Drug Alerts" value={String(metrics.alerts)} icon={<AlertTriangle className="h-5 w-5" />} variant="destructive" />
        <StatCard title="Queue Size" value={String(metrics.queueSize)} icon={<Package className="h-5 w-5" />} variant="warning" />
      </div>

      <div className="bg-card rounded-lg border shadow-soft">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Pill className="h-4 w-4 text-primary" /> Prescription Queue
          </h2>
        </div>
        <div className="divide-y">
          {filteredPrescriptions.map((rx) => {
            const patientName = patientLookup.get(rx.patientId) || rx.patientId;
            const hasAlert = Boolean(rx.instructions?.toLowerCase().includes("allergy") || rx.instructions?.toLowerCase().includes("interaction"));
            return (
              <div key={rx.id} className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${highlightedPatientId && rx.patientId === highlightedPatientId ? "bg-primary/5" : ""}`}>
                {hasAlert ? <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" /> : null}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{patientName}</p>
                    <StatusBadge variant={rx.status === "dispensed" ? "completed" : "waiting"} size="sm" dot>
                      {rx.status.replaceAll("_", " ")}
                    </StatusBadge>
                  </div>
                  <p className="text-xs text-muted-foreground">{rx.medication} {rx.dosage} | {rx.frequency} | {rx.durationDays} days</p>
                  <p className="text-[10px] text-muted-foreground">Created {new Date(rx.createdAt).toLocaleString()}</p>
                  {rx.instructions ? <p className="text-xs text-muted-foreground mt-1">{rx.instructions}</p> : null}
                  <div className="mt-3">
                    <MedSafeAi medication={rx.medication} dosage={rx.dosage} />
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{rx.appointmentId}</p>
                  <p>{hasAlert ? "Needs review" : "Ready"}</p>
                </div>
              </div>
            );
          })}
          {!loading && filteredPrescriptions.length === 0 ? <p className="px-4 py-4 text-sm text-muted-foreground">No prescriptions in the workflow queue yet.</p> : null}
        </div>
      </div>
    </div>
  );
}
