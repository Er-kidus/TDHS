import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { createAppointment, deleteAppointment, listAppointments } from "@/lib/gateway";

function statusVariant(status: string): "success" | "waiting" | "info" | "warning" | "destructive" {
  const s = status.toLowerCase();
  if (s === "confirmed" || s === "completed") return "success";
  if (s === "booked" || s === "scheduled") return "info";
  if (s === "pending") return "waiting";
  if (s === "cancelled" || s === "canceled") return "destructive";
  return "warning";
}

const Appointments: React.FC = () => {
  const { t } = useLanguage();
  const { token, user } = useAuth();
  const qc = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [scheduledAtLocal, setScheduledAtLocal] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [patientId, setPatientId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const apptQuery = useQuery({
    queryKey: ["appointments", token],
    enabled: !!token,
    queryFn: () => listAppointments(token as string, 200),
  });

  const appointments = useMemo(() => apptQuery.data ?? [], [apptQuery.data]);

  const createMut = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Not authenticated");
      if (!scheduledAtLocal.trim()) throw new Error("Please choose a date/time");

      if (user?.role !== "patient" && !patientId.trim()) {
        throw new Error("Patient ID is required for staff-created appointments");
      }

      const iso = new Date(scheduledAtLocal).toISOString();
      return createAppointment(token, {
        scheduledAt: iso,
        reason: reason.trim() || undefined,
        notes: notes.trim() || undefined,
        patientId: user?.role === "patient" ? undefined : patientId.trim() || undefined,
      });
    },
    onMutate: () => setError(null),
    onSuccess: async () => {
      setScheduledAtLocal("");
      setReason("");
      setNotes("");
      setPatientId("");
      setShowCreate(false);
      await qc.invalidateQueries({ queryKey: ["appointments", token] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Failed to create appointment"),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error("Not authenticated");
      await deleteAppointment(token, id);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["appointments", token] });
    },
  });

  return (
    <div className="p-4 md:p-6 max-w-screen-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{t("nav.appointments")}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => apptQuery.refetch()}>
            <Calendar className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setShowCreate((v) => !v)}>
            <Plus className="h-3.5 w-3.5" /> New Appointment
          </Button>
        </div>
      </div>

      {showCreate && (
        <div className="bg-card rounded-lg border shadow-soft p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Create appointment</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>
              Close
            </Button>
          </div>

          {error && (
            <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Scheduled at</label>
              <Input type="datetime-local" value={scheduledAtLocal} onChange={(e) => setScheduledAtLocal(e.target.value)} className="h-11" />
            </div>

            {user?.role !== "patient" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Patient ID</label>
                <Input value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="UUID" className="h-11" />
              </div>
            )}

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Reason</label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Follow-up" className="h-11" />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" className="min-h-[80px]" />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}>
                {createMut.isPending ? "Creating…" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-lg border shadow-soft divide-y">
        {apptQuery.isLoading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading appointments…</div>
        ) : apptQuery.isError ? (
          <div className="p-4 text-sm text-destructive">Failed to load appointments.</div>
        ) : appointments.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No appointments.</div>
        ) : (
          appointments.map((apt) => {
            const when = new Date(apt.scheduled_at);
            const dateLabel = when.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
            const timeLabel = when.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
            return (
              <div key={apt.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">{apt.reason ?? "Appointment"}</p>
                    <StatusBadge variant={statusVariant(apt.status)} size="sm" dot>
                      {apt.status}
                    </StatusBadge>
                  </div>
                  <p className="text-xs text-muted-foreground">{dateLabel} • {timeLabel}</p>
                  {user?.role !== "patient" && (
                    <p className="text-xs text-muted-foreground">Patient: {apt.patient_id}</p>
                  )}
                  {apt.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{apt.notes}</p>}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={deleteMut.isPending}
                  onClick={() => deleteMut.mutate(apt.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Appointments;
