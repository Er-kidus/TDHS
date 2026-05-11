import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Pill, AlertTriangle, Package, Clock, ChevronRight, CheckCircle } from "lucide-react";

const prescriptions = [
  { id: "1", patient: "Abebe Bikila", doctor: "Dr. Tekle", drug: "Amoxicillin 500mg", qty: "21 caps", status: "pending", alert: false },
  { id: "2", patient: "Tirunesh Dibaba", drug: "Metformin 500mg + Warfarin 5mg", doctor: "Dr. Alemu", qty: "60 tabs", status: "pending", alert: true },
  { id: "3", patient: "Haile G.", drug: "Lisinopril 10mg", doctor: "Dr. Tekle", qty: "30 tabs", status: "dispensed", alert: false },
  { id: "4", patient: "Derartu Tulu", drug: "Azithromycin 250mg", doctor: "Dr. Girma", qty: "6 tabs", status: "pending", alert: false },
];

const PharmacistDashboard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-2xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold">{t("role.pharmacist")} {t("nav.dashboard")}</h1>
        <p className="text-sm text-muted-foreground">Prescription queue & inventory</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Pending" value="8" icon={<Clock className="h-5 w-5" />} variant="warning" />
        <StatCard title="Dispensed Today" value="24" icon={<CheckCircle className="h-5 w-5" />} variant="success" />
        <StatCard title="Drug Alerts" value="1" icon={<AlertTriangle className="h-5 w-5" />} variant="destructive" />
        <StatCard title="Low Stock Items" value="3" icon={<Package className="h-5 w-5" />} variant="warning" />
      </div>

      <div className="bg-card rounded-lg border shadow-soft">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Pill className="h-4 w-4 text-primary" /> Prescription Queue
          </h2>
        </div>
        <div className="divide-y">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
              {rx.alert && (
                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{rx.patient}</p>
                  <StatusBadge variant={rx.status === "pending" ? "waiting" : "completed"} size="sm" dot>
                    {rx.status}
                  </StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground">{rx.drug} • {rx.qty}</p>
                <p className="text-[10px] text-muted-foreground">Prescribed by {rx.doctor}</p>
                {rx.alert && (
                  <p className="text-xs text-destructive mt-1 font-medium">⚠ Drug interaction detected</p>
                )}
              </div>
              <Button size="sm" variant={rx.status === "pending" ? "default" : "outline"} className="touch-target">
                {rx.status === "pending" ? "Dispense" : "Details"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboard;
