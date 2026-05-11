import { useEffect, useMemo, useState } from "react";
import { getMyApplication, requestApplicationUpdate } from "../../lib/orgApplicationApi";

export default function UpdateRequestPage() {
  const [applicationId, setApplicationId] = useState<string>("");
  const [services, setServices] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [updateState, setUpdateState] = useState<string>("none");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        setApplicationId(app.id);
        const seed = app.update_requested_services?.length ? app.update_requested_services : app.configured_services;
        setServices((seed || []).join(", "));
        setUpdateState(app.update_request_status || "none");
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load update request details.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const parsedServices = useMemo(
    () => services.split(",").map((item) => item.trim()).filter(Boolean),
    [services],
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!applicationId) return;
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const updated = await requestApplicationUpdate(applicationId, parsedServices, notes.trim());
      setUpdateState(updated.update_request_status || "pending");
      setSuccess("Update request submitted successfully.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit update request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Dashboard</p>
        <h1 className="text-2xl font-semibold tracking-tight">Update Request</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Request additional services after your account has been reviewed.
        </p>
      </div>

      {loading ? <div className="text-sm text-muted-foreground">Loading update request data...</div> : null}
      {error ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
      {success ? <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">{success}</div> : null}

      {!loading && !applicationId ? (
        <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          No organization application found yet. Submit Request Access first.
        </div>
      ) : null}

      <div className="rounded-2xl border bg-card p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Current update status</p>
        <p className="mt-2 text-sm font-medium">{updateState}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border bg-card p-6 shadow-sm">
        <div>
          <label className="text-sm font-medium">Services (comma separated)</label>
          <textarea
            rows={4}
            value={services}
            onChange={(event) => setServices(event.target.value)}
            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            placeholder="Radiology, ICU, Oncology"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            placeholder="Justification for requested services"
          />
        </div>

        <button
          type="submit"
          disabled={busy || !applicationId || parsedServices.length === 0}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Submitting..." : "Submit update request"}
        </button>
      </form>
    </section>
  );
}
