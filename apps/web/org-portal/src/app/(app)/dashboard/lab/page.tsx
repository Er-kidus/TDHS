"use client";

import { useEffect, useMemo, useState } from "react";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AlertCircle, CheckCircle, Clock, FlaskConical } from "lucide-react";

type LabOrderRecord = {
  id: string;
  appointmentId: string;
  patientId: string;
  testName: string;
  indication: string;
  priority: "routine" | "urgent" | "asap";
  status: "requested" | "sample_collected" | "completed";
  createdAt: string;
};

type Patient = {
  id: string;
  full_name: string;
};

export default function LabDashboardPage() {
  const [labOrders, setLabOrders] = useState<LabOrderRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [ordersRes, patientsRes] = await Promise.all([
          fetch("/api/org/doctor-workflow?kind=labOrders", { cache: "no-store" }),
          fetch("/api/org/patients?limit=300", { cache: "no-store" }),
        ]);
        const ordersBody = (await ordersRes.json().catch(() => [])) as LabOrderRecord[];
        const patientsBody = (await patientsRes.json().catch(() => [])) as Patient[];
        setLabOrders(Array.isArray(ordersBody) ? ordersBody : []);
        setPatients(Array.isArray(patientsBody) ? patientsBody : []);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const patientLookup = useMemo(() => new Map(patients.map((item) => [item.id, item.full_name])), [patients]);
  const metrics = useMemo(
    () => ({
      pending: labOrders.filter((item) => item.status === "requested").length,
      processing: labOrders.filter((item) => item.status === "sample_collected").length,
      completed: labOrders.filter((item) => item.status === "completed").length,
      critical: labOrders.filter((item) => item.priority === "asap" || item.priority === "urgent").length,
    }),
    [labOrders],
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-2xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold">Lab Dashboard</h1>
        <p className="text-sm text-muted-foreground">Lab orders and diagnostic requests routed from the doctor workflow.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Pending Orders" value={String(metrics.pending)} icon={<Clock className="h-5 w-5" />} variant="warning" />
        <StatCard title="In Processing" value={String(metrics.processing)} icon={<FlaskConical className="h-5 w-5" />} variant="primary" />
        <StatCard title="Completed" value={String(metrics.completed)} icon={<CheckCircle className="h-5 w-5" />} variant="success" />
        <StatCard title="High Priority" value={String(metrics.critical)} icon={<AlertCircle className="h-5 w-5" />} variant="destructive" />
      </div>

      <div className="bg-card rounded-lg border shadow-soft">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" /> Test Queue
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Patient</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Test</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Indication</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {labOrders.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{patientLookup.get(item.patientId) || item.patientId}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.testName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.indication}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={item.priority === "routine" ? "scheduled" : item.priority === "urgent" ? "warning" : "urgent"} size="sm" dot>
                      {item.status.replaceAll("_", " ")}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && labOrders.length === 0 ? <p className="px-4 py-4 text-sm text-muted-foreground">No lab orders in queue yet.</p> : null}
        </div>
      </div>
    </div>
  );
}
