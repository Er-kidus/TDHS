"use client";

import { useMemo, useState } from "react";
import { EMR_ROLE_CATEGORIES, EMR_STAFF_STRUCTURE } from "@/lib/emr-staff-structure";

type ApplicationLocation = {
  address: string;
  latitude: number;
  longitude: number;
};

const DEFAULT_SERVICES = ["General Consultation", "Laboratory", "Pharmacy", "Telemedicine"];
const MOH_TIERS = [
  "health-post",
  "health-center",
  "primary-hospital",
  "general-specialized-hospital",
  "national-health-system",
];

const TIER_LABELS: Record<string, string> = {
  "health-post": "Community Health Post",
  "health-center": "Clinic / Health Center",
  "primary-hospital": "Primary Hospital",
  "general-specialized-hospital": "General/Specialized Hospital",
  "national-health-system": "National Health System",
};

export default function RequestAccessPage() {
  const [organizationName, setOrganizationName] = useState("");
  const [organizationSlug, setOrganizationSlug] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [requestedTier, setRequestedTier] = useState("health-center");
  const [address, setAddress] = useState("");
  const [defaultServices, setDefaultServices] = useState<string[]>([...DEFAULT_SERVICES]);
  const [additionalServices, setAdditionalServices] = useState<string[]>([]);
  const [requestedTemplates, setRequestedTemplates] = useState<string[]>([]);
  const [roleCategory, setRoleCategory] = useState<string>("");
  const [draftService, setDraftService] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tiersConfig, setTiersConfig] = useState<Array<{ tier: string, default_services: string[] }>>([]);

  // Fetch tiers config on mount
  useMemo(() => {
    fetch("/api/org/tiers")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTiersConfig(data);
          const initialTier = data.find(t => t.tier === requestedTier);
          if (initialTier && initialTier.default_services) {
            setDefaultServices(initialTier.default_services);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Update default services when tier changes
  const handleTierChange = (newTier: string) => {
    setRequestedTier(newTier);
    const tierMatch = tiersConfig.find(t => t.tier === newTier);
    if (tierMatch && tierMatch.default_services) {
      setDefaultServices(tierMatch.default_services);
    }
  };

  const serviceSummary = useMemo(() => {
    const all = [...defaultServices, ...additionalServices];
    return all.length ? all.join(", ") : "No services selected";
  }, [defaultServices, additionalServices]);

  const availableRoles = useMemo(
    () => (roleCategory ? EMR_STAFF_STRUCTURE.filter((role) => role.category === roleCategory) : EMR_STAFF_STRUCTURE),
    [roleCategory],
  );

  function toggleTemplate(templateKey: string) {
    setRequestedTemplates((current) =>
      current.includes(templateKey) ? current.filter((item) => item !== templateKey) : [...current, templateKey],
    );
  }

  function addService() {
    const value = draftService.trim();
    if (!value) return;
    setAdditionalServices((current) => {
      if (current.some((item) => item.toLowerCase() === value.toLowerCase()) || defaultServices.some((item) => item.toLowerCase() === value.toLowerCase())) {
        return current;
      }
      return [...current, value];
    });
    setDraftService("");
  }

  function removeService(service: string) {
    setAdditionalServices((current) => current.filter((item) => item !== service));
  }

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);

    const location: ApplicationLocation = {
      address: address.trim(),
      latitude: 0,
      longitude: 0,
    };

    const payload = {
      organization_name: organizationName.trim(),
      organization_slug: organizationSlug.trim(),
      contact_name: contactName.trim(),
      contact_email: contactEmail.trim().toLowerCase(),
      contact_phone: contactPhone.trim(),
      license_number: licenseNumber.trim(),
      location,
      requested_services: [...defaultServices, ...additionalServices],
      selected_staff_templates: requestedTemplates,
      requested_tier: requestedTier,
    };

    try {
      const response = await fetch("/api/org/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(body?.error || "Unable to submit access request");
      }

      setMessage("Access request submitted. Super admin will review your onboarding and service configuration.");
      setOrganizationName("");
      setOrganizationSlug("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setLicenseNumber("");
      setRequestedTier("health-center");
      setAddress("");
      setAdditionalServices([]);
      setRequestedTemplates([]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to submit access request");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Request Access</h1>
        <p className="text-sm text-muted-foreground">Submit your organization onboarding request with license and required services.</p>
      </div>

      {message ? <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

      <form onSubmit={submitRequest} className="grid gap-4 rounded-2xl border bg-card p-4 md:grid-cols-2 md:p-6">
        <label className="space-y-1 text-sm">
          <span>Organization name</span>
          <input className="h-10 w-full rounded-lg border px-3" value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} required />
        </label>

        <label className="space-y-1 text-sm">
          <span>Organization slug</span>
          <input className="h-10 w-full rounded-lg border px-3" value={organizationSlug} onChange={(event) => setOrganizationSlug(event.target.value)} placeholder="auto-generated if empty" />
        </label>

        <label className="space-y-1 text-sm">
          <span>Contact name</span>
          <input className="h-10 w-full rounded-lg border px-3" value={contactName} onChange={(event) => setContactName(event.target.value)} required />
        </label>

        <label className="space-y-1 text-sm">
          <span>Contact email</span>
          <input type="email" className="h-10 w-full rounded-lg border px-3" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} required />
        </label>

        <label className="space-y-1 text-sm">
          <span>Contact phone</span>
          <input className="h-10 w-full rounded-lg border px-3" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} required />
        </label>

        <label className="space-y-1 text-sm">
          <span>License number</span>
          <input className="h-10 w-full rounded-lg border px-3" value={licenseNumber} onChange={(event) => setLicenseNumber(event.target.value)} required />
        </label>

        <label className="space-y-1 text-sm">
          <span>Requested tier</span>
          <select className="h-10 w-full rounded-lg border px-3" value={requestedTier} onChange={(event) => handleTierChange(event.target.value)}>
            {MOH_TIERS.map((tier) => (
              <option key={tier} value={tier}>{TIER_LABELS[tier] || tier}</option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm md:col-span-2">
          <span>Location address</span>
          <input className="h-10 w-full rounded-lg border px-3" value={address} onChange={(event) => setAddress(event.target.value)} required />
        </label>

        <div className="space-y-2 md:col-span-2">
          <div className="text-sm font-medium">Included Services (Tier Defaults)</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {defaultServices.map((service) => (
              <span key={service} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground border">
                {service}
              </span>
            ))}
          </div>

          <div className="text-sm font-medium">Additional Services Request</div>
          <p className="text-xs text-muted-foreground mb-2">Request additional capabilities beyond your tier defaults. These require super admin approval.</p>
          <div className="flex gap-2">
            <input className="h-10 flex-1 rounded-lg border px-3" value={draftService} onChange={(event) => setDraftService(event.target.value)} placeholder="E.g., Specialized Dialysis, Telemedicine" />
            <button type="button" onClick={addService} className="rounded-lg border px-4 text-sm hover:bg-accent">Add Request</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {additionalServices.map((service) => (
              <button key={service} type="button" onClick={() => removeService(service)} className="rounded-full border border-primary/40 bg-primary/5 px-3 py-1 text-xs text-primary hover:bg-primary/10">
                {service} x
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm">Requested staff templates</div>
            <select aria-label="Role category" className="h-9 rounded-lg border px-3 text-xs" value={roleCategory} onChange={(event) => setRoleCategory(event.target.value)}>
              <option value="">All categories</option>
              {EMR_ROLE_CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="max-h-60 space-y-1 overflow-auto rounded-lg border p-2">
            {availableRoles.map((role) => (
              <label key={role.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-accent">
                <input
                  type="checkbox"
                  checked={requestedTemplates.includes(role.id)}
                  onChange={() => toggleTemplate(role.id)}
                />
                <span>{role.title}</span>
                <span className="text-muted-foreground">({role.apiRole})</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Selected templates: {requestedTemplates.length}</p>
        </div>

        <div className="md:col-span-2">
          <button disabled={busy} type="submit" className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60">
            {busy ? "Submitting..." : "Submit access request"}
          </button>
        </div>
      </form>
    </div>
  );
}
