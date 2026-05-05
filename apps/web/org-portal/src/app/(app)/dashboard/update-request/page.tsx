"use client";

import { useEffect, useMemo, useState } from "react";

type OrgApplication = {
  id: string;
  organization_name: string;
  organization_slug: string;
  configured_services: string[];
  update_requested_services: string[];
  update_request_status: string;
};

export default function UpdateRequestPage() {
  const [application, setApplication] = useState<OrgApplication | null>(null);
  const [servicesText, setServicesText] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const response = await fetch("/api/org/application/me", { cache: "no-store" });
      const body = (await response.json().catch(() => null)) as OrgApplication | { error?: string } | null;
      if (!mounted) return;

      if (!response.ok || !body || "error" in (body as Record<string, unknown>)) {
        setError((body as { error?: string } | null)?.error || "Unable to load your application");
      } else {
        const item = body as OrgApplication;
        setApplication(item);
        const source = item.update_requested_services?.length ? item.update_requested_services : item.configured_services;
        setServicesText((source || []).join(", "));
      }
      setLoading(false);
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const updateStatus = useMemo(() => application?.update_request_status || "none", [application]);

  async function submitUpdateRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!application) return;

    setBusy(true);
    setMessage(null);
    setError(null);

    const services = servicesText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const response = await fetch(`/api/org/applications/${encodeURIComponent(application.id)}/request-update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services, notes }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string; update_request_status?: string } | null;
      if (!response.ok) {
        throw new Error(body?.error || "Unable to submit update request");
      }
      setMessage("Update request sent. Super admin can now review additional service configuration.");
      setApplication((current) =>
        current
          ? {
              ...current,
              update_requested_services: services,
              update_request_status: body?.update_request_status || "pending",
            }
          : current,
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to submit update request");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading application...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Update Request</h1>
        <p className="text-sm text-muted-foreground">Request additional service configuration for your organization.</p>
      </div>

      {error ? <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
      {message ? <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">{message}</div> : null}

      <div className="rounded-xl border bg-card p-4 text-sm">
        <p><span className="font-medium">Organization:</span> {application?.organization_name || "-"}</p>
        <p><span className="font-medium">Slug:</span> {application?.organization_slug || "-"}</p>
        <p><span className="font-medium">Current request state:</span> {updateStatus}</p>
      </div>

      <form onSubmit={submitUpdateRequest} className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
        <label className="space-y-1 text-sm">
          <span>Services (comma separated)</span>
          <textarea
            rows={4}
            className="w-full rounded-lg border px-3 py-2"
            value={servicesText}
            onChange={(event) => setServicesText(event.target.value)}
            placeholder="Radiology, ICU, MRI"
            required
          />
        </label>

        <label className="space-y-1 text-sm">
          <span>Request notes</span>
          <textarea
            rows={3}
            className="w-full rounded-lg border px-3 py-2"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Describe the additional services and justification"
          />
        </label>

        <button disabled={busy} type="submit" className="h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60">
          {busy ? "Sending..." : "Send update request"}
        </button>
      </form>
    </div>
  );
}
