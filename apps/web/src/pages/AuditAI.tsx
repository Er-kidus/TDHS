import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Timeline } from "@/components/shared/Timeline";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Shield, Activity, Brain, AlertTriangle, CheckCircle, Eye, TrendingUp } from "lucide-react";

const auditLog = [
  { id: "1", title: "Patient record viewed", description: "Dr. Abebe viewed TEN-001 records", time: "2 min ago", variant: "info" as const },
  { id: "2", title: "Prescription created", description: "Metformin 500mg for TEN-002", time: "15 min ago", variant: "success" as const },
  { id: "3", title: "Failed login attempt", description: "Unknown IP: 192.168.1.99 (3 attempts)", time: "1 hr ago", variant: "destructive" as const },
  { id: "4", title: "System backup completed", description: "Full database backup successful", time: "3 hr ago", variant: "success" as const },
  { id: "5", title: "User role modified", description: "Admin changed Yonas role to Pharmacist", time: "5 hr ago", variant: "warning" as const },
];

const aiInsights = [
  { type: "risk", title: "High readmission risk", desc: "Patient TEN-003 has 78% readmission probability based on history", severity: "warning" },
  { type: "suggestion", title: "Drug interaction detected", desc: "Warfarin + Aspirin combination flagged for TEN-002", severity: "destructive" },
  { type: "optimization", title: "Scheduling optimization", desc: "Tuesday mornings have 40% lower patient load - suggest redistributing appointments", severity: "info" },
  { type: "trend", title: "Malaria cases trending up", desc: "23% increase in malaria diagnoses this week compared to monthly average", severity: "warning" },
];

const AuditAI: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="p-4 md:p-6 max-w-screen-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">{t("nav.audit")}</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Audit log */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Audit Trail</h2>
            <Button variant="outline" size="sm">Export Log</Button>
          </div>
          <div className="bg-card rounded-lg border shadow-soft p-4">
            <Timeline items={auditLog} />
          </div>
        </div>

        {/* AI insights */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> AI Insights & Alerts</h2>
          <div className="space-y-3">
            {aiInsights.map((insight, i) => (
              <div key={i} className="bg-card rounded-lg border shadow-soft p-4 hover:shadow-medium transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    insight.severity === "destructive" ? "bg-destructive/10" :
                    insight.severity === "warning" ? "bg-warning/10" : "bg-info/10"
                  }`}>
                    {insight.type === "risk" ? <AlertTriangle className={`h-4 w-4 ${insight.severity === "destructive" ? "text-destructive" : "text-warning"}`} /> :
                     insight.type === "suggestion" ? <Brain className="h-4 w-4 text-destructive" /> :
                     insight.type === "trend" ? <TrendingUp className="h-4 w-4 text-warning" /> :
                     <CheckCircle className="h-4 w-4 text-info" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{insight.title}</p>
                      <StatusBadge variant={insight.severity as any} size="sm">{insight.type}</StatusBadge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{insight.desc}</p>
                  </div>
                  <Button size="sm" variant="ghost"><Eye className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditAI;
