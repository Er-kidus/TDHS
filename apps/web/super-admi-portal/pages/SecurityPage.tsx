/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardShell } from "./common";

export default function SecurityPage(props: any) {
  const { showDangerAction, pushSystemAction } = props;

  return (
    <div className="space-y-4">
      <CardShell title="Security Controls" description="API keys, IP whitelisting, MFA, and sign-in threat monitoring">
        <Tabs defaultValue="api">
          <TabsList className="mb-4 grid h-auto grid-cols-2 gap-2 md:grid-cols-4">
            <TabsTrigger value="api">API Keys</TabsTrigger>
            <TabsTrigger value="ip">IP Whitelist</TabsTrigger>
            <TabsTrigger value="attempts">Login Attempts</TabsTrigger>
            <TabsTrigger value="mfa">MFA</TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="space-y-3">
            {[
              { name: "fhir-main", scopes: "fhir:read,fhir:write", rotated: "4 days ago" },
              { name: "billing-sync", scopes: "billing:*", rotated: "11 days ago" },
            ].map((key) => (
              <div key={key.name} className="rounded-lg border border-border/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{key.name}</p>
                    <p className="text-xs text-muted-foreground">{key.scopes} • rotated {key.rotated}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => showDangerAction(`Rotate API key: ${key.name}`)}>Rotate Key</Button>
                    <Button size="sm" variant="destructive" onClick={() => showDangerAction(`Revoke API key: ${key.name}`)}>Revoke</Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="ip" className="space-y-3">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]"><Input placeholder="Add CIDR (example: 10.10.0.0/16)" /><Button variant="outline">Add IP</Button></div>
            <p className="text-xs text-muted-foreground">Whitelisted ranges: 10.10.0.0/16, 172.16.2.0/24, 196.188.120.0/22</p>
          </TabsContent>

          <TabsContent value="attempts" className="space-y-2">
            {["7 failed attempts detected from 196.188.201.32", "Account lockout policy triggered for 2 users", "Geo-velocity anomaly blocked by risk engine"].map((item) => (
              <div key={item} className="rounded-lg border border-border/70 p-3 text-sm">{item}</div>
            ))}
          </TabsContent>

          <TabsContent value="mfa" className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border/70 p-3">
              <div>
                <p className="text-sm font-medium">Enforce MFA for all privileged users</p>
                <p className="text-xs text-muted-foreground">Required for super admins and organization admins</p>
              </div>
              <Switch defaultChecked onCheckedChange={(checked) => pushSystemAction(`MFA enforcement changed to ${checked}`)} />
            </div>
          </TabsContent>
        </Tabs>
      </CardShell>
    </div>
  );
}