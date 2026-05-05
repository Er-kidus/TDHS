import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatCard } from "@/components/shared/StatCard";
import { Timeline } from "@/components/shared/Timeline";
import { Button } from "@/components/ui/button";
import { Shield, Users, Activity, Settings, Server, Database, BarChart3 } from "lucide-react";

const systemMetrics = [
  { label: "CPU Usage", value: "23%", color: "bg-success" },
  { label: "Memory", value: "61%", color: "bg-warning" },
  { label: "Storage", value: "45%", color: "bg-info" },
  { label: "Uptime", value: "99.9%", color: "bg-success" },
];

const auditItems = [
  { id: "1", title: "User login", description: "Sara Kebede logged in from 192.168.1.45", time: "2 min ago", variant: "info" as const },
  { id: "2", title: "Patient record accessed", description: "Dr. Abebe accessed TEN-001", time: "15 min ago", variant: "default" as const },
  { id: "3", title: "Role changed", description: "Admin promoted Yonas to Pharmacist", time: "1 hr ago", variant: "warning" as const },
  { id: "4", title: "Failed login attempt", description: "3 failed attempts from unknown IP", time: "3 hr ago", variant: "destructive" as const },
];

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{t("role.admin")} {t("nav.dashboard")}</h1>
          <p className="text-sm text-muted-foreground">System overview & management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5"><Users className="h-3.5 w-3.5" /> User Management</Button>
          <Button size="sm" className="gap-1.5"><Settings className="h-3.5 w-3.5" /> Configuration</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Users" value="156" icon={<Users className="h-5 w-5" />} trend={{ value: 8, label: "this month" }} />
        <StatCard title="Active Sessions" value="34" icon={<Activity className="h-5 w-5" />} variant="primary" />
        <StatCard title="Security Alerts" value="2" icon={<Shield className="h-5 w-5" />} variant="destructive" />
        <StatCard title="System Health" value="99.9%" icon={<Server className="h-5 w-5" />} variant="success" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* System metrics */}
          <div className="bg-card rounded-lg border shadow-soft p-4">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> System Resources
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {systemMetrics.map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-semibold">{m.value}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${m.color}`} style={{ width: m.value }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User management table */}
          <div className="bg-card rounded-lg border shadow-soft">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-sm font-semibold">User Management</h3>
              <Button size="sm" variant="outline">Add User</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Role</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { name: "Dr. Abebe Tekle", role: "Doctor", status: "Online", lastActive: "Now" },
                    { name: "Sara Kebede", role: "Reception", status: "Online", lastActive: "Now" },
                    { name: "Hana Girma", role: "Nurse", status: "Offline", lastActive: "2 hrs ago" },
                    { name: "Yonas Alemu", role: "Pharmacist", status: "Online", lastActive: "Now" },
                  ].map((u, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.role}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs ${u.status === "Online" ? "text-success" : "text-muted-foreground"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${u.status === "Online" ? "bg-success" : "bg-muted-foreground"}`} />
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{u.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Audit trail */}
        <div className="bg-card rounded-lg border shadow-soft p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Audit Log
          </h3>
          <Timeline items={auditItems} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
