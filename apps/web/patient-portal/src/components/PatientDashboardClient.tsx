"use client";

import type { ReactNode } from "react";
import { StatCard } from "@/components/StatCard";
import {
  Activity,
  AlertTriangle,
  Clock3,
  CreditCard,
  MessageSquare,
  Pill,
  Sparkles,
} from "lucide-react";
import { PatientLabResultsSection } from "@/components/PatientLabResultsSection";
import { PatientPrescriptionsSection } from "@/components/PatientPrescriptionsSection";

type Appointment = {
  id: string;
  scheduled_at: string;
  status: string;
  reason?: string;
};

type Patient = {
  full_name: string;
};

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

type Message = {
  id: string;
  text: string;
};

type Notification = {
  id: string;
  text: string;
};

type Stats = {
  outstandingBills?: string;
  activePrescriptions?: number;
  adherence?: number;
};

export function PatientDashboardClient({
  patient,
  appointments,
  labs,
  prescriptions,
  messages,
  notifications,
  stats,
}: {
  patient: Patient;
  appointments: Appointment[];
  labs?: LabResult[];
  prescriptions?: Prescription[];
messages?: Message[];
notifications?: Notification[];
stats?: Stats;
}) {
  const nextAppointment = appointments?.[0];
  const activePrescriptions = prescriptions?.length ?? stats?.activePrescriptions ?? 0;

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6 animate-fade-up">

      {/* HEADER */}
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-soft">
        <div>
          <p className="text-sm text-muted-foreground">Good afternoon</p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {patient.full_name}
          </h1>
        </div>
      </section>

      {/* STATS (NO HARDCODED DATA) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

        <StatCard
          icon={<CreditCard className="h-4 w-4" />}
          label="Outstanding Bills"
          value={stats?.outstandingBills ?? "—"}
          hint="Billing system"
          variant="warning"
        />

        <StatCard
          icon={<Pill className="h-4 w-4" />}
          label="Active Prescriptions"
          value={activePrescriptions ? activePrescriptions.toString() : "—"}
          hint="Pharmacy system"
        />

        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="Medication Adherence"
          value={
            stats?.adherence !== undefined
              ? `${stats.adherence}%`
              : "—"
          }
          hint="Tracking system"
        />
      </section>

      {/* NOTIFICATIONS */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Notifications
        </h3>

        {notifications?.length ? (
          notifications.map((n) => (
            <div
              key={n.id}
              className="rounded-lg border border-border bg-background p-3 text-sm"
            >
              {n.text}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No notifications</p>
        )}
      </section>

      <PatientPrescriptionsSection prescriptions={prescriptions ?? []} />

      <PatientLabResultsSection labs={labs ?? []} />

      {/* MESSAGES */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Messages
        </h3>

        {messages?.length ? (
          messages.map((m) => (
            <div
              key={m.id}
              className="rounded-lg border border-border bg-background p-3 text-sm"
            >
              {m.text}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No messages</p>
        )}
      </section>

      {/* APPOINTMENT */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-primary" />
          Upcoming Appointment
        </h3>

        {nextAppointment ? (
          <div className="mt-3 rounded-xl border border-border bg-background p-4">
            <p className="font-semibold">
              {nextAppointment.reason ?? "Consultation"}
            </p>
            <p className="text-sm text-muted-foreground">
              {nextAppointment.scheduled_at} • {nextAppointment.status}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-2">
            No appointments
          </p>
        )}
      </section>

      {/* AI */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Tools
        </h3>

        <button className="w-full rounded-lg border border-border bg-background p-3 text-left hover:bg-accent">
          Ask AI Doctor
        </button>
      </section>

    </div>
  );
}