"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { StatCard } from "@/components/StatCard";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Clock3,
  CreditCard,
  FileBarChart2,
  MessageSquare,
  Pill,
  Sparkles,
} from "lucide-react";

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
  test: string;
  status: "Completed" | "Pending";
  date: string;
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
  messages,
  notifications,
  stats,
}: {
  patient: Patient;
  appointments: Appointment[];
  labs?: LabResult[];
messages?: Message[];
notifications?: Notification[];
stats?: Stats;
}) {
  const nextAppointment = appointments?.[0];

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
          value={stats?.activePrescriptions?.toString() ?? "—"}
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

      {/* LAB RESULTS */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <FileBarChart2 className="h-4 w-4 text-info" />
          Lab Results
        </h3>

        {labs?.length ? (
          labs.map((l) => (
            <div
              key={l.test}
              className="rounded-lg border border-border bg-background px-3 py-2 flex items-center justify-between text-sm"
            >
              <div>
                <p className="font-medium">{l.test}</p>
                <p className="text-xs text-muted-foreground">{l.date}</p>
              </div>

              <span
                className={
                  "text-xs rounded-full px-2 py-0.5 " +
                  (l.status === "Pending"
                    ? "bg-warning/15 text-warning"
                    : "bg-success/15 text-success")
                }
              >
                {l.status}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No lab results</p>
        )}
      </section>

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