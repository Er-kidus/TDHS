"use client";

import { useRouter } from "next/navigation";
import {
  Activity,
  Users,
  FlaskConical,
  ClipboardList,
  ArrowRight,
  TrendingUp,
  UserRound,
  Stethoscope,
  Clock3,
  ShieldCheck,
  CalendarDays,
  HeartPulse,
} from "lucide-react";

import { DoctorWorkspaceShell } from "./DoctorWorkspaceShell";
import { useDoctorWorkspace } from "./useDoctorWorkspace";

export function DoctorOverviewClient() {
  const router = useRouter();
  const workspace = useDoctorWorkspace();

  const stats = [
    {
      title: "Waiting Patients",
      value: workspace.statusCounts.waitingForDoctor,
      icon: Clock3,
      color: "text-amber-600",
      bg: "bg-amber-50",
      description: "Patients awaiting consultation",
    },
    {
      title: "Active Consultations",
      value: workspace.statusCounts.activeConsults,
      icon: Activity,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      description: "Ongoing clinical sessions",
    },
    {
      title: "Pending Labs",
      value: workspace.statusCounts.awaitingLab,
      icon: FlaskConical,
      color: "text-blue-600",
      bg: "bg-blue-50",
      description: "Awaiting diagnostic results",
    },
    {
      title: "Awaiting Triage",
      value: workspace.statusCounts.awaitingTriage,
      icon: ClipboardList,
      color: "text-violet-600",
      bg: "bg-violet-50",
      description: "Patients pending triage",
    },
  ];

  const quickActions = [
    {
      title: "Consultation Queue",
      description: "Open and manage active consultations",
      icon: Stethoscope,
      href: "/dashboard/doctor/queue",
    },
    {
      title: "Laboratory",
      description: "Review diagnostics and lab requests",
      icon: FlaskConical,
      href: "/dashboard/doctor/lab",
    },
    {
      title: "Appointments",
      description: "View scheduled appointments",
      icon: CalendarDays,
      href: "/dashboard/doctor/appointments",
    },
    {
      title: "Patient Records",
      description: "Access patient medical history",
      icon: HeartPulse,
      href: "/dashboard/doctor/patients",
    },
  ];

  return (
    <DoctorWorkspaceShell
      view="overview"
      onRefresh={() => void workspace.loadData()}
      loadingError={workspace.loadingError}
      actionError={workspace.actionError}
      actionMessage={workspace.actionMessage}
    >
      <div className="space-y-6">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[32px] border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-sm sm:p-8">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Doctor Clinical Dashboard
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
                Welcome back, Doctor
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Monitor consultations, laboratory workflows, patient activity,
                and clinical operations from a unified modern workspace designed
                for real-time healthcare management.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/doctor/queue")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Open Consultations
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/dashboard/doctor/lab")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 text-sm font-semibold transition hover:bg-muted"
                >
                  Diagnostic Center
                </button>
              </div>
            </div>

            {/* LIVE STATUS */}
            <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-border bg-background/80 p-5 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Live
                  </span>
                </div>

                <p className="mt-5 text-sm text-muted-foreground">
                  Clinical Activity
                </p>

                <h3 className="mt-1 text-3xl font-black">
                  {workspace.statusCounts.activeConsults}
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Active patient consultations
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-background/80 p-5 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Today
                  </span>
                </div>

                <p className="mt-5 text-sm text-muted-foreground">
                  Patient Volume
                </p>

                <h3 className="mt-1 text-3xl font-black">
                  {workspace.organizationQueue.length}
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Total patients handled
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="group rounded-[28px] border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>

                    <h3 className="mt-3 text-4xl font-black tracking-tight">
                      {stat.value}
                    </h3>

                    <p className="mt-2 text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>

                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg}`}
                  >
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* MAIN DASHBOARD */}
        <section className="grid gap-6 2xl:grid-cols-[1.4fr_0.8fr]">
          {/* QUICK ACTIONS */}
          <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Workspace
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight">
                  Quick Actions
                </h2>
              </div>

              <div className="rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-muted-foreground">
                Clinical Navigation
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.title}
                    type="button"
                    onClick={() => router.push(action.href)}
                    className="group rounded-3xl border border-border bg-background p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-6 w-6 text-primary transition group-hover:text-primary-foreground" />
                      </div>

                      <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                    </div>

                    <h3 className="mt-5 text-lg font-bold">
                      {action.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {action.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DOCTOR ROSTER */}
          <aside className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Organization
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight">
                  Clinical Team
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  {workspace.doctors.length} registered clinicians
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <UserRound className="h-6 w-6 text-primary" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {workspace.doctors.slice(0, 6).map((doctor) => (
                <div
                  key={doctor.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-4 transition hover:shadow-md"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 font-bold text-primary">
                      {doctor.full_name?.charAt(0) || "D"}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {doctor.full_name}
                      </p>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {doctor.specialty || "General Practice"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${
                      doctor.verified
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {doctor.verified ? "Verified" : "Pending"}
                  </span>
                </div>
              ))}

              {!workspace.loading && workspace.doctors.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                  <UserRound className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                  <p className="text-sm font-medium">
                    No clinicians registered
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Registered doctors will appear here.
                  </p>
                </div>
              ) : null}
            </div>
          </aside>
        </section>

        {/* WORKFLOW */}
        <section className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Operations
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                Workflow Overview
              </h2>
            </div>

            <div className="rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-muted-foreground">
              Real-Time Monitoring
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {workspace.workflowLanes.map((lane, index) => (
              <div
                key={lane.title}
                className="relative overflow-hidden rounded-3xl border border-border bg-background p-5"
              >
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Lane {index + 1}
                    </p>

                    <div className="h-3 w-3 rounded-full bg-primary" />
                  </div>

                  <h3 className="mt-4 text-lg font-bold">
                    {lane.title}
                  </h3>

                  <p className="mt-4 text-5xl font-black tracking-tight">
                    {lane.count}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Active workflow items
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DoctorWorkspaceShell>
  );
}