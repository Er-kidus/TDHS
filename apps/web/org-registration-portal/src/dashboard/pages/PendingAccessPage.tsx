import { useEffect, useState } from "react";

import { CheckCircle2, ClipboardList } from "lucide-react";
import { getLastSubmission, getMyApplication, getOrgProfile } from "../../lib/orgApplicationApi";

type PendingSubmission = {
  organizationName: string;
  organizationSlug: string;
  contactEmail: string;
  status: string;
  requestedServices: string[];
};

export default function PendingAccessPage() {
  const [pending, setPending] = useState<PendingSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function hydrateSnapshotForCurrentUser() {
      const snapshot = getLastSubmission();
      if (!snapshot) return;

      try {
        const profile = await getOrgProfile();
        const currentEmail = (profile.email || "").trim().toLowerCase();
        if (currentEmail && snapshot.contactEmail.trim().toLowerCase() !== currentEmail) {
          return;
        }
      } catch {
        // If profile cannot be loaded, skip strict snapshot ownership filtering.
      }

      if (!mounted) return;
      setPending({
        organizationName: snapshot.organizationName,
        organizationSlug: snapshot.organizationSlug,
        contactEmail: snapshot.contactEmail,
        status: snapshot.status,
        requestedServices: snapshot.requestedServices,
      });
    }

    async function load() {
      try {
        const app = await getMyApplication();
        if (!mounted) return;
        if (app) {
          setPending({
            organizationName: app.organization_name,
            organizationSlug: app.organization_slug,
            contactEmail: app.contact_email,
            status: app.status,
            requestedServices: app.requested_services || [],
          });
          setLoading(false);
          return;
        }

        await hydrateSnapshotForCurrentUser();
        setLoading(false);
        return;
      } catch (backendError) {
        if (!mounted) return;
        setError(backendError instanceof Error ? backendError.message : "Unable to load pending access details.");
      }

      await hydrateSnapshotForCurrentUser();
      setLoading(false);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Dashboard</p>
        <h1 className="text-2xl font-semibold tracking-tight">Pending Access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Shows the last submitted request from this browser until it is approved.
        </p>
      </div>

      {loading ? <div className="text-sm text-muted-foreground">Loading pending access...</div> : null}
      {error ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

      {pending ? (
        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard label="Organization" value={pending.organizationName} />
          <InfoCard label="Slug" value={pending.organizationSlug} />
          <InfoCard label="Contact email" value={pending.contactEmail} />
          <InfoCard label="Status" value={pending.status} />
          <div className="md:col-span-2 rounded-2xl border bg-muted/30 p-4">
            <p className="text-sm font-medium">Requested services</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {pending.requestedServices.map((service) => (
                <span key={service} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 text-foreground">
            <ClipboardList className="h-4 w-4 text-primary" />
            No pending request yet
          </div>
          <p className="mt-2">Submit the request access form to populate this section.</p>
        </div>
      )}
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}
