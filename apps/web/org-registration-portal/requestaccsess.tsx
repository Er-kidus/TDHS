import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Building2,
  CheckCircle2,
  LocateFixed,
  MapPinned,
  Search,
  ShieldCheck,
  Users,
  ClipboardList,
} from "lucide-react";
import { usePortalPreferences } from "./src/components/layout/PortalPreferences";
import {
  getMyApplication,
  getMyOrganizationConfiguration,
  getMyServiceManagementConfiguration,
  getOrgAuthToken,
  getOrgProfile,
  setLastSubmission,
} from "./src/lib/orgApplicationApi";
import tierADoc from "../super-admi-portal/Docs/tier-a.md?raw";
import tierBDoc from "../super-admi-portal/Docs/tier-b.md?raw";
import tierCDoc from "../super-admi-portal/Docs/tier-c.md?raw";
import tierDDoc from "../super-admi-portal/Docs/tier-d.md?raw";
import tierEDoc from "../super-admi-portal/Docs/tier-e.md?raw";

type Service = {
  name: string;
  tier: string;
};

type TierLabel = (typeof TIERS)[number];
type TierDocKey = "tier-a" | "tier-b" | "tier-c" | "tier-d" | "tier-e";

type SubmittedApplication = {
  id: string;
  organization_name: string;
  organization_slug: string;
  status: string;
  contact_email: string;
};

const TIERS = [
  "Community Health Post",
  "Clinic",
  "Primary Hospital",
  "Specialized Hospital",
  "Tertiary / Teaching / Research",
] as const;

const LEGACY_SERVICE_CATALOG: Service[] = [
  { name: "First Aid Support", tier: "Community Health Post" },
  { name: "Health Education", tier: "Community Health Post" },
  { name: "General Consultation", tier: "Clinic" },
  { name: "Pediatrics", tier: "Clinic" },
  { name: "Vaccination", tier: "Clinic" },
  { name: "Emergency Room", tier: "Primary Hospital" },
  { name: "Surgery Unit", tier: "Primary Hospital" },
  { name: "ICU Care", tier: "Primary Hospital" },
  { name: "MRI Imaging", tier: "Specialized Hospital" },
  { name: "Neurology", tier: "Specialized Hospital" },
  { name: "Cardiology", tier: "Specialized Hospital" },
  { name: "Blood Test", tier: "Tertiary / Teaching / Research" },
  { name: "X-Ray", tier: "Tertiary / Teaching / Research" },
  { name: "CT Scan", tier: "Tertiary / Teaching / Research" },
];

const TIER_DOC_BY_LABEL: Record<TierLabel, TierDocKey> = {
  "Community Health Post": "tier-a",
  Clinic: "tier-b",
  "Primary Hospital": "tier-c",
  "Specialized Hospital": "tier-d",
  "Tertiary / Teaching / Research": "tier-e",
};

const TIER_DOC_CONTENT: Record<TierDocKey, string> = {
  "tier-a": tierADoc,
  "tier-b": tierBDoc,
  "tier-c": tierCDoc,
  "tier-d": tierDDoc,
  "tier-e": tierEDoc,
};

function parseServicesFromTierDoc(doc: string): string[] {
  const lines = doc
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const services: string[] = [];

  for (let i = 0; i < lines.length - 5; i += 1) {
    const isHeaderStart =
      lines[i].toLowerCase() === "role" &&
      lines[i + 1].toLowerCase() === "service" &&
      lines[i + 2].toLowerCase().startsWith("inputs") &&
      lines[i + 3].toLowerCase().startsWith("actions") &&
      lines[i + 4].toLowerCase().startsWith("outputs") &&
      lines[i + 5].toLowerCase().startsWith("fhir");

    if (!isHeaderStart) {
      continue;
    }

    let row = i + 6;
    while (row + 5 < lines.length) {
      const nextIsHeader = lines[row].toLowerCase() === "role" && lines[row + 1].toLowerCase() === "service";
      if (nextIsHeader) {
        break;
      }

      const role = lines[row];
      const service = lines[row + 1];

      const invalidService =
        service.length < 2 ||
        /^(role|inputs|actions|outputs|fhir)/i.test(service) ||
        /^(🔴|🔹|🟡|🔵|🟠|🧠|👩|👨|🧑|🚫|📱|💊|💉|🔪|🚨)/.test(role);

      if (!invalidService) {
        services.push(service);
      }

      row += 6;
    }

    i = row - 1;
  }

  return Array.from(new Set(services));
}

const TIER_SERVICE_MAP: Record<TierDocKey, string[]> = {
  "tier-a": parseServicesFromTierDoc(TIER_DOC_CONTENT["tier-a"]),
  "tier-b": parseServicesFromTierDoc(TIER_DOC_CONTENT["tier-b"]),
  "tier-c": parseServicesFromTierDoc(TIER_DOC_CONTENT["tier-c"]),
  "tier-d": parseServicesFromTierDoc(TIER_DOC_CONTENT["tier-d"]),
  "tier-e": parseServicesFromTierDoc(TIER_DOC_CONTENT["tier-e"]),
};

const SERVICE_CATALOG: Service[] = TIERS.flatMap((tier) => {
  const docKey = TIER_DOC_BY_LABEL[tier];
  const parsedServices = TIER_SERVICE_MAP[docKey];
  const fallbackServices = LEGACY_SERVICE_CATALOG.filter((service) => service.tier === tier).map((service) => service.name);
  const services = parsedServices.length > 0 ? parsedServices : fallbackServices;
  return services.map((name) => ({ name, tier }));
});

const copy = {
  en: {
    title: "Organization Registration",
    orgName: "Organization name",
    slug: "Slug",
    contactName: "Contact name",
    email: "Email",
    phone: "Phone",
    license: "License number",
    notes: "Verification notes",
    location: "Location",
    locationPlaceholder: "Search address...",
    tier: "Organization tier",
    included: "Included services",
    extras: "More services",
    extrasPlaceholder: "Search services...",
    submit: "Submit request",
    submitting: "Submitting...",
    signIn: "Already have access?",
    signInLink: "Go to sign in",
    successTitle: "Request submitted",
    successBody: "Your organization onboarding request has been captured and sent for review.",
    language: "አማርኛ",
    themeOn: "Switch to dark mode",
    themeOff: "Switch to light mode",
    mapReady: "Map preview ready for verification",
    mapHint: "Add an address to preview the map pin",
  },
  am: {
    title: "የድርጅት መመዝገቢያ",
    orgName: "የድርጅቱ ስም",
    slug: "ስለግ",
    contactName: "የተገናኝቶ ሰው",
    email: "ኢሜይል",
    phone: "ስልክ",
    license: "የፈቃድ ቁጥር",
    notes: "የማረጋገጫ ማስታወሻ",
    location: "ቦታ",
    locationPlaceholder: "አድራሻ ይፈልጉ...",
    tier: "የድርጅት ደረጃ",
    included: "የተካተቱ አገልግሎቶች",
    extras: "ተጨማሪ አገልግሎቶች",
    extrasPlaceholder: "አገልግሎቶችን ይፈልጉ...",
    submit: "ጥያቄ ላክ",
    submitting: "በመላክ ላይ...",
    signIn: "መዳረሻ አለዎት?",
    signInLink: "ወደ መግቢያ ይሂዱ",
    successTitle: "ጥያቄው ተልኳል",
    successBody: "የድርጅት መመዝገቢያ ጥያቄዎ ተመዝግቧል እና ለማረጋገጥ ተልኳል።",
    language: "English",
    themeOn: "ወደ ጨለማ ሁኔታ ቀይር",
    themeOff: "ወደ ብርሃን ሁኔታ ቀይር",
    mapReady: "የካርታ አስቀድሞ እይታ ዝግጁ ነው",
    mapHint: "የካርታ ምልክት ለማሳየት አድራሻ ያስገቡ",
  },
} as const;

function tierDescription(language: "en" | "am", tier: (typeof TIERS)[number]) {
  if (tier === "Clinic") {
    return language === "en" ? "Outpatient care and consultation" : "የውጭ ሕክምና እና ምክክር";
  }
  if (tier === "Primary Hospital") {
    return language === "en" ? "Emergency and inpatient care" : "አስቸኳይ እና የመኝታ እንክብካቤ";
  }
  if (tier === "Specialized Hospital") {
    return language === "en" ? "Advanced specialty care" : "የላቀ ስፔሻሊቲዎች";
  }
  if (tier === "Tertiary / Teaching / Research") {
    return language === "en" ? "Laboratory and imaging services" : "ላብ እና ኢምጀንግ አገልግሎቶች";
  }
  return language === "en" ? "Foundational community care" : "መሠረታዊ የማህበረሰብ እንክብካቤ";
}

function tierLabelFromBackendTier(tier: string): (typeof TIERS)[number] | null {
  const normalized = tier.trim().toLowerCase();
  if (normalized === "health-post") return "Community Health Post";
  if (normalized === "health-center") return "Clinic";
  if (normalized === "primary-hospital") return "Primary Hospital";
  if (normalized === "general-specialized-hospital") return "Specialized Hospital";
  if (normalized === "national-health-system") return "Tertiary / Teaching / Research";
  return null;
}

function App() {
  const { language } = usePortalPreferences();
  const [organizationName, setOrganizationName] = useState("");
  const [organizationSlug, setOrganizationSlug] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [profileEmail, setProfileEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedTier, setSelectedTier] = useState<(typeof TIERS)[number]>(TIERS[0]);
  const [additionalServices, setAdditionalServices] = useState<string[]>([]);
  const [installedServiceNames, setInstalledServiceNames] = useState<string[]>([]);
  const [serviceSearch, setServiceSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SubmittedApplication | null>(null);
  const [myApplicationStatus, setMyApplicationStatus] = useState<SubmittedApplication | null>(null);
  const [myUpdateRequestStatus, setMyUpdateRequestStatus] = useState<string>("none");

  const strings = copy[language];

  const effectiveServiceCatalog = useMemo(() => {
    const installedSet = new Set(installedServiceNames);
    return SERVICE_CATALOG.filter((service) => installedSet.has(service.name));
  }, [installedServiceNames]);

  const installedServices = useMemo(() => {
    const matchedServices = effectiveServiceCatalog;
    if (matchedServices.length > 0) {
      return matchedServices;
    }

    return installedServiceNames.map((name) => ({ name, tier: selectedTier }));
  }, [effectiveServiceCatalog, installedServiceNames, selectedTier]);

  const tierServices = useMemo(() => installedServices.filter((service) => service.tier === selectedTier), [installedServices, selectedTier]);

  const serviceOptions = useMemo(
    () =>
      effectiveServiceCatalog.filter(
        (service) => service.tier !== selectedTier && service.name.toLowerCase().includes(serviceSearch.toLowerCase()),
      ),
    [effectiveServiceCatalog, selectedTier, serviceSearch],
  );

  const selectedServices = useMemo(
    () => [...tierServices.map((service) => service.name), ...additionalServices],
    [additionalServices, tierServices],
  );

  const approvalNotification = useMemo(() => {
    if (!myApplicationStatus) return null;

    const status = myApplicationStatus.status.toLowerCase();
    if (status === "pending") {
      return {
        tone: "amber",
        title: language === "en" ? "Approval pending" : "ፈቃድ በመጠባበቅ ላይ",
        body:
          language === "en"
            ? "Your organization request is pending super admin approval. Installed/configured services will activate immediately after approval."
            : "የድርጅት ጥያቄዎ የሱፐር አድሚን ፈቃድ በመጠባበቅ ላይ ነው። ፈቃድ ከተሰጠ በኋላ አገልግሎቶች ወዲያውኑ ይነቃሉ።",
      };
    }

    if (myUpdateRequestStatus.toLowerCase() === "pending") {
      return {
        tone: "amber",
        title: language === "en" ? "Service update under review" : "የአገልግሎት ማሻሻያ በግምገማ ላይ",
        body:
          language === "en"
            ? "Your service update request is pending. Approved changes will be toggled in your configuration automatically."
            : "የአገልግሎት ማሻሻያ ጥያቄዎ በመጠባበቅ ላይ ነው። የተፈቀዱ ለውጦች በራስ-ሰር በኮንፊግሬሽን ላይ ይነቃሉ።",
      };
    }

    if (status === "approved" || status === "verified") {
      return {
        tone: "emerald",
        title: language === "en" ? "Access active" : "መዳረሻ ነቅቷል",
        body:
          language === "en"
            ? "Approved services are now active in your organization configuration."
            : "የተፈቀዱ አገልግሎቶች አሁን በድርጅትዎ ኮንፊግሬሽን ላይ ንቁ ናቸው።",
      };
    }

    return null;
  }, [language, myApplicationStatus, myUpdateRequestStatus]);

  useEffect(() => {
    let mounted = true;

    async function hydrateProfile() {
      const token = getOrgAuthToken();
      if (!token) {
        if (typeof window !== "undefined") {
          window.location.assign("/login?next=/request-access");
        }
        return;
      }

      try {
        let loadedInstalledServicesFromConfiguration = false;

        const profile = await getOrgProfile();
        if (!mounted) return;
        if (profile.email) {
          const normalizedEmail = profile.email.trim().toLowerCase();
          setProfileEmail(normalizedEmail);
          setContactEmail(normalizedEmail);
        }

        try {
          const serviceManagement = await getMyServiceManagementConfiguration();
          if (!mounted) return;
          if (serviceManagement?.installed_services?.length) {
            setInstalledServiceNames(serviceManagement.installed_services);
            loadedInstalledServicesFromConfiguration = true;
          }
          const tierLabel = serviceManagement?.tier ? tierLabelFromBackendTier(serviceManagement.tier) : null;
          if (tierLabel) {
            setSelectedTier(tierLabel);
          }
        } catch {
          // Fall back to organization configuration then application data when service management cannot be loaded.
        }

        if (!loadedInstalledServicesFromConfiguration) {
          try {
            const configuration = await getMyOrganizationConfiguration();
            if (!mounted) return;
            if (configuration?.enabled_services?.length) {
              setInstalledServiceNames(configuration.enabled_services);
              loadedInstalledServicesFromConfiguration = true;
            }
            const tierLabel = configuration?.tier ? tierLabelFromBackendTier(configuration.tier) : null;
            if (tierLabel) {
              setSelectedTier(tierLabel);
            }
          } catch {
            // Fall back to application data below when org configuration cannot be loaded.
          }
        }

        const myApplication = await getMyApplication();
        if (!mounted) return;
        if (myApplication) {
          setMyApplicationStatus({
            id: myApplication.id,
            organization_name: myApplication.organization_name,
            organization_slug: myApplication.organization_slug,
            status: myApplication.status,
            contact_email: myApplication.contact_email,
          });
          setMyUpdateRequestStatus(myApplication.update_request_status || "none");
        }
        if (!loadedInstalledServicesFromConfiguration && myApplication?.configured_services?.length) {
          setInstalledServiceNames(myApplication.configured_services);
        }
      } catch {
        // Keep manual fallback fields if profile lookup fails.
      }
    }

    void hydrateProfile();
    return () => {
      mounted = false;
    };
  }, []);

  async function detectLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setLatitude(lat);
      setLongitude(lng);

      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = (await response.json()) as { display_name?: string };
        setLocationAddress(data.display_name || `${lat}, ${lng}`);
      } catch {
        setLocationAddress(`${lat}, ${lng}`);
      }
    });
  }

  function toggleAdditionalService(serviceName: string) {
    setAdditionalServices((current) =>
      current.includes(serviceName) ? current.filter((name) => name !== serviceName) : [...current, serviceName],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!organizationName.trim() || !contactName.trim() || !contactEmail.trim() || !contactPhone.trim() || !licenseNumber.trim() || !locationAddress.trim()) {
      setError("Please complete all required fields before submitting.");
      return;
    }

    const effectiveContactEmail = (profileEmail || contactEmail).trim().toLowerCase();

    const payload = {
      organization_name: organizationName.trim(),
      organization_slug: organizationSlug.trim() || organizationName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      contact_name: contactName.trim(),
      contact_email: effectiveContactEmail,
      contact_phone: contactPhone.trim(),
      license_number: licenseNumber.trim(),
      location: {
        address: locationAddress.trim(),
        latitude: latitude ?? 0,
        longitude: longitude ?? 0,
      },
      requested_services: selectedServices,
    };

    setLoading(true);
    try {
      const token = getOrgAuthToken();
      const response = await fetch("/org/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        if (response.status === 404) {
          throw new Error("Submission endpoint not found (404). Start API gateway and reload the portal.");
        }
        throw new Error(body?.error || `Unable to submit organization request (${response.status})`);
      }

      const submitted = (await response.json().catch(() => null)) as SubmittedApplication | null;
      const snapshot = submitted || {
        id: "pending",
        organization_name: payload.organization_name,
        organization_slug: payload.organization_slug,
        status: "pending",
        contact_email: payload.contact_email,
      };
      setSuccess(snapshot);
      setLastSubmission({
        id: snapshot.id,
        organizationName: snapshot.organization_name,
        organizationSlug: snapshot.organization_slug,
        contactEmail: snapshot.contact_email,
        status: snapshot.status,
        requestedServices: selectedServices,
      });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to submit organization request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="mx-auto flex w-full max-w-5xl animate-fade-up items-center justify-center rounded-[1.75rem] border border-border/70 bg-card/90 p-5 shadow-soft sm:p-6 lg:p-8">
          {error ? (
            <div className="mb-5 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mb-5 rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              <p className="font-medium">{strings.successTitle}</p>
              <p className="mt-1 text-success/90">
                {strings.successBody} {success.organization_name} · {success.status} · {success.contact_email}
              </p>
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={strings.orgName}>
                <input
                  value={organizationName}
                  onChange={(event) => setOrganizationName(event.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                  placeholder={strings.orgName}
                  aria-label={strings.orgName}
                  required
                />
              </Field>
              <Field label={strings.slug}>
                <input
                  value={organizationSlug}
                  onChange={(event) => setOrganizationSlug(event.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                  placeholder="auto-generated if blank"
                  aria-label={strings.slug}
                />
              </Field>
              <Field label={strings.contactName}>
                <input
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                  placeholder={strings.contactName}
                  aria-label={strings.contactName}
                  required
                />
              </Field>
              <Field label={strings.email}>
                <input
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  type="email"
                  readOnly={Boolean(profileEmail)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                  placeholder={strings.email}
                  aria-label={strings.email}
                  required
                />
                {profileEmail ? (
                  <p className="mt-1 text-xs text-muted-foreground">Using your signed-in organization email.</p>
                ) : null}
              </Field>
              <Field label={strings.phone}>
                <input
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                  placeholder={strings.phone}
                  aria-label={strings.phone}
                  required
                />
              </Field>
              <Field label={strings.license}>
                <input
                  value={licenseNumber}
                  onChange={(event) => setLicenseNumber(event.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                  placeholder={strings.license}
                  aria-label={strings.license}
                  required
                />
              </Field>
            </div>

            <Field label={strings.notes}>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                placeholder={language === "en" ? "Add any notes for the verifier" : "ለማረጋገጫ ተጨማሪ ማስታወሻ ያስገቡ"}
                aria-label={strings.notes}
              />
            </Field>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MapPinned className="h-4 w-4 text-primary" />
                {strings.location}
              </div>
              <div className="flex gap-2">
                <input
                  value={locationAddress}
                  onChange={(event) => setLocationAddress(event.target.value)}
                  className="h-11 flex-1 rounded-xl border border-input bg-background px-4 text-sm"
                  placeholder={strings.locationPlaceholder}
                  aria-label={strings.location}
                  required
                />
                <button
                  type="button"
                  onClick={detectLocation}
                  aria-label="Detect current location"
                  title="Detect current location"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm hover:bg-muted"
                >
                  <LocateFixed className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void detectLocation()}
                  aria-label="Search address"
                  title="Search address"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm hover:bg-muted"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>

              {latitude !== null && longitude !== null ? (
                <iframe
                  title="Organization location preview"
                  className="h-48 w-full rounded-2xl border border-border/70"
                  src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                  {strings.mapHint}
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-2xl border border-border/70 bg-background/60 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Building2 className="h-4 w-4 text-primary" />
                  {strings.tier}
                </div>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {selectedTier}
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {TIERS.map((tier) => {
                  const active = tier === selectedTier;
                  const includedCount = effectiveServiceCatalog.filter((service) => service.tier === tier).length;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setSelectedTier(tier)}
                      className={`rounded-2xl border p-3.5 text-left transition-all ${
                        active
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-5">{tier}</p>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {includedCount}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">{tierDescription(language, tier)}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {strings.included}
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    {tierServices.length}
                  </span>
                </div>

                <div className="max-h-72 space-y-2 overflow-auto pr-1">
                  {tierServices.map((service) => (
                    <div key={service.name} className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/25 px-3 py-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="leading-5">{service.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Users className="h-4 w-4 text-primary" />
                    {strings.extras}
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    {additionalServices.length}
                  </span>
                </div>

                <input
                  value={serviceSearch}
                  onChange={(event) => setServiceSearch(event.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm"
                  placeholder={strings.extrasPlaceholder}
                />

                <div className="mt-3 max-h-60 overflow-auto pr-1">
                  <div className="flex flex-wrap gap-2">
                    {serviceOptions.map((service) => {
                      const selected = additionalServices.includes(service.name);
                      return (
                        <button
                          key={service.name}
                          type="button"
                          onClick={() => toggleAdditionalService(service.name)}
                          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${selected ? "border-primary bg-primary text-white" : "border-border/70 hover:bg-muted/60"}`}
                        >
                          {service.name}
                        </button>
                      );
                    })}
                    {serviceOptions.length === 0 ? (
                      <p className="text-xs text-muted-foreground">{language === "en" ? "No additional services found." : "ተጨማሪ አገልግሎቶች አልተገኙም።"}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {approvalNotification ? (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  approvalNotification.tone === "emerald"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-800"
                    : "border-amber-500/50 bg-amber-500/10 text-amber-900"
                }`}
              >
                <p className="font-semibold">{approvalNotification.title}</p>
                <p className="mt-1">{approvalNotification.body}</p>
              </div>
            ) : null}

            <div className="rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <ClipboardList className="h-4 w-4 text-primary" />
                Configured Services
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedServices.length} services selected for {selectedTier}.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {selectedServices.map((service) => (
                  <div key={service} className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2 text-xs text-foreground">
                    {service}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-soft transition-colors hover:opacity-95 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? strings.submitting : strings.submit}
            </button>
          </form>

      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default App;
