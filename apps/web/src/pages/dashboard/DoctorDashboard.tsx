import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePatient } from "@/contexts/PatientContext";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Timeline } from "@/components/shared/Timeline";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Stethoscope, Users, ClipboardList, AlertTriangle,
  Pill, FlaskConical, ArrowRight, FileText, Activity,
  ChevronRight,
} from "lucide-react";

const mockPatients = [
  { id: "1", name: "Abebe Bikila", mrn: "TEN-001", complaint: "Chest pain", priority: "urgent" as const, time: "08:30" },
  { id: "2", name: "Tirunesh Dibaba", mrn: "TEN-002", complaint: "Follow-up - Diabetes", priority: "scheduled" as const, time: "09:00" },
  { id: "3", name: "Haile G.", mrn: "TEN-003", complaint: "Hypertension review", priority: "active" as const, time: "09:15" },
  { id: "4", name: "Derartu Tulu", mrn: "TEN-004", complaint: "Respiratory infection", priority: "waiting" as const, time: "09:30" },
];

const recentActivity = [
  { id: "1", title: "Lab results received", description: "CBC for Abebe Bikila - Normal", time: "10 min ago", variant: "success" as const },
  { id: "2", title: "New consultation request", description: "ER referral - chest pain", time: "25 min ago", variant: "warning" as const },
  { id: "3", title: "Prescription filled", description: "Metformin 500mg - Tirunesh", time: "1 hr ago", variant: "info" as const },
  { id: "4", title: "Drug interaction alert", description: "Warfarin + Aspirin conflict", time: "2 hr ago", variant: "destructive" as const },
];

const DoctorDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { setSelectedPatient } = usePatient();
  const [gigMode, setGigMode] = useState(false);

  const selectPatient = (p: typeof mockPatients[0]) => {
    setSelectedPatient({
      id: p.id, mrn: p.mrn,
      firstName: p.name.split(" ")[0], lastName: p.name.split(" ").slice(1).join(" "),
      dateOfBirth: "1985-03-20", gender: "M", phone: "+251 911 000 000",
      allergies: p.priority === "urgent" ? ["Penicillin"] : [],
      bloodType: "A+", status: p.priority === "urgent" ? "emergency" : "active",
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{t("role.doctor")} {t("nav.dashboard")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.welcome")}, Dr. Abebe</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ClipboardList className="h-3.5 w-3.5" /> My Schedule
          </Button>
          <Button size="sm" className="gap-1.5">
            <Stethoscope className="h-3.5 w-3.5" /> Start Consultation
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-3 shadow-soft flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Telemedicine Gig Mode</p>
          <p className="text-xs text-muted-foreground">Enable on-demand telemedicine shifts while keeping regular org schedule.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{gigMode ? "ON" : "OFF"}</span>
          <Switch checked={gigMode} onCheckedChange={setGigMode} aria-label="Toggle telemedicine gig mode" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="My Patients Today" value="12" icon={<Users className="h-5 w-5" />} variant="primary" />
        <StatCard title="Active Consultations" value="3" icon={<Stethoscope className="h-5 w-5" />} variant="success" />
        <StatCard title="Pending Lab Results" value="5" icon={<FlaskConical className="h-5 w-5" />} variant="warning" />
        <StatCard title="Alerts" value="2" icon={<AlertTriangle className="h-5 w-5" />} variant="destructive" />
      </div>

      {gigMode ? (
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm">You are visible in the telemedicine gig queue for urgent virtual consultations.</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Set Gig Availability</Button>
            <Button size="sm">Join Live Queue</Button>
          </div>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Patient list */}
        <div className="lg:col-span-2 bg-card rounded-lg border shadow-soft">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Patient Queue
            </h2>
          </div>
          <div className="divide-y">
            {mockPatients.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => selectPatient(p)}
              >
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                  {p.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <StatusBadge variant={p.priority} size="sm" dot>{p.priority}</StatusBadge>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.mrn} • {p.complaint}</p>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block">{p.time}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="bg-card rounded-lg border shadow-soft p-4">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-1.5">
              {[
                { icon: Pill, label: "Prescribe Medication", color: "text-primary" },
                { icon: FlaskConical, label: "Request Lab Test", color: "text-info" },
                { icon: ArrowRight, label: "Refer Patient", color: "text-warning" },
                { icon: FileText, label: "Write Notes", color: "text-success" },
              ].map((a) => (
                <button key={a.label} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left touch-target">
                  <a.icon className={`h-4 w-4 ${a.color}`} />
                  <span className="text-sm">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="bg-card rounded-lg border shadow-soft p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Recent Activity
            </h3>
            <Timeline items={recentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
