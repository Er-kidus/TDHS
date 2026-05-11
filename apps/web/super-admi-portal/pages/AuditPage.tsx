/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardShell } from "./common";

export default function AuditPage(props: any) {
  const { toast, systemChangeLogs, recentEvents } = props;

  return (
    <CardShell title="Audit Logs" description="Full activity tracking with filters and export capability">
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Input placeholder="Filter by user" />
        <Input placeholder="Filter by action" />
        <Input type="date" />
        <Button variant="outline" onClick={() => toast({ title: "Export started", description: "Audit log export is being prepared." })}>
          Export Logs
        </Button>
      </div>
      <div className="space-y-2">
        {[...systemChangeLogs, ...recentEvents.map((event: any) => `${event.title}: ${event.detail}`)].slice(0, 12).map((log, index) => (
          <div key={`${log}-${index}`} className="rounded-lg border border-border/70 bg-card/50 p-3 text-sm">{log}</div>
        ))}
      </div>
    </CardShell>
  );
}