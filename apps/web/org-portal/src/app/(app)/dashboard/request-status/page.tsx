"use client";

import { useEffect, useState } from "react";

type OrgApplicationStatus = {
  id: string;
  organization_name: string;
  organization_slug: string;
  organization_domain?: string;
  status: string;
  approved_by?: string;
  verified_at?: string | null;
  configured_services: string[];
  update_request_status?: string;
  update_requested_services?: string[];
  updated_at: string;
};

export default function RequestStatusPage() {
  const [item, setItem] = useState<OrgApplicationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadStatus() {
      const response = await fetch("/api/org/application/me", { cache: "no-store" });
      const body = (await response.json().catch(() => null)) as OrgApplicationStatus | { error?: string } | null;
      if (!mounted) return;

      if (!response.ok || !body || "error" in (body as Record<string, unknown>)) {
        setError((body as { error?: string } | null)?.error || "Unable to load request status");
      } else {
        setItem(body as OrgApplicationStatus);
      }
    }
    void loadStatus();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Request Status</h1>
        <p className="text-sm text-muted-foreground">Track onboarding approval, service updates, and provisioning state.</p>
      </div>

      {error ? <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

      {item ? (
        <div className="space-y-4 rounded-2xl border bg-card p-4 md:p-6">
          <div className="grid gap-3 md:grid-cols-2">
            <p><span className="font-medium">Organization:</span> {item.organization_name}</p>
            <p><span className="font-medium">Slug:</span> {item.organization_slug}</p>
            <p><span className="font-medium">Onboarding status:</span> {item.status}</p>
            <p><span className="font-medium">Update request status:</span> {item.update_request_status || "none"}</p>
            <p><span className="font-medium">Approved by:</span> {item.approved_by || "Pending"}</p>
            <p><span className="font-medium">Last updated:</span> {new Date(item.updated_at).toLocaleString()}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium">Configured services</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {(item.configured_services || []).map((service) => (
                <span key={service} className="rounded-full border px-3 py-1 text-xs">{service}</span>
              ))}
            </div>
          </div>

          {(item.update_requested_services || []).length > 0 ? (
            <div>
              <h2 className="text-sm font-medium">Latest update request services</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {(item.update_requested_services || []).map((service) => (
                  <span key={service} className="rounded-full border border-amber-300 bg-amber-100/30 px-3 py-1 text-xs">{service}</span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
