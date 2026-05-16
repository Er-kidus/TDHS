"use client";

import { useRouter } from "next/navigation";
import {
  Activity,
  Users,
  FlaskConical,
  ClipboardList,
  ArrowRight,
  UserRound,
  Stethoscope,
  Clock3,
  ShieldCheck,
  CalendarDays,
  HeartPulse,
} from "lucide-react";

import { DoctorWorkspaceShell } from "./DoctorWorkspaceShell";
import { useDoctorWorkspace } from "./useDoctorWorkspace";
import { ClinicalKnowledgeBaseAi } from "@/components/ai/ClinicalKnowledgeBaseAi";

export function DoctorOverviewClient() {
  const router = useRouter();
  const workspace = useDoctorWorkspace();

  const stats = [
    {
      title: "Waiting",
      value: workspace.statusCounts.waitingForDoctor,
      icon: Clock3,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Active",
      value: workspace.statusCounts.activeConsults,
      icon: Activity,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Labs",
      value: workspace.statusCounts.awaitingLab,
      icon: FlaskConical,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Triage",
      value: workspace.statusCounts.awaitingTriage,
      icon: ClipboardList,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  const quickActions = [
    {
      title: "Consultations",
      description: "Manage active consultations",
      icon: Stethoscope,
      href: "/dashboard/doctor/queue",
    },
    {
      title: "Laboratory",
      description: "Review lab diagnostics",
      icon: FlaskConical,
      href: "/dashboard/doctor/lab",
    },
    {
      title: "Appointments",
      description: "Today's schedules",
      icon: CalendarDays,
      href: "/dashboard/doctor/appointments",
    },
    {
      title: "Patients",
      description: "Patient medical records",
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
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* MAIN CONTENT */}
        <main className="space-y-6">
          {/* HERO */}
          <section className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="flex flex-col gap-8 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Doctor Workspace
                </div>

                <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Welcome back, Doctor
                </h1>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Monitor consultations, patient flow, laboratory requests,
                  and daily clinical operations from one workspace.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      router.push("/dashboard/doctor/queue")
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                  >
                    Open Queue
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/doctor/lab")}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-background px-5 text-sm font-medium transition hover:bg-muted"
                  >
                    View Labs
                  </button>
                </div>
              </div>

              {/* MINI STATUS */}
              <div className="grid w-full max-w-sm gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                      <Activity className="h-5 w-5 text-emerald-600" />
                    </div>

                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      Live
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-muted-foreground">
                    Active Consults
                  </p>

                  <h3 className="mt-1 text-3xl font-bold">
                    {workspace.statusCounts.activeConsults}
                  </h3>
                </div>

                <div className="rounded-2xl border border-border bg-background p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>

                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                      Today
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-muted-foreground">
                    Patient Volume
                  </p>

                  <h3 className="mt-1 text-3xl font-bold">
                    {workspace.organizationQueue.length}
                  </h3>
                </div>
              </div>
            </div>
          </section>

          {/* STATS */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-border bg-card p-5 transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>

                      <h3 className="mt-3 text-3xl font-bold">
                        {stat.value}
                      </h3>
                    </div>

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}
                    >
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

         
        </main>

        {/* SIDEBAR */}
        <aside className="space-y-6">
          {/* TEAM */}
          <section className="rounded-3xl border border-border bg-card p-6">
           <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Quick Navigation
                </p>

                <h2 className="mt-1 text-2xl font-semibold">
                  Quick Actions
                </h2>
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
                    className="group rounded-2xl border border-border bg-background p-5 text-left transition hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1" />
                    </div>

                    <h3 className="mt-5 text-lg font-semibold">
                      {action.title}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <ClinicalKnowledgeBaseAi />
         
        </aside>
      </div>
    </DoctorWorkspaceShell>
  );
}