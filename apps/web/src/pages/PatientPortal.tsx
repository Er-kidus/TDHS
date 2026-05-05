import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { getPatientMe, listAppointments } from "@/lib/gateway";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Calendar, FileText, MessageSquare, CreditCard,
  Bell, Clock, ChevronRight, User,
} from "lucide-react";

function statusVariant(status: string): "success" | "waiting" | "info" | "warning" | "destructive" {
  const s = status.toLowerCase();
  if (s === "confirmed" || s === "completed") return "success";
  if (s === "booked" || s === "scheduled") return "info";
  if (s === "pending") return "waiting";
  if (s === "cancelled" || s === "canceled") return "destructive";
  return "warning";
}

const PatientPortal: React.FC = () => {
  const { t } = useLanguage();
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<"appointments" | "records" | "messages" | "billing">("appointments");

  const meQuery = useQuery({
    queryKey: ["patient", "me", token],
    enabled: !!token && user?.role === "patient",
    queryFn: () => getPatientMe(token as string),
  });

  const apptQuery = useQuery({
    queryKey: ["appointments", token],
    enabled: !!token,
    queryFn: () => listAppointments(token as string, 50),
  });

  const appointments = useMemo(() => apptQuery.data ?? [], [apptQuery.data]);

  const tabs = [
    { key: "appointments" as const, label: "Appointments", icon: Calendar },
    { key: "records" as const, label: "Medical Records", icon: FileText },
    { key: "messages" as const, label: "Messages", icon: MessageSquare },
    { key: "billing" as const, label: "Billing", icon: CreditCard },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{t("nav.portal")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.welcome")}, {meQuery.data?.full_name ?? user?.name ?? ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Bell className="h-3.5 w-3.5" /> Notifications
            <span className="h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">3</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors touch-target ${
              activeTab === tab.key ? "bg-card shadow-soft text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "appointments" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold">Upcoming Appointments</h2>
            <Button size="sm" className="gap-1.5" onClick={() => apptQuery.refetch()}>
              <Calendar className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>
          {apptQuery.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading appointments…</div>
          ) : apptQuery.isError ? (
            <div className="text-sm text-destructive">Failed to load appointments.</div>
          ) : appointments.length === 0 ? (
            <div className="bg-card rounded-lg border shadow-soft p-6 text-sm text-muted-foreground">
              No appointments yet.
            </div>
          ) : (
            appointments.map((apt) => {
              const when = new Date(apt.scheduled_at);
              const dateLabel = when.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
              const timeLabel = when.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
              return (
                <div key={apt.id} className="bg-card rounded-lg border shadow-soft p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{apt.reason ?? "Appointment"}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" /> {dateLabel} at {timeLabel}
                      </p>
                      {apt.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{apt.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge variant={statusVariant(apt.status)} dot>
                      {apt.status}
                    </StatusBadge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "records" && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Medical Records</h2>
          <div className="bg-card rounded-lg border shadow-soft p-6 text-sm text-muted-foreground">
            Medical records aren’t wired to the gateway yet.
          </div>
        </div>
      )}

      {activeTab === "messages" && (
        <div className="bg-card rounded-lg border shadow-soft p-4 space-y-4">
          <h2 className="text-sm font-semibold">Messages</h2>
          <div className="text-sm text-muted-foreground">Messaging isn’t wired to the gateway yet.</div>
        </div>
      )}

      {activeTab === "billing" && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Billing & Payments</h2>
          {[
            { id: "INV-001", desc: "Consultation - Dr. Tekle", amount: "ETB 500", status: "paid", date: "Mar 28" },
            { id: "INV-002", desc: "Lab - Complete Blood Count", amount: "ETB 350", status: "pending", date: "Mar 28" },
            { id: "INV-003", desc: "Pharmacy - Metformin", amount: "ETB 200", status: "pending", date: "Mar 25" },
          ].map((inv) => (
            <div key={inv.id} className="bg-card rounded-lg border shadow-soft p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{inv.desc}</p>
                <p className="text-xs text-muted-foreground">{inv.id} • {inv.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold">{inv.amount}</p>
                <StatusBadge variant={inv.status === "paid" ? "success" : "warning"} dot>{inv.status}</StatusBadge>
                {inv.status === "pending" && <Button size="sm">Pay</Button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientPortal;
