import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Activity, Users, AlertTriangle, ThermometerSun, Heart, ChevronRight } from "lucide-react";

const triageQueue = [
  { id: "1", name: "Mulu Tadesse", complaint: "High fever, vomiting", priority: "urgent", vitals: "T: 39.5°C, HR: 110" },
  { id: "2", name: "Bekele Worku", complaint: "Laceration on arm", priority: "triage", vitals: "T: 37°C, HR: 78" },
  { id: "3", name: "Almaz Debebe", complaint: "Abdominal pain", priority: "waiting", vitals: "Pending" },
  { id: "4", name: "Dawit Hailu", complaint: "Difficulty breathing", priority: "critical", vitals: "T: 38.2°C, SpO2: 91%" },
  { id: "5", name: "Selamawit Girma", complaint: "Headache, dizziness", priority: "waiting", vitals: "Pending" },
];

const NurseDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [gigMode, setGigMode] = useState(false);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{t("role.nurse")} / Triage {t("nav.dashboard")}</h1>
          <p className="text-sm text-muted-foreground">Triage & vitals management</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Activity className="h-3.5 w-3.5" /> Record Vitals
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-3 shadow-soft flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Telemedicine Gig Mode</p>
          <p className="text-xs text-muted-foreground">Allow nurse and midwife tele-triage support outside fixed department schedule.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{gigMode ? "ON" : "OFF"}</span>
          <Switch checked={gigMode} onCheckedChange={setGigMode} aria-label="Toggle telemedicine gig mode" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="In Triage" value="5" icon={<Users className="h-5 w-5" />} variant="warning" />
        <StatCard title="Vitals Pending" value="3" icon={<ThermometerSun className="h-5 w-5" />} variant="primary" />
        <StatCard title="Critical" value="1" icon={<AlertTriangle className="h-5 w-5" />} variant="destructive" />
        <StatCard title="Completed" value="18" icon={<Heart className="h-5 w-5" />} variant="success" />
      </div>

      {gigMode ? (
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm">Gig mode active: tele-triage queue and virtual intake requests will be routed to your panel.</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Set Shift Window</Button>
            <Button size="sm">Open Tele-Triage Queue</Button>
          </div>
        </div>
      ) : null}

      {/* Triage queue - large touch-friendly cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Triage Queue</h2>
        {triageQueue.map((p) => (
          <div key={p.id} className="bg-card rounded-lg border shadow-soft p-4 hover:shadow-medium transition-shadow cursor-pointer">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0 touch-target">
                  {p.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{p.name}</p>
                    <StatusBadge
                      variant={p.priority as any}
                      size="md"
                      dot
                    >
                      {p.priority}
                    </StatusBadge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{p.complaint}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{p.vitals}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" className="touch-target">Vitals</Button>
                <Button size="sm" className="touch-target">Triage</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NurseDashboard;
