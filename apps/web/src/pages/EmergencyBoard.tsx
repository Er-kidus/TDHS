import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Siren, Clock, AlertTriangle, Heart, Activity, UserPlus } from "lucide-react";

const emergencies = [
  { id: "1", patient: "Unknown Male", complaint: "Severe chest pain, diaphoresis", level: "critical", time: "2 min ago", age: "~55", assignedTo: "Dr. Tekle" },
  { id: "2", patient: "Mulu Tadesse", complaint: "High-grade fever, seizure", level: "urgent", time: "15 min ago", age: "8", assignedTo: "Dr. Hailu" },
  { id: "3", patient: "Bekele Worku", complaint: "Deep laceration, right forearm", level: "triage", time: "30 min ago", age: "32", assignedTo: "Nurse Hana" },
  { id: "4", patient: "Almaz Debebe", complaint: "Abdominal pain, vomiting", level: "waiting", time: "45 min ago", age: "28", assignedTo: "Pending" },
];

const levelColors: Record<string, { bg: string; border: string; text: string }> = {
  critical: { bg: "bg-critical/10", border: "border-critical/30", text: "text-critical" },
  urgent: { bg: "bg-destructive/10", border: "border-destructive/30", text: "text-destructive" },
  triage: { bg: "bg-warning/10", border: "border-warning/30", text: "text-warning" },
  waiting: { bg: "bg-muted", border: "border-border", text: "text-muted-foreground" },
};

const EmergencyBoard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="p-4 md:p-6 max-w-screen-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Siren className="h-5 w-5 text-destructive" />
          <h1 className="text-xl font-semibold">{t("nav.emergency")} Board</h1>
        </div>
        <Button size="sm" variant="destructive" className="gap-1.5">
          <UserPlus className="h-3.5 w-3.5" /> New Emergency
        </Button>
      </div>

      {/* Urgency level legend */}
      <div className="flex flex-wrap gap-3">
        {[
          { level: "Critical", color: "bg-critical" },
          { level: "Urgent", color: "bg-destructive" },
          { level: "Triage", color: "bg-warning" },
          { level: "Non-urgent", color: "bg-muted-foreground" },
        ].map((l) => (
          <div key={l.level} className="flex items-center gap-1.5 text-xs">
            <span className={`h-2.5 w-2.5 rounded-full ${l.color}`} />
            {l.level}
          </div>
        ))}
      </div>

      {/* Emergency cards */}
      <div className="space-y-3">
        {emergencies.map((em) => {
          const colors = levelColors[em.level];
          return (
            <div
              key={em.id}
              className={`rounded-lg border-2 ${colors.bg} ${colors.border} p-4 shadow-soft cursor-pointer hover:shadow-medium transition-shadow`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${colors.bg} border ${colors.border}`}>
                    {em.level === "critical" ? (
                      <Heart className={`h-5 w-5 ${colors.text} animate-pulse`} />
                    ) : (
                      <Activity className={`h-5 w-5 ${colors.text}`} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{em.patient}</p>
                      <StatusBadge variant={em.level as any} size="md" dot>{em.level}</StatusBadge>
                    </div>
                    <p className="text-sm mt-0.5">{em.complaint}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Age: {em.age}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {em.time}</span>
                      <span>→ {em.assignedTo}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-col">
                  <Button size="sm" variant="outline" className="touch-target">Assess</Button>
                  <Button size="sm" className="touch-target">Treat</Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmergencyBoard;
