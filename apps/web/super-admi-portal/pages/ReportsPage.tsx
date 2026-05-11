/* eslint-disable @typescript-eslint/no-explicit-any */
import { Activity, CreditCard, FlaskConical, Users } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CardShell, MetricCard } from "./common";

export default function ReportsPage(props: any) {
  const { users, teleArtifacts, aiModels, alerts } = props;

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Users" value={users.length.toString()} subtitle="loaded from gateway" icon={<Users className="h-5 w-5" />} trend="live" />
        <MetricCard title="Artifacts" value={teleArtifacts.length.toString()} subtitle="telemedicine records" icon={<Activity className="h-5 w-5" />} trend="persisted" />
        <MetricCard title="Models" value={aiModels.length.toString()} subtitle="AI model registry" icon={<FlaskConical className="h-5 w-5" />} trend="live" />
        <MetricCard title="Alerts" value={alerts.length.toString()} subtitle="current signal count" icon={<CreditCard className="h-5 w-5" />} trend="live" />
      </section>

      <CardShell title="Appointment Trends" description="Weekly appointment flow across organizations">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                { week: "W1", inPerson: 8200, telemed: 1900 },
                { week: "W2", inPerson: 8700, telemed: 2100 },
                { week: "W3", inPerson: 9100, telemed: 2300 },
                { week: "W4", inPerson: 9800, telemed: 2500 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="inPerson" stroke="hsl(var(--primary))" strokeWidth={2.5} />
              <Line dataKey="telemed" stroke="#0ea5e9" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardShell>
    </div>
  );
}