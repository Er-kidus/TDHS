import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardShell } from "./common";

export default function IntegrationsPage() {
  return (
    <CardShell title="Integrations" description="Manage third-party systems and service providers">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[
          { name: "Chapa Payments", type: "Payment", status: "Connected" },
          { name: "SendGrid", type: "Email", status: "Connected" },
          { name: "Twilio", type: "SMS", status: "Disconnected" },
          { name: "FHIR National Exchange", type: "FHIR", status: "Connected" },
          { name: "Google Workspace SMTP", type: "Email", status: "Connected" },
          { name: "Safaricom SMS", type: "SMS", status: "Connected" },
        ].map((integration) => (
          <div key={integration.name} className="rounded-lg border border-border/70 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">{integration.name}</p>
              <Badge variant={integration.status === "Connected" ? "secondary" : "outline"}>{integration.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Type: {integration.type}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline">Configure</Button>
              <Button size="sm" variant={integration.status === "Connected" ? "destructive" : "default"}>
                {integration.status === "Connected" ? "Disconnect" : "Connect"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}