import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Building2, Bed, Users, AlertTriangle } from "lucide-react";

const wards = [
  { name: "Medical Ward A", beds: 20, occupied: 16, available: 4 },
  { name: "Surgical Ward B", beds: 15, occupied: 12, available: 3 },
  { name: "Pediatric Ward", beds: 10, occupied: 7, available: 3 },
  { name: "ICU", beds: 6, occupied: 5, available: 1 },
  { name: "Maternity", beds: 12, occupied: 9, available: 3 },
];

const admittedPatients = [
  { id: "1", name: "Haile G.", ward: "Medical A", bed: "A-05", status: "stable", days: 3 },
  { id: "2", name: "Mulu Tadesse", ward: "ICU", bed: "ICU-02", status: "critical", days: 1 },
  { id: "3", name: "Almaz Debebe", ward: "Surgical B", bed: "B-08", status: "recovering", days: 5 },
  { id: "4", name: "Selam Worku", ward: "Maternity", bed: "M-03", status: "stable", days: 2 },
];

const WardBoard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="p-4 md:p-6 max-w-screen-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">{t("nav.ward")} Management</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Beds" value="63" icon={<Bed className="h-5 w-5" />} />
        <StatCard title="Occupied" value="49" icon={<Users className="h-5 w-5" />} variant="primary" subtitle="78% occupancy" />
        <StatCard title="Available" value="14" icon={<Building2 className="h-5 w-5" />} variant="success" />
        <StatCard title="Critical" value="2" icon={<AlertTriangle className="h-5 w-5" />} variant="destructive" />
      </div>

      {/* Ward overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {wards.map((ward) => (
          <div key={ward.name} className="bg-card rounded-lg border shadow-soft p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">{ward.name}</h3>
              <span className="text-xs text-muted-foreground">{ward.beds} beds</span>
            </div>
            <div className="flex gap-1 mb-2">
              {Array.from({ length: ward.beds }).map((_, i) => (
                <div
                  key={i}
                  className={`h-3 flex-1 rounded-sm ${i < ward.occupied ? (ward.name === "ICU" && i >= ward.occupied - 1 ? "bg-destructive" : "bg-primary/60") : "bg-muted"}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Occupied: {ward.occupied}</span>
              <span className="text-success font-medium">Available: {ward.available}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Admitted patients */}
      <div className="bg-card rounded-lg border shadow-soft">
        <div className="px-4 py-3 border-b"><h2 className="text-sm font-semibold">Admitted Patients</h2></div>
        <div className="divide-y">
          {admittedPatients.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                  {p.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.ward} • Bed {p.bed} • Day {p.days}</p>
                </div>
              </div>
              <StatusBadge
                variant={p.status === "critical" ? "critical" : p.status === "stable" ? "success" : "info"}
                dot
              >
                {p.status}
              </StatusBadge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WardBoard;
