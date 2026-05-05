import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePatient } from "@/contexts/PatientContext";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users, Calendar, Clock, UserPlus, Search, Plus,
  ChevronRight, Phone, ArrowUpRight,
} from "lucide-react";

const mockQueue = [
  { id: "1", name: "Abebe Bikila", mrn: "TEN-001", time: "08:30", status: "waiting" as const, type: "Walk-in", wait: "25 min" },
  { id: "2", name: "Tirunesh Dibaba", mrn: "TEN-002", time: "08:45", status: "active" as const, type: "Appointment", wait: "10 min" },
  { id: "3", name: "Haile Gebrselassie", mrn: "TEN-003", time: "09:00", status: "scheduled" as const, type: "Follow-up", wait: "-" },
  { id: "4", name: "Derartu Tulu", mrn: "TEN-004", time: "09:15", status: "waiting" as const, type: "New Patient", wait: "5 min" },
  { id: "5", name: "Kenenisa Bekele", mrn: "TEN-005", time: "09:30", status: "completed" as const, type: "Lab Review", wait: "-" },
];

const ReceptionDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { setSelectedPatient } = usePatient();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectPatient = (item: typeof mockQueue[0]) => {
    setSelectedPatient({
      id: item.id,
      mrn: item.mrn,
      firstName: item.name.split(" ")[0],
      lastName: item.name.split(" ")[1] || "",
      dateOfBirth: "1990-01-15",
      gender: "M",
      phone: "+251 911 123 456",
      allergies: [],
      bloodType: "O+",
      status: "active",
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{t("role.reception")} {t("nav.dashboard")}</h1>
          <p className="text-sm text-muted-foreground">{t("common.today")}: {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Book Appointment
          </Button>
          <Button size="sm" className="gap-1.5">
            <UserPlus className="h-3.5 w-3.5" /> {t("common.new_patient")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title={t("dashboard.total_patients")} value="1,247" icon={<Users className="h-5 w-5" />} trend={{ value: 12, label: "this month" }} />
        <StatCard title={t("dashboard.today_appointments")} value="34" icon={<Calendar className="h-5 w-5" />} variant="primary" />
        <StatCard title={t("dashboard.in_queue")} value="8" icon={<Clock className="h-5 w-5" />} variant="warning" subtitle="Avg wait: 18 min" />
        <StatCard title="Checked In" value="12" icon={<ArrowUpRight className="h-5 w-5" />} variant="success" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search patient by name, MRN, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Queue */}
        <div className="lg:col-span-2 bg-card rounded-lg border shadow-soft">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {t("common.queue")} ({t("common.today")})
            </h2>
            <Button variant="ghost" size="sm" className="text-xs">View All</Button>
          </div>
          <div className="divide-y">
            {mockQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleSelectPatient(item)}
              >
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                  {item.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <StatusBadge
                      variant={
                        item.status === "waiting" ? "waiting" :
                        item.status === "active" ? "active" :
                        item.status === "scheduled" ? "scheduled" : "completed"
                      }
                      size="sm"
                      dot
                    >
                      {item.status}
                    </StatusBadge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.mrn} • {item.type}</p>
                </div>
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-xs font-medium">{item.time}</p>
                  <p className="text-[10px] text-muted-foreground">Wait: {item.wait}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="bg-card rounded-lg border shadow-soft p-4">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: UserPlus, label: "New Patient", color: "text-primary" },
                { icon: Calendar, label: "Appointment", color: "text-info" },
                { icon: Phone, label: "Teleconsult", color: "text-success" },
                { icon: Plus, label: "Walk-in", color: "text-warning" },
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg border hover:bg-muted/50 transition-colors touch-target"
                >
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg border shadow-soft p-4">
            <h3 className="text-sm font-semibold mb-3">Today's Summary</h3>
            <div className="space-y-2.5">
              {[
                { label: "Registered", value: "5", bg: "bg-primary/10 text-primary" },
                { label: "Waiting", value: "8", bg: "bg-warning/10 text-warning" },
                { label: "In Consultation", value: "3", bg: "bg-info/10 text-info" },
                { label: "Completed", value: "12", bg: "bg-success/10 text-success" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.bg}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionDashboard;
