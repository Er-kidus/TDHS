"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SERVICE_DEFINITIONS, type Priority } from "@/lib/sds";
import { AiBookingModal } from "@/components/ai/AiBookingModal";
import { Sparkles } from "lucide-react";

type AppointmentStatus =
  | "proposed"
  | "booked"
  | "arrived"
  | "triage_waiting"
  | "triage_in_progress"
  | "triage_completed"
  | "in-progress"
  | "fulfilled"
  | "cancelled"
  | "noshow";

type AppointmentView = "list" | "calendar";
type AppointmentTab = "upcoming" | "past" | "cancelled" | "all" | "calendar";

type Appointment = {
  id: string;
  status: AppointmentStatus;
  description: string;
  serviceType: string;
  serviceCategory: string;
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
  nearbyHospitalId?: string;
  nearbyHospitalName?: string;
  nearbyHospitalAddress?: string;
  nearbyHospitalDistanceKm?: number;
  location: string;
  start: string;
  end: string;
  durationMinutes: number;
  priority: Priority;
  reason?: string;
  notes?: string;
};

type ServiceOption = {
  id: string;
  name: string;
  serviceType: string;
  serviceCategory: string;
  duration_minutes?: number;
};

type HospitalOption = {
  id: string;
  name: string;
  slug: string;
  address: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  services: string[];
  latitude?: number;
  longitude?: number;
};

function formatAppointmentStatus(status: AppointmentStatus) {
  return status
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function toDateTimeLocalValue(inputIso: string) {
  const date = new Date(inputIso);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function toDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function addMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60000).toISOString();
}

function normalizeAppointment(input: Record<string, unknown>, facilities: HospitalOption[]): Appointment {
  const start = typeof input.scheduled_at === "string" ? input.scheduled_at : new Date().toISOString();
  const serviceType = typeof input.serviceType === "string" ? input.serviceType : "general_consultation";
  const service = SERVICE_DEFINITIONS.find((item) => item.serviceType === serviceType) ?? SERVICE_DEFINITIONS[0];
  const allFacilities = facilities;
  const fallbackFacility = allFacilities[0] ?? {
    id: "unknown-facility",
    name: "Unknown Hospital",
    slug: "unknown-hospital",
    address: "Address unavailable",
    services: [],
  };
  const facilityId = typeof input.facilityId === "string" ? input.facilityId : fallbackFacility.id;
  const facility = allFacilities.find((item) => item.id === facilityId) ?? fallbackFacility;
  const durationMinutes = typeof input.duration_minutes === "number" ? input.duration_minutes : service.durationMinutes;
  const nearbyHospitalId = typeof input.nearbyHospitalId === "string" ? input.nearbyHospitalId : undefined;
  const nearbyHospitalName = typeof input.nearbyHospitalName === "string" ? input.nearbyHospitalName : undefined;
  const nearbyHospitalAddress = typeof input.nearbyHospitalAddress === "string" ? input.nearbyHospitalAddress : undefined;
  const nearbyHospitalDistanceKm = typeof input.nearbyHospitalDistanceKm === "number" ? input.nearbyHospitalDistanceKm : undefined;

  return {
    id: typeof input.id === "string" ? input.id : `local-${Date.now()}`,
    status: (typeof input.status === "string" ? input.status : "booked") as AppointmentStatus,
    description: typeof input.description === "string" ? input.description : service.name,
    serviceType,
    serviceCategory: typeof input.serviceCategory === "string" ? input.serviceCategory : service.serviceCategory,
    facilityId,
    facilityName: typeof input.facilityName === "string" ? input.facilityName : facility.name,
    facilityAddress: typeof input.facilityAddress === "string" ? input.facilityAddress : facility.address,
    nearbyHospitalId,
    nearbyHospitalName,
    nearbyHospitalAddress,
    nearbyHospitalDistanceKm,
    location: typeof input.location === "string" ? input.location : facility.name,
    start,
    end: typeof input.end === "string" ? input.end : addMinutes(start, durationMinutes),
    durationMinutes,
    priority: (typeof input.priority === "string" ? input.priority : "routine") as Priority,
    reason: typeof input.reason === "string" ? input.reason : undefined,
    notes: typeof input.notes === "string" ? input.notes : undefined,
  };
}

export default function AppointmentsPage() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [tab, setTab] = useState<AppointmentTab>('upcoming');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');
  
  const [details, setDetails] = useState<Appointment | null>(null);
  const [rescheduleAt, setRescheduleAt] = useState('');
  
  const [formOpen, setFormOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // GPS location
  const [patientLocation, setPatientLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "granted" | "denied">("idle");
  const [serviceId, setServiceId] = useState(SERVICE_DEFINITIONS[0].id);
  const [hospitalOptions, setHospitalOptions] = useState<HospitalOption[]>([]);
  const [facilityId, setFacilityId] = useState<string>("");
  const [orgSearch, setOrgSearch] = useState("");
  const [scheduledAt, setScheduledAt] = useState(new Date(Date.now() + 3600000).toISOString().slice(0, 16));
  const [description, setDescription] = useState("In-person visit");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Priority>("routine");
  const [selectedNearbyHospitalId, setSelectedNearbyHospitalId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>(
    SERVICE_DEFINITIONS.map((item) => ({
      id: item.id,
      name: item.name,
      serviceType: item.serviceType,
      serviceCategory: item.serviceCategory,
      duration_minutes: item.durationMinutes,
    }))
  );

  // Request GPS on mount
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPatientLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocationStatus("granted");
      },
      () => setLocationStatus("denied"),
      { timeout: 8000 }
    );
  }, []);

  const selectedFacility = hospitalOptions.find((item) => item.id === facilityId) ?? hospitalOptions[0];
  // Filter orgs by selected service type, org search, sorted by patient GPS distance
  const selectedServiceType = serviceOptions.find((s) => s.id === serviceId)?.serviceType ?? "";
  const filteredOrgs = useMemo(() => {
    let orgs = hospitalOptions;
    // Filter by service if org has services listed
    if (selectedServiceType) {
      const matching = orgs.filter(
        (o) => o.services.length === 0 || o.services.some((s) => s.toLowerCase().includes(selectedServiceType.toLowerCase().replace(/_/g, " ")) || selectedServiceType.toLowerCase().includes(s.toLowerCase().replace(/ /g, "_")))
      );
      if (matching.length > 0) orgs = matching;
    }
    // Text search
    if (orgSearch.trim()) {
      const q = orgSearch.toLowerCase();
      orgs = orgs.filter((o) => o.name.toLowerCase().includes(q) || o.address?.toLowerCase().includes(q));
    }
    // Sort by patient GPS distance
    if (patientLocation) {
      return [...orgs].sort((a, b) => {
        if (a.latitude === undefined || b.latitude === undefined) return 0;
        return (
          toDistanceKm(patientLocation.lat, patientLocation.lon, a.latitude!, a.longitude!) -
          toDistanceKm(patientLocation.lat, patientLocation.lon, b.latitude!, b.longitude!)
        );
      });
    }
    return orgs;
  }, [hospitalOptions, selectedServiceType, orgSearch, patientLocation]);

  const nearbyHospitals = useMemo(() => {
    if (!selectedFacility) return [] as HospitalOption[];
    const rest = filteredOrgs.filter((item) => item.id !== selectedFacility.id);
    return rest;
  }, [filteredOrgs, selectedFacility]);
  const mapEmbedUrl =
    selectedFacility && selectedFacility.latitude !== undefined && selectedFacility.longitude !== undefined
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${selectedFacility.longitude - 0.03}%2C${selectedFacility.latitude - 0.02}%2C${selectedFacility.longitude + 0.03}%2C${selectedFacility.latitude + 0.02}&layer=mapnik&marker=${selectedFacility.latitude}%2C${selectedFacility.longitude}`
      : null;
  const selectedNearbyHospital = nearbyHospitals.find((item) => item.id === selectedNearbyHospitalId);
  const selectedNearbyHospitalDistanceKm = selectedNearbyHospital
    && selectedFacility
    && selectedFacility.latitude !== undefined
    && selectedFacility.longitude !== undefined
    && selectedNearbyHospital.latitude !== undefined
    && selectedNearbyHospital.longitude !== undefined
    ? toDistanceKm(selectedFacility.latitude, selectedFacility.longitude, selectedNearbyHospital.latitude, selectedNearbyHospital.longitude)
    : undefined;

  async function loadHospitals() {
    try {
      const res = await fetch("/api/organizations", { method: "GET" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      const payload: unknown = await res.json();
      if (!Array.isArray(payload)) {
        throw new Error("Unexpected response shape from /api/organizations");
      }

      const options = payload
        .map((item) => {
          const row = item as Record<string, unknown>;

          if (
            typeof row.id === "string" &&
            typeof row.name === "string" &&
            typeof row.slug === "string"
          ) {
            return {
              id: row.id,
              name: row.name,
              slug: row.slug,
              address: typeof row.address === "string" ? row.address : row.slug,
              contactName: typeof row.contact_name === "string" ? row.contact_name : undefined,
              contactEmail: typeof row.contact_email === "string" ? row.contact_email : undefined,
              contactPhone: typeof row.contact_phone === "string" ? row.contact_phone : undefined,
              services: Array.isArray(row.services) ? row.services.filter((value): value is string => typeof value === "string") : [],
              latitude: typeof row.latitude === "number" ? row.latitude : undefined,
              longitude: typeof row.longitude === "number" ? row.longitude : undefined,
            } as HospitalOption;
          }

          if (
            typeof row.organization_id === "string" &&
            typeof row.organization_name === "string" &&
            typeof row.organization_slug === "string"
          ) {
            return {
              id: row.organization_id,
              name: row.organization_name,
              slug: row.organization_slug,
              address: typeof row.address === "string" ? row.address : row.organization_slug,
              contactName: typeof row.contact_name === "string" ? row.contact_name : undefined,
              contactEmail: typeof row.contact_email === "string" ? row.contact_email : undefined,
              contactPhone: typeof row.contact_phone === "string" ? row.contact_phone : undefined,
              services: Array.isArray(row.services) ? row.services.filter((value): value is string => typeof value === "string") : [],
              latitude: typeof row.latitude === "number" ? row.latitude : undefined,
              longitude: typeof row.longitude === "number" ? row.longitude : undefined,
            } as HospitalOption;
          }

          return null;
        })
        .filter((item): item is HospitalOption => Boolean(item));

      if (options.length > 0) {
        setHospitalOptions(options);
        setFacilityId((current) => (options.some((option) => option.id === current) ? current : options[0].id));
      } else {
        setHospitalOptions([]);
        setFacilityId("");
      }
    } catch (error) {
      console.error("Failed to fetch organizations for appointment booking", error);
      setHospitalOptions([]);
      setFacilityId("");
    }
  }

  async function loadServices() {
    try {
      const res = await fetch("/api/services", { method: "GET" });
      if (!res.ok) return;
      const payload: unknown = await res.json();
      if (!Array.isArray(payload)) return;
      const options = payload
        .map((item) => {
          const row = item as Record<string, unknown>;
          if (typeof row.id !== "string" || typeof row.name !== "string") return null;
          return {
            id: row.id,
            name: row.name,
            serviceType:
              typeof row.serviceType === "string"
                ? row.serviceType
                : typeof row.service_type === "string"
                ? row.service_type
                : "general_consultation",
            serviceCategory:
              typeof row.serviceCategory === "string"
                ? row.serviceCategory
                : typeof row.service_category === "string"
                ? row.service_category
                : "consultation",
            duration_minutes:
              typeof row.duration_minutes === "number"
                ? row.duration_minutes
                : typeof row.durationMinutes === "number"
                ? row.durationMinutes
                : 15,
          } as ServiceOption;
        })
        .filter((item): item is ServiceOption => Boolean(item));

      if (options.length > 0) {
        setServiceOptions(options);
        setServiceId(options[0].id);
      }
    } catch {
      // Keep local fallback definitions when SDS API is unavailable.
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments?limit=100");
      if (!res.ok) throw new Error("Failed to load appointments");
      const payload: unknown = await res.json();
      const normalized = Array.isArray(payload)
        ? payload.map((item) => normalizeAppointment(item as Record<string, unknown>, hospitalOptions))
        : [];
      setItems(normalized);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [hospitalOptions]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadServices();
    void loadHospitals();
  }, []);

  async function createAppointment() {
    const service =
      serviceOptions.find((item) => item.id === serviceId) ??
      serviceOptions[0] ?? {
        id: "general-consultation",
        name: "General Consultation",
        serviceType: "general_consultation",
        serviceCategory: "consultation",
        duration_minutes: 20,
      };
    const facility = selectedFacility;
    if (!facility) {
      setError("No registered hospitals available right now");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const start = new Date(scheduledAt).toISOString();
      const payload = {
        scheduledAt: start,
        description,
        reason,
        notes,
        priority,
        serviceType: service.serviceType,
        serviceCategory: service.serviceCategory,
        appointmentType: "in-person",
        facilityId: facility.id,
        facilityName: facility.name,
        facilityAddress: facility.address,
        nearbyHospitalId: selectedNearbyHospital?.id,
        nearbyHospitalName: selectedNearbyHospital?.name,
        nearbyHospitalAddress: selectedNearbyHospital?.address,
        nearbyHospitalDistanceKm: selectedNearbyHospitalDistanceKm,
        location: facility.name,
      };
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create appointment");
      setFormOpen(false);
      setReason("");
      setNotes("");
      setSelectedNearbyHospitalId("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create appointment");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(item: Appointment, nextStatus: AppointmentStatus) {
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Failed to update appointment");
      }
      if (nextStatus === "cancelled" && details?.id === item.id) {
        setDetails(null);
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update appointment");
    }
  }

  async function rescheduleAppointment() {
    if (!details || !rescheduleAt) {
      setError("Please choose a new date and time to reschedule");
      return;
    }
    setError(null);
    try {
      const nextIso = new Date(rescheduleAt).toISOString();
      const res = await fetch(`/api/appointments/${details.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: nextIso, status: "booked" }),
      });
      if (!res.ok) throw new Error("Failed to reschedule appointment");
      setDetails(null);
      setRescheduleAt("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reschedule appointment");
    }
  }

  const filtered = useMemo(() => {
    const now = Date.now();
    return items.filter((item) => {
      const ts = new Date(item.start).getTime();
      if (tab === "upcoming" && ts < now) return false;
      if (tab === "past" && ts >= now) return false;
      if (tab === "cancelled" && item.status !== "cancelled") return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (categoryFilter !== "all" && item.serviceCategory !== categoryFilter) return false;
      if (dateFilter && !item.start.startsWith(dateFilter)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${item.description} ${item.serviceType} ${item.serviceCategory} ${item.facilityName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, tab, statusFilter, categoryFilter, dateFilter, search]);

  const groupedByDay = useMemo(() => {
    return filtered.reduce<Record<string, Appointment[]>>((acc, item) => {
      const day = item.start.slice(0, 10);
      if (!acc[day]) acc[day] = [];
      acc[day].push(item);
      return acc;
    }, {});
  }, [filtered]);

  return (
    <div className="mx-auto max-w-screen-2xl space-y-5">
      <header className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your healthcare visits (physical facility appointments only).</p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setFormOpen((prev) => !prev)} className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
            + Book Appointment
          </button>
          <button onClick={() => setAiModalOpen(true)} className="rounded-lg bg-sky-500 hover:bg-sky-600 px-3 py-2 text-sm font-medium text-white inline-flex items-center gap-1.5 transition">
            <Sparkles className="h-4 w-4" /> Book with AI
          </button>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service, reason, facility"
            className="h-10 min-w-60 rounded-lg border border-border bg-background px-3 text-sm"
          />
          <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | AppointmentStatus)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
            <option value="all">All status</option>
            <option value="booked">Booked</option>
            <option value="arrived">Arrived</option>
            <option value="triage_waiting">Triage Waiting</option>
            <option value="triage_in_progress">Triage In Progress</option>
            <option value="triage_completed">Triage Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="fulfilled">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select aria-label="Filter by service category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
            <option value="all">All categories</option>
            {Array.from(new Set(serviceOptions.map((item) => item.serviceCategory))).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input aria-label="Filter by date" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setView("list")} className={`rounded-lg border px-3 py-2 text-sm ${view === "list" ? "bg-muted" : "bg-background"}`}>List</button>
            <button onClick={() => setView("calendar")} className={`rounded-lg border px-3 py-2 text-sm ${view === "calendar" ? "bg-muted" : "bg-background"}`}>Calendar</button>
          </div>
        </div>

        {formOpen ? (
          <div className="mt-4 grid gap-3 rounded-xl border border-border bg-background p-4 md:grid-cols-2">
            {locationStatus === "granted" && patientLocation ? (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-700 md:col-span-2">
                📍 Location detected — showing nearest organizations first
              </div>
            ) : locationStatus === "denied" ? (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-700 md:col-span-2">
                Location access denied — organizations sorted by name. Enable location for nearest-first sorting.
              </div>
            ) : null}
            <select aria-label="Select service" value={serviceId} onChange={(e) => { setServiceId(e.target.value); setFacilityId(""); setSelectedNearbyHospitalId(""); }} className="h-10 rounded-lg border border-border bg-card px-3 text-sm">
              {serviceOptions.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <input
              placeholder="Search organization..."
              value={orgSearch}
              onChange={(e) => setOrgSearch(e.target.value)}
              className="h-10 rounded-lg border border-border bg-card px-3 text-sm"
            />
            <div className="md:col-span-2">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Select organization ({filteredOrgs.length} available{selectedServiceType ? ` for ${selectedServiceType.replace(/_/g, " ")}` : ""})
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {filteredOrgs.length === 0 ? (
                  <p className="col-span-full text-xs text-muted-foreground">No organizations match. Try a different service or clear the search.</p>
                ) : null}
                {filteredOrgs.map((org) => {
                  const dist = patientLocation && org.latitude !== undefined
                    ? toDistanceKm(patientLocation.lat, patientLocation.lon, org.latitude!, org.longitude!)
                    : undefined;
                  const isSelected = (facilityId || filteredOrgs[0]?.id) === org.id;
                  return (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => { setFacilityId(org.id); setSelectedNearbyHospitalId(""); }}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:bg-muted/40"
                      }`}
                    >
                      <p className="text-sm font-medium">{org.name}</p>
                      {org.address ? <p className="mt-0.5 text-[11px] text-muted-foreground">{org.address}</p> : null}
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {dist !== undefined ? (
                          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600">{dist.toFixed(1)} km</span>
                        ) : null}
                        {org.services.slice(0, 2).map((s) => (
                          <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{s}</span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <input aria-label="Select appointment date and time" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="h-10 rounded-lg border border-border bg-card px-3 text-sm" />
            <select aria-label="Select priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="h-10 rounded-lg border border-border bg-card px-3 text-sm">
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="asap">ASAP</option>
            </select>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="h-10 rounded-lg border border-border bg-card px-3 text-sm" />
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="h-10 rounded-lg border border-border bg-card px-3 text-sm" />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes and preparation context" className="rounded-lg border border-border bg-card px-3 py-2 text-sm md:col-span-2" rows={3} />
            <div className="rounded-lg border border-border bg-card p-3 text-sm md:col-span-2">
              <p className="font-medium">Registered organization</p>
              <p className="mt-1 text-xs text-muted-foreground">Selected organization: {selectedFacility?.name ?? "N/A"} | {selectedFacility?.slug ?? "N/A"}</p>
              <p className="mt-1 text-xs text-muted-foreground">Address: {selectedFacility?.address ?? "N/A"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Contact: {selectedFacility?.contactName ?? "N/A"}
                {selectedFacility?.contactPhone ? ` | ${selectedFacility.contactPhone}` : ""}
                {selectedFacility?.contactEmail ? ` | ${selectedFacility.contactEmail}` : ""}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Services: {selectedFacility && selectedFacility.services.length > 0 ? selectedFacility.services.join(", ") : "No services listed yet"}
              </p>
              <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
                {mapEmbedUrl ? (
                  <iframe
                    title="Organization location map"
                    src={mapEmbedUrl}
                    className="h-56 w-full rounded-lg border border-border"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center rounded-lg border border-border bg-background text-xs text-muted-foreground">
                    Organization coordinates are not available yet.
                  </div>
                )}
                <div className="rounded-lg border border-border bg-background p-2">
                  <p className="px-1 text-xs font-medium uppercase text-muted-foreground">Other registered organizations</p>
                  <div className="mt-2 space-y-2">
                    {hospitalOptions.length === 0 ? (
                      <p className="px-1 text-xs text-muted-foreground">No registered organizations were returned by the backend.</p>
                    ) : nearbyHospitals.length === 0 ? (
                      <p className="px-1 text-xs text-muted-foreground">No other registered organizations found.</p>
                    ) : null}
                    {nearbyHospitals.map((hospital) => {
                      const distanceKm =
                        selectedFacility &&
                        selectedFacility.latitude !== undefined &&
                        selectedFacility.longitude !== undefined &&
                        hospital.latitude !== undefined &&
                        hospital.longitude !== undefined
                          ? toDistanceKm(selectedFacility.latitude, selectedFacility.longitude, hospital.latitude, hospital.longitude)
                          : undefined;
                      return (
                        <button
                          key={hospital.id}
                          type="button"
                          onClick={() => {
                            setSelectedNearbyHospitalId(hospital.id);
                            setDescription(`In-person visit near ${hospital.name}`);
                          }}
                          className={`w-full rounded-md border px-2 py-2 text-left hover:bg-muted/40 ${selectedNearbyHospitalId === hospital.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                        >
                          <p className="text-xs font-medium">{hospital.name}</p>
                          <p className="text-[11px] text-muted-foreground">{hospital.slug}</p>
                          {hospital.contactPhone || hospital.contactEmail ? (
                            <p className="text-[11px] text-muted-foreground">{hospital.contactPhone ?? hospital.contactEmail}</p>
                          ) : null}
                          <p className="text-[11px] text-muted-foreground">
                            {distanceKm !== undefined ? `${distanceKm.toFixed(1)} km away` : "Distance unavailable"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              {selectedNearbyHospital ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Preferred organization: {selectedNearbyHospital.name} ({selectedNearbyHospitalDistanceKm?.toFixed(1)} km)
                </p>
              ) : null}
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button onClick={() => setFormOpen(false)} className="rounded-lg border border-border px-3 py-2 text-sm">Cancel</button>
              <button onClick={createAppointment} disabled={saving} className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
                {saving ? "Booking..." : "Confirm + Submit"}
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {([
            ["upcoming", "Upcoming"],
            ["past", "Past"],
            ["cancelled", "Cancelled"],
            ["all", "All"],
            ["calendar", "Calendar"],
          ] as Array<[AppointmentTab, string]>).map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); if (key === "calendar") setView("calendar"); }} className={`rounded-lg px-3 py-1.5 text-sm ${tab === key ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`}>
              {label}
            </button>
          ))}
        </div>

        {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}

        {loading ? <p className="text-sm text-muted-foreground">Loading appointments...</p> : null}

        {!loading && view === "calendar" ? (
          <div className="space-y-3">
            {Object.keys(groupedByDay).length === 0 ? <p className="text-sm text-muted-foreground">No appointments found.</p> : null}
            {Object.entries(groupedByDay).map(([day, dayItems]) => (
              <div key={day} className="rounded-xl border border-border bg-background p-3">
                <p className="mb-2 text-sm font-semibold">{new Date(day).toDateString()}</p>
                <div className="space-y-2">
                  {dayItems.map((item) => (
                    <button key={item.id} onClick={() => setDetails(item)} className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-muted/40">
                      {new Date(item.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {item.description} ({item.facilityName})
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && view === "list" ? (
          <div className="space-y-3">
            {filtered.length === 0 ? <p className="text-sm text-muted-foreground">No appointments found.</p> : null}
            {filtered.map((item) => (
              <article key={item.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.serviceType} | {item.serviceCategory} | {item.priority}</p>
                    <p className="text-xs text-muted-foreground">{new Date(item.start).toLocaleString()} - {new Date(item.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ({item.durationMinutes} min)</p>
                    <p className="text-xs text-muted-foreground">{item.facilityName} | {item.facilityAddress}</p>
                    <p className="text-xs text-muted-foreground">Location: {item.location}</p>
                  </div>
                  <span className="rounded-full border border-border bg-card px-2 py-1 text-xs">{formatAppointmentStatus(item.status)}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => setDetails(item)} className="rounded-lg border border-border px-3 py-1.5 text-xs">View Details</button>
                  <button
                    onClick={() => {
                      setDetails(item);
                      setRescheduleAt(toDateTimeLocalValue(item.start));
                    }}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => updateStatus(item, "cancelled")}
                    disabled={item.status === "cancelled"}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      {details ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Appointment Details</h2>
              <button onClick={() => setDetails(null)} className="rounded-lg border border-border px-3 py-1 text-sm">Close</button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <section className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs uppercase text-muted-foreground">Overview</p>
                <p className="font-medium">{details.description}</p>
                <p className="text-sm text-muted-foreground">Status: {formatAppointmentStatus(details.status)} | Priority: {details.priority}</p>
              </section>
              <section className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs uppercase text-muted-foreground">Time</p>
                <p className="text-sm">Start: {new Date(details.start).toLocaleString()}</p>
                <p className="text-sm">End: {new Date(details.end).toLocaleString()}</p>
                <p className="text-sm">Duration: {details.durationMinutes} min</p>
              </section>
              <section className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs uppercase text-muted-foreground">Service Info</p>
                <p className="text-sm">Category: {details.serviceCategory}</p>
                <p className="text-sm">Type: {details.serviceType}</p>
              </section>
              <section className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs uppercase text-muted-foreground">Location</p>
                <p className="text-sm">{details.facilityName}</p>
                <p className="text-sm text-muted-foreground">{details.facilityAddress}</p>
                <p className="text-sm">Unit: {details.location}</p>
                {details.nearbyHospitalName ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nearby hospital: {details.nearbyHospitalName}
                    {details.nearbyHospitalDistanceKm !== undefined ? ` (${details.nearbyHospitalDistanceKm.toFixed(1)} km)` : ""}
                  </p>
                ) : null}
              </section>
              <section className="rounded-lg border border-border bg-background p-3 md:col-span-2">
                <p className="text-xs uppercase text-muted-foreground">Medical Context and Instructions</p>
                <p className="text-sm">Reason: {details.reason || "Not provided"}</p>
                <p className="text-sm">Notes: {details.notes || "No additional notes"}</p>
                <p className="text-sm text-muted-foreground">Bring ID and arrive 15 minutes before your slot.</p>
              </section>
              <section className="rounded-lg border border-border bg-background p-3 md:col-span-2">
                <p className="text-xs uppercase text-muted-foreground">Reschedule</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    aria-label="Reschedule date and time"
                    type="datetime-local"
                    value={rescheduleAt || toDateTimeLocalValue(details.start)}
                    onChange={(e) => setRescheduleAt(e.target.value)}
                    className="h-10 rounded-lg border border-border bg-card px-3 text-sm"
                  />
                  <button onClick={rescheduleAppointment} className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">
                    Save New Time
                  </button>
                  <button onClick={() => updateStatus(details, "cancelled")} className="rounded-lg border border-border px-3 py-2 text-xs">
                    Cancel Appointment
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}

      {aiModalOpen && (
        <AiBookingModal
          onClose={() => setAiModalOpen(false)}
          onBooked={load}
        />
      )}
    </div>
  );
}
