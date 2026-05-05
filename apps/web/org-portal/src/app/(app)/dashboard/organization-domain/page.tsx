"use client";

import { useEffect, useMemo, useState } from "react";

type DomainPayload = {
  id: string;
  organization_name: string;
  organization_slug: string;
  organization_domain?: string;
  status: string;
  domain_configured_at?: string | null;
  portal_admin_email?: string;
  portal_admin_password?: string;
};

export default function OrganizationDomainPage() {
  const [payload, setPayload] = useState<DomainPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadDomain() {
      const response = await fetch("/api/org/application/me", { cache: "no-store" });
      const body = (await response.json().catch(() => null)) as DomainPayload | { error?: string } | null;
      if (!mounted) return;
      if (!response.ok || !body || "error" in (body as Record<string, unknown>)) {
        setError((body as { error?: string } | null)?.error || "Unable to load organization domain");
      } else {
        setPayload(body as DomainPayload);
      }
      setLoading(false);
    }
    void loadDomain();
    return () => {
      mounted = false;
    };
  }, []);

  const statusHint = useMemo(() => {
    if (!payload) return "";
    if (payload.organization_domain) return "Your organization domain has been provisioned by super admin.";
    if (payload.status === "approved") return "Onboarding is approved. Domain provisioning is in progress.";
    return "Domain will be generated after approval and service configuration.";
  }, [payload]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Organization Domain</h1>
        <p className="text-sm text-muted-foreground">Each organization receives a unique slug and access domain after super-admin onboarding.</p>
      </div>

      {loading ? <div className="text-sm text-muted-foreground">Loading...</div> : null}
      {error ? <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

      {payload ? (
        <div className="rounded-2xl border bg-card p-4 md:p-6">
          <div className="grid gap-3 md:grid-cols-2">
            <p><span className="font-medium">Organization:</span> {payload.organization_name}</p>
            <p><span className="font-medium">Slug:</span> {payload.organization_slug}</p>
            <p><span className="font-medium">Onboarding status:</span> {payload.status}</p>
            <p><span className="font-medium">Configured at:</span> {payload.domain_configured_at ? new Date(payload.domain_configured_at).toLocaleString() : "Pending"}</p>
          </div>

          <div className="mt-5 rounded-xl border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Access Domain</p>
            <p className="mt-2 text-lg font-semibold">{payload.organization_domain || "Not assigned yet"}</p>
            <p className="mt-2 text-sm text-muted-foreground">{statusHint}</p>
          </div>

          {(payload.portal_admin_email || payload.portal_admin_password) ? (
            <div className="mt-5 rounded-xl border bg-amber-50/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Default Organization Admin Login</p>
              <p className="mt-2 text-sm"><span className="font-medium">Email:</span> {payload.portal_admin_email || "-"}</p>
              <p className="mt-1 text-sm"><span className="font-medium">Password:</span> {payload.portal_admin_password || "-"}</p>
              <p className="mt-2 text-xs text-muted-foreground">Change this password after first login.</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
