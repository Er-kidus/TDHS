/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BellRing,
  CheckCircle2,
  Database,
  Globe,
  ShieldAlert,
  Users,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardShell, MetricCard } from "./common";

const PIE_COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

type DashboardProps = {
  users: any[];
  userRoleCounts: Record<string, number>;
  orgRole: string;
  teleArtifacts: any[];
  aiModels: any[];
  systemOverview: any;
  userGrowth: Array<{ month: string; users: number; orgs: number }>;
  systemActivity: Array<{ label: string; requests: number; failures: number }>;
  recentEvents: Array<{ id: string; title: string; detail: string; time: string }>;
  alerts: any[];
  severityBadge: (severity: "critical" | "warning" | "info") => React.ReactNode;
  orgApplications: any[];
  availableStaffTemplates: any[];
  pushSystemAction?: (message: string) => void;
};

export default function DashboardPage(props: DashboardProps) {
  const {
    users,
    userRoleCounts,
    orgRole,
    teleArtifacts,
    aiModels,
    systemOverview,
    userGrowth,
    systemActivity,
    recentEvents,
    alerts,
    severityBadge,
    orgApplications,
    availableStaffTemplates,
    pushSystemAction = () => undefined,
  } = props;

  const [runtimeNow, setRuntimeNow] = useState(() => new Date());
  const [streamedEvents, setStreamedEvents] = useState<Array<{ id: string; title: string; detail: string; time: string }>>([]);

  useEffect(() => {
    const ticker = window.setInterval(() => {
      setRuntimeNow(new Date());
    }, 5000);
    return () => window.clearInterval(ticker);
  }, []);

  useEffect(() => {
    const latest = recentEvents.slice(0, 5);
    setStreamedEvents(latest);
  }, [recentEvents]);

  const activeUsers = users.filter((row: any) => row.status === "Active").length;
  const lockedUsers = users.filter((row: any) => row.status === "Locked").length;
  const followUps = teleArtifacts.filter((row: any) => row.follow_up_needed).length;
  const activeModels = aiModels.filter((row: any) => String(row.status).toLowerCase() === "active").length;
  const totalUsersMetric = systemOverview?.total_users ?? users.length;
  const activeUsersMetric = systemOverview?.active_sessions ?? activeUsers;
  const pendingApplications = orgApplications.filter((row: any) => row.status === "pending").length;
  const approvedApplications = orgApplications.filter((row: any) => row.status === "approved").length;
  const verifiedApplications = orgApplications.filter((row: any) => row.status === "verified").length;

  const rolePieData = useMemo(() => {
    return Object.entries(userRoleCounts).map(([name, value]) => ({ name, value }));
  }, [userRoleCounts]);

  const healthPieData = useMemo(() => {
    return [
      { name: "Healthy", value: Math.max(0, systemActivity.reduce((sum, row) => sum + row.requests - row.failures, 0)) },
      { name: "Failures", value: systemActivity.reduce((sum, row) => sum + row.failures, 0) },
      { name: "Pending Follow-ups", value: followUps },
      { name: "Model Warnings", value: Math.max(aiModels.length - activeModels, 0) },
    ];
  }, [activeModels, aiModels.length, followUps, systemActivity]);

  const systemStatusRows = useMemo(() => {
    return [
      { label: "Gateway", status: "Operational", color: "bg-emerald-500" },
      { label: "Telemedicine Pipeline", status: followUps > 3 ? "Attention" : "Healthy", color: followUps > 3 ? "bg-amber-500" : "bg-emerald-500" },
      { label: "AI Models", status: activeModels === aiModels.length ? "Healthy" : "Degraded", color: activeModels === aiModels.length ? "bg-emerald-500" : "bg-red-500" },
      { label: "Org Workflow", status: pendingApplications > 0 ? "Queued" : "Clear", color: pendingApplications > 0 ? "bg-sky-500" : "bg-emerald-500" },
    ];
  }, [activeModels, aiModels.length, followUps, pendingApplications]);

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={totalUsersMetric.toString()}
          subtitle={`Super Admin ${userRoleCounts["Super Admin"] || 0} • Org Admin ${userRoleCounts["Org Admin"] || 0}`}
          icon={<Users className="h-5 w-5" />}
          trend="Live from gateway"
        />
        <MetricCard
          title="Active Staff"
          value={activeUsersMetric.toString()}
          subtitle={`${lockedUsers} locked accounts`}
          icon={<Globe className="h-5 w-5" />}
          trend={orgRole}
        />
        <MetricCard
          title="Telemedicine Artifacts"
          value={teleArtifacts.length.toString()}
          subtitle={`${followUps} need follow-up review`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          trend="Persisted"
        />
        <MetricCard
          title="AI Models"
          value={aiModels.length.toString()}
          subtitle={`${activeModels} active models`}
          icon={<Database className="h-5 w-5" />}
          trend="Gateway-backed"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Queued Applications"
          value={orgApplications.length.toString()}
          subtitle={`${pendingApplications} pending review`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          trend="Live"
        />
        <MetricCard
          title="Approved"
          value={approvedApplications.toString()}
          subtitle="Awaiting service configuration"
          icon={<Globe className="h-5 w-5" />}
          trend="Gateway-backed"
        />
        <MetricCard
          title="Verified"
          value={verifiedApplications.toString()}
          subtitle="Organizations with configured services"
          icon={<Database className="h-5 w-5" />}
          trend="Persisted"
        />
        <MetricCard
          title="Templates"
          value={availableStaffTemplates.length.toString()}
          subtitle="Persisted role templates"
          icon={<Users className="h-5 w-5" />}
          trend="Database"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <CardShell title="User Growth" description="Monthly growth by users and organizations" className="xl:col-span-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2.5} />
                <Line type="monotone" dataKey="orgs" stroke="#22c55e" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardShell>

        <CardShell title="Quick Actions" description="Operational shortcuts for super admins">
          <div className="space-y-2">
            <Button className="w-full justify-start" variant="outline" onClick={() => pushSystemAction("Triggered system health check")}> 
              <Activity className="mr-2 h-4 w-4" /> Run Health Check
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => pushSystemAction("Triggered alert sweep refresh")}>
              <BellRing className="mr-2 h-4 w-4" /> Refresh Alert Stream
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => pushSystemAction("Triggered security rule sync")}> 
              <ShieldAlert className="mr-2 h-4 w-4" /> Sync Security Rules
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => pushSystemAction("Triggered cache warmup")}> 
              <Zap className="mr-2 h-4 w-4" /> Warmup Critical Cache
            </Button>
          </div>
          <div className="mt-4 rounded-xl border border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
            Realtime clock: {runtimeNow.toLocaleString()}
          </div>
        </CardShell>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <CardShell title="System Activity" description="Request and failure trends by module">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={systemActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Legend />
                <Bar dataKey="requests" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="failures" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardShell>

        <CardShell title="Role Distribution" description="Pie visual of current account mix">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rolePieData} dataKey="value" nameKey="name" outerRadius={96} innerRadius={46}>
                  {rolePieData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardShell>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <CardShell title="System Health Breakdown" description="Realtime health and alert composition">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={healthPieData} dataKey="value" nameKey="name" outerRadius={88}>
                  {healthPieData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardShell>

        <CardShell title="System Updates & Alerts" description="Streaming updates for platform activity" className="xl:col-span-2">
          <div className="space-y-3">
            {streamedEvents.map((event) => (
              <div key={event.id} className="rounded-xl border border-border/70 bg-card/60 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{event.time}</span>
                </div>
              </div>
            ))}
            {alerts.slice(0, 4).map((alert: any) => (
              <div key={alert.id} className="rounded-xl border border-border/70 p-3">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  {severityBadge(alert.severity)}
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.details}</p>
              </div>
            ))}
          </div>
        </CardShell>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <CardShell title="System Status" description="Lower-section service health overview">
          <div className="space-y-2">
            {systemStatusRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-lg border border-border/70 p-2.5">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${row.color}`} />
                  <span className="text-sm font-medium">{row.label}</span>
                </div>
                <Badge variant="secondary">{row.status}</Badge>
              </div>
            ))}
          </div>
        </CardShell>

        <CardShell title="Alert Logs" description="Recent critical and warning logs">
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active alerts.</p>
            ) : (
              alerts.map((alert: any) => (
                <div key={alert.id} className="rounded-lg border border-border/70 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{alert.title}</p>
                    {severityBadge(alert.severity)}
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.details}</p>
                </div>
              ))
            )}
          </div>
        </CardShell>
      </section>
    </div>
  );
}
