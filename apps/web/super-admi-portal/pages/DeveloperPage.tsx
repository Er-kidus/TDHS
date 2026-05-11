/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardShell } from "./common";

export default function DeveloperPage(props: any) {
  const { featureFlags } = props;

  return (
    <div className="space-y-4">
      <CardShell title="Developer Tools" description="Read-only diagnostics, API logs, webhooks, and feature debugging">
        <Tabs defaultValue="logs">
          <TabsList className="mb-4 grid h-auto grid-cols-2 gap-2 md:grid-cols-4">
            <TabsTrigger value="logs">API Logs</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="diag">Diagnostics</TabsTrigger>
            <TabsTrigger value="flags">Flag Debugging</TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="space-y-2">
            {["GET /v1/patients 200 42ms", "POST /v1/billing/invoice 201 138ms", "POST /v1/fhir/sync 202 544ms"].map((line) => (
              <div key={line} className="rounded-md border border-border/70 bg-slate-950 p-2 font-mono text-xs text-slate-100">{line}</div>
            ))}
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-2">
            {["appointment.created", "invoice.paid", "organization.updated"].map((hook) => (
              <div key={hook} className="rounded-lg border border-border/70 p-3 text-sm">
                <p className="font-medium">{hook}</p>
                <p className="text-xs text-muted-foreground">https://org.example/hooks/tenadam</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="diag" className="space-y-2">
            {["Node health checks passed", "No migration drift detected", "Cache consistency: OK"].map((line) => (
              <div key={line} className="rounded-lg border border-border/70 p-3 text-sm">{line}</div>
            ))}
          </TabsContent>

          <TabsContent value="flags" className="space-y-2">
            {Object.entries(featureFlags).map(([key, value]) => (
              <div key={key} className="rounded-lg border border-border/70 p-3 text-sm">
                {key}: <span className="font-semibold">{String(value)}</span>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardShell>
    </div>
  );
}