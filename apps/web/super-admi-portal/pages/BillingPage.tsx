import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CardShell } from "./common";

export default function BillingPage() {
  return (
    <div className="space-y-4">
      <CardShell title="Subscription Plans" description="Manage platform plans and organization quotas">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { plan: "Starter", price: "$499/mo", features: "Up to 50 staff" },
            { plan: "Growth", price: "$1,499/mo", features: "Up to 250 staff" },
            { plan: "Enterprise", price: "Custom", features: "Unlimited tenants" },
          ].map((item) => (
            <div key={item.plan} className="rounded-xl border border-border/70 p-4">
              <p className="text-sm font-semibold">{item.plan}</p>
              <p className="mt-1 text-2xl font-semibold">{item.price}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.features}</p>
              <Button className="mt-3 w-full" variant="outline">Manage Plan</Button>
            </div>
          ))}
        </div>
      </CardShell>

      <CardShell title="Usage Limits" description="Usage by organization and subscription tier">
        <div className="space-y-3">
          {[
            { org: "Addis Prime Hospital", usage: 78 },
            { org: "St. Gabriel Clinic", usage: 55 },
            { org: "Mercy Women Center", usage: 44 },
          ].map((row) => (
            <div key={row.org}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>{row.org}</span>
                <span className="text-muted-foreground">{row.usage}%</span>
              </div>
              <Progress value={row.usage} className="h-2" />
            </div>
          ))}
        </div>
      </CardShell>
    </div>
  );
}