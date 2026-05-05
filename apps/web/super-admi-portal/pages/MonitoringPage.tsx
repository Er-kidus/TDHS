/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { CardShell } from "./common";

export default function MonitoringPage(props: any) {
  const { alerts, severityBadge } = props;

  return (
    <div className="space-y-4">
      <CardShell title="Service Uptime" description="Real-time platform health and service status">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { name: "API Gateway", up: "99.99%", ok: true },
            { name: "Auth Service", up: "99.98%", ok: true },
            { name: "Billing Service", up: "98.87%", ok: false },
            { name: "FHIR Connector", up: "99.92%", ok: true },
          ].map((service) => (
            <div key={service.name} className="rounded-lg border border-border/70 p-3">
              <p className="text-sm font-medium">{service.name}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Uptime: {service.up}</span>
                {service.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
              </div>
            </div>
          ))}
        </div>
      </CardShell>

      <CardShell title="Alert Stream" description="Live error and warning feed">
        <div className="space-y-2">
          {alerts.map((alert: any) => (
            <div key={alert.id} className="rounded-lg border border-border/70 p-3">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-sm font-medium">{alert.title}</p>
                {severityBadge(alert.severity)}
              </div>
              <p className="text-xs text-muted-foreground">{alert.details}</p>
            </div>
          ))}
        </div>
      </CardShell>
    </div>
  );
}