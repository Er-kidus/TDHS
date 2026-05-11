import { useEffect, useState } from "react";
import { getLastSubmission, getMyApplication, getOrgProfile } from "../../lib/orgApplicationApi";

type PendingSubmission = {
  status: string;
  updateRequestStatus?: string;
  domain?: string;
};

export default function RequestStatusPage() {
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
        status: snapshot.status || "pending",
        updateRequestStatus: "none",
        domain: "pending assignment",
      });
    }

    async function load() {
      try {
        const app = await getMyApplication();
        if (!mounted) return;
        if (app) {
          setPending({
            status: app.status || "pending",
            updateRequestStatus: app.update_request_status || "none",
            domain: app.organization_domain || "pending assignment",
          });
          setLoading(false);
          return;
        }

        await hydrateSnapshotForCurrentUser();
        setLoading(false);
        return;
      } catch (backendError) {
        if (!mounted) return;
        setError(backendError instanceof Error ? backendError.message : "Unable to load request status.");
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
        <h1 className="text-2xl font-semibold tracking-tight">Request Status</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review the current state of your request and follow the review process.
        </p>
      </div>

      {loading ? <div className="text-sm text-muted-foreground">Loading request status...</div> : null}
      {error ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Request access" value={pending ? pending.status : "not submitted"} />
        <InfoCard label="Pending access" value={pending ? pending.updateRequestStatus || "recorded" : "empty"} />
        <InfoCard label="Operational domain" value={pending ? pending.domain || "pending assignment" : "pending request"} />
      </div>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}
