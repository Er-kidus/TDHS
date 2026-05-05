import { useEffect, useState } from "react";
import { getMyApplication } from "../../lib/orgApplicationApi";

export default function OrganizationalDomainPage() {
  const [domain, setDomain] = useState<string>("Provided by super-admin after onboarding");
  const [slugHint, setSlugHint] = useState<string>("Organization name is converted into a unique slug");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const app = await getMyApplication();
        if (!mounted) return;
        if (!app) {
          setLoading(false);
          return;
        }
        setDomain(app.organization_domain || "Pending super-admin domain assignment");
        setSlugHint(app.organization_slug || "Organization name is converted into a unique slug");
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load organization domain.");
      } finally {
        if (mounted) setLoading(false);
      }
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
        <h1 className="text-2xl font-semibold tracking-tight">Organizational Domain</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your final domain will be assigned after review and approval.
        </p>
      </div>

      {loading ? <div className="text-sm text-muted-foreground">Loading domain details...</div> : null}
      {error ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard label="Portal domain" value={domain} />
        <InfoCard label="Current slug" value={slugHint} />
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
