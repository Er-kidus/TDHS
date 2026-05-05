"use client";

import { useEffect, useMemo, useState } from "react";
import { RESOURCE_POOLS, SERVICE_DEFINITIONS, type AppointmentPriority } from "@/lib/sds";

type AppointmentStatus = "proposed" | "booked" | "arrived" | "in-progress" | "fulfilled" | "cancelled" | "noshow";
type TabValue = "today" | "upcoming" | "in-progress" | "completed" | "cancelled" | "all" | "queue";

type Appointment = {
  id: string;
  patientId: string;
  scheduledAt: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  description?: string;
  serviceType?: string;
  serviceCategory?: string;
  facilityId?: string;
  facilityName?: string;
  facilityAddress?: string;
  nearbyHospitalName?: string;
  nearbyHospitalDistanceKm?: number;
  location?: string;
  priority?: AppointmentPriority;
  assignedStaffType?: string;
  assignedRoom?: string;
  assignedEquipment?: string;
};

type ServiceOption = {
  id: string;
  name: string;
  serviceType: string;
  serviceCategory: string;
};

type ResourceOption = {
  id: string;
  type: "staff" | "room" | "equipment";
  category: string;
  label: string;
  status: string;
};

type QueueEntry = {
  queue_id: string;
  service_type: string;
  facility?: string;
  appointment_id: string;
  position: number;
  status: string;
  estimated_wait_minutes: number;
};

function normalizeAppointment(item: unknown): Appointment | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  if (typeof row.id !== "string") return null;
  return {
    id: row.id,
    patientId: typeof row.patient_id === "string" ? row.patient_id : "",
    scheduledAt: typeof row.scheduled_at === "string" ? row.scheduled_at : new Date().toISOString(),
    status: (typeof row.status === "string" ? row.status : "booked") as AppointmentStatus,
    reason: typeof row.reason === "string" ? row.reason : undefined,
    notes: typeof row.notes === "string" ? row.notes : undefined,
    description: typeof row.description === "string" ? row.description : undefined,
    serviceType: typeof row.serviceType === "string" ? row.serviceType : undefined,
    serviceCategory: typeof row.serviceCategory === "string" ? row.serviceCategory : undefined,
    facilityId: typeof row.facilityId === "string" ? row.facilityId : undefined,
    facilityName: typeof row.facilityName === "string" ? row.facilityName : undefined,
    facilityAddress: typeof row.facilityAddress === "string" ? row.facilityAddress : undefined,
    nearbyHospitalName: typeof row.nearbyHospitalName === "string" ? row.nearbyHospitalName : undefined,
    nearbyHospitalDistanceKm: typeof row.nearbyHospitalDistanceKm === "number" ? row.nearbyHospitalDistanceKm : undefined,
    location: typeof row.location === "string" ? row.location : undefined,
    priority: (typeof row.priority === "string" ? row.priority : "routine") as AppointmentPriority,
    assignedStaffType: typeof row.assignedStaffType === "string" ? row.assignedStaffType : undefined,
    assignedRoom: typeof row.assignedRoom === "string" ? row.assignedRoom : undefined,
    assignedEquipment: typeof row.assignedEquipment === "string" ? row.assignedEquipment : undefined,
  };
}

function getBestResources(serviceType: string | undefined, services: ServiceOption[], resources: ResourceOption[]) {
  const service = services.find((item) => item.serviceType === serviceType);
  if (!service) return { staff: "", room: "", equipment: "" };

  const fallbackService = SERVICE_DEFINITIONS.find((item) => item.serviceType === serviceType);
  const staffType = fallbackService?.requiredStaffTypes[0]?.type;
  const roomType = fallbackService?.requiredRooms[0]?.type;
  const equipmentType = fallbackService?.requiredEquipment[0]?.type;

  return {
    staff: resources.find((item) => item.type === "staff" && item.category === staffType && item.status === "available")?.label || "",
    room: resources.find((item) => item.type === "room" && item.category === roomType && item.status === "available")?.label || "",
    equipment: resources.find((item) => item.type === "equipment" && item.category === equipmentType && item.status === "available")?.label || "",
  };
}

export default function AppointmentsPage() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<TabValue>("today");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>("all");
  const [facilityFilter, setFacilityFilter] = useState<string>("all");

  const [patientId, setPatientId] = useState("");
  const [scheduledAt, setScheduledAt] = useState(new Date(Date.now() + 3600000).toISOString().slice(0, 16));
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [serviceId, setServiceId] = useState(SERVICE_DEFINITIONS[0]?.id || "");
  const [priority, setPriority] = useState<AppointmentPriority>("routine");
  const [facility, setFacility] = useState("Default Organization Main Clinic");

  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>(
    SERVICE_DEFINITIONS.map((item) => ({
      id: item.id,
      name: item.name,
      serviceType: item.serviceType,
      serviceCategory: item.serviceCategory,
    }))
  );
  const [resourceOptions, setResourceOptions] = useState<ResourceOption[]>(RESOURCE_POOLS);
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [queueDate, setQueueDate] = useState(new Date().toISOString().slice(0, 10));

  const [details, setDetails] = useState<Appointment | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/appointments?limit=100");
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Failed to load appointments");
      }
      const payload: unknown = await res.json();
      const normalized = Array.isArray(payload)
        ? payload.map((item) => normalizeAppointment(item)).filter((item): item is Appointment => Boolean(item))
        : [];
      setItems(normalized);

      const [servicesRes, resourcesRes, queuesRes] = await Promise.all([
        fetch("/api/org/services"),
        fetch("/api/org/resources"),
        fetch("/api/org/queues"),
      ]);

      if (servicesRes.ok) {
        const servicesPayload: unknown = await servicesRes.json();
        if (Array.isArray(servicesPayload)) {
          const nextServices = servicesPayload
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
              } as ServiceOption;
            })
            .filter((item): item is ServiceOption => Boolean(item));
          if (nextServices.length > 0) {
            setServiceOptions(nextServices);
            setServiceId(nextServices[0].id);
          }
        }
      }

      if (resourcesRes.ok) {
        const resourcesPayload: unknown = await resourcesRes.json();
        if (Array.isArray(resourcesPayload)) {
          const nextResources = resourcesPayload
            .map((item) => {
              const row = item as Record<string, unknown>;
              if (typeof row.id !== "string" || typeof row.type !== "string" || typeof row.category !== "string") return null;
              return {
                id: row.id,
                type: row.type as "staff" | "room" | "equipment",
                category: row.category,
                label: typeof row.label === "string" ? row.label : row.id,
                status: typeof row.status === "string" ? row.status : "available",
              } as ResourceOption;
            })
            .filter((item): item is ResourceOption => Boolean(item));
          if (nextResources.length > 0) {
            setResourceOptions(nextResources);
          }
        }
      }

      if (queuesRes.ok) {
        const queuesPayload: unknown = await queuesRes.json();
        if (Array.isArray(queuesPayload)) {
          setQueueEntries(queuesPayload as QueueEntry[]);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createAppointment() {
    if (!patientId.trim()) {
      setError("Patient ID is required");
      return;
    }

    const selectedService =
      serviceOptions.find((item) => item.id === serviceId) ??
      serviceOptions[0] ?? {
        id: "general-consultation",
        name: "General Consultation",
        serviceType: "general_consultation",
        serviceCategory: "consultation",
      };

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          scheduledAt: new Date(scheduledAt).toISOString(),
          reason: reason || undefined,
          notes: notes || undefined,
          serviceType: selectedService.serviceType,
          serviceCategory: selectedService.serviceCategory,
          facilityName: facility,
          location: facility,
          priority,
          appointmentType: "in-person",
          status: "booked",
        }),
      });
      if (!res.ok) throw new Error("Failed to create appointment");
      setReason("");
      setNotes("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create appointment");
    } finally {
      setSaving(false);
    }
  }

  async function patchAppointment(id: string, patch: Record<string, unknown>) {
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Failed to update appointment");
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update appointment");
    }
  }

  async function assignResources(a: Appointment) {
    const resources = getBestResources(a.serviceType, serviceOptions, resourceOptions);
    setError(null);
    try {
      const res = await fetch(`/api/org/appointments/${a.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedStaffType: resources.staff || undefined,
          assignedRoom: resources.room || undefined,
          assignedEquipment: resources.equipment || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to assign resources");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to assign resources");
    }
  }

  async function receptionistCheckIn(a: Appointment) {
    setError(null);
    try {
      const res = await fetch("/api/org/queues/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: a.id }),
      });
      if (!res.ok) throw new Error("Failed queue check-in");
      await patchAppointment(a.id, { status: "arrived" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed queue check-in");
    }
  }

  const filteredItems = useMemo(() => {
    const now = Date.now();
    return items.filter((item) => {
      const ts = new Date(item.scheduledAt).getTime();
      const isToday = new Date(item.scheduledAt).toDateString() === new Date().toDateString();
      if (tab === "today" && !isToday) return false;
      if (tab === "upcoming" && ts < now) return false;
      if (tab === "in-progress" && item.status !== "in-progress") return false;
      if (tab === "completed" && item.status !== "fulfilled") return false;
      if (tab === "cancelled" && item.status !== "cancelled") return false;
      if (tab === "queue" && !["booked", "arrived", "in-progress"].includes(item.status)) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (serviceCategoryFilter !== "all" && item.serviceCategory !== serviceCategoryFilter) return false;
      if (facilityFilter !== "all" && item.facilityName !== facilityFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${item.id} ${item.patientId} ${item.reason || ""} ${item.serviceType || ""} ${item.facilityName || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, tab, statusFilter, serviceCategoryFilter, facilityFilter, search]);

  const queueItemsForDate = useMemo(() => {
    const fromQueue =
      queueEntries.length > 0
        ? queueEntries
            .map((entry) => ({ entry, appointment: items.find((item) => item.id === entry.appointment_id) }))
            .filter((row) => row.appointment)
            .sort((a, b) => a.entry.position - b.entry.position)
            .map((row) => row.appointment as Appointment)
        : filteredItems
            .filter((item) => ["booked", "arrived", "in-progress"].includes(item.status))
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    return fromQueue.filter((appointment) => appointment.scheduledAt.startsWith(queueDate));
  }, [queueDate, queueEntries, items, filteredItems]);

  async function callNextFromQueue() {
    const rows = queueEntries
      .map((entry) => ({ entry, appointment: items.find((item) => item.id === entry.appointment_id) }))
      .filter((row) => row.appointment)
      .filter((row) => row.appointment!.scheduledAt.startsWith(queueDate))
      .filter((row) => row.entry.status === "waiting")
      .sort((a, b) => a.entry.position - b.entry.position);

    const next = rows.find((row) => {
      const status = row.appointment!.status;
      return status !== "fulfilled" && status !== "cancelled" && status !== "noshow";
    });

    if (!next || !next.appointment) {
      setError("No waiting patient found for the selected queue date");
      return;
    }

    if (next.appointment.status === "booked") {
      await receptionistCheckIn(next.appointment);
    }

    await patchAppointment(next.appointment.id, { status: "in-progress" });
  }

  const facilities = Array.from(new Set(items.map((item) => item.facilityName).filter(Boolean))) as string[];
  const categories = Array.from(new Set(serviceOptions.map((item) => item.serviceCategory)));

  return (
    <div className="mx-auto max-w-screen-2xl space-y-5">
      <header className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
        <p className="mt-1 text-sm text-muted-foreground">Reception queue control, check-in flow, and appointment operations.</p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, service, appointment ID"
            className="md:col-span-2 h-10 rounded-lg border border-border bg-background px-3 text-sm"
          />
          <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
            <option value="all">All Status</option>
            <option value="proposed">proposed</option>
            <option value="booked">booked</option>
            <option value="arrived">arrived</option>
            <option value="in-progress">in-progress</option>
            <option value="fulfilled">fulfilled</option>
            <option value="cancelled">cancelled</option>
            <option value="noshow">noshow</option>
          </select>
          <select aria-label="Filter by service category" value={serviceCategoryFilter} onChange={(e) => setServiceCategoryFilter(e.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
            <option value="all">All Service Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select aria-label="Filter by facility" value={facilityFilter} onChange={(e) => setFacilityFilter(e.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
            <option value="all">All Facilities</option>
            {facilities.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {(["today", "upcoming", "in-progress", "completed", "cancelled", "all", "queue"] as TabValue[]).map((entry) => (
              <button key={entry} type="button" onClick={() => setTab(entry)} className={`rounded-lg px-3 py-1.5 text-xs ${tab === entry ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`}>
                {entry}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h2 className="text-sm font-semibold">Create Appointment</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-6">
          <input value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="Patient ID" className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
          <input aria-label="Scheduled date and time" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
          <select aria-label="Select service" value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
            {serviceOptions.map((svc) => <option key={svc.id} value={svc.id}>{svc.name}</option>)}
          </select>
          <input value={facility} onChange={(e) => setFacility(e.target.value)} placeholder="Facility" className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
          <select aria-label="Select priority" value={priority} onChange={(e) => setPriority(e.target.value as AppointmentPriority)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
            <option value="routine">routine</option>
            <option value="urgent">urgent</option>
            <option value="asap">asap</option>
          </select>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="md:col-span-5 rounded-lg border border-border bg-background px-3 py-2 text-sm" rows={3} />
          <button type="button" onClick={createAppointment} disabled={saving} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Appointments</h2>
          <div className="flex items-center gap-2">
            {tab === "queue" ? (
              <>
                <input
                  aria-label="Queue date"
                  type="date"
                  value={queueDate}
                  onChange={(e) => setQueueDate(e.target.value)}
                  className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
                />
                <button onClick={callNextFromQueue} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                  Call Next
                </button>
              </>
            ) : null}
            <button onClick={load} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium">Refresh</button>
          </div>
        </div>

        {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading appointments...</p>
        ) : tab === "queue" ? (
          <div className="space-y-2">
            {queueItemsForDate.map((a, index) => (
              <article key={a.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">Queue #{index + 1} - {a.description || a.reason || "Appointment"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Patient: {a.patientId} | Service: {a.serviceType || "unknown"} | Priority: {a.priority || "routine"}</p>
                    <p className="text-xs text-muted-foreground">Date: {new Date(a.scheduledAt).toLocaleString()} | Facility: {a.facilityName || "-"}</p>
                  </div>
                  <span className="rounded-full border border-border bg-card px-2 py-1 text-xs">{a.status}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => setDetails(a)} className="rounded-lg border border-border px-3 py-1.5 text-xs">View Details</button>
                  <button onClick={() => receptionistCheckIn(a)} className="rounded-lg border border-border px-3 py-1.5 text-xs">Reception Check-in</button>
                  <button onClick={() => patchAppointment(a.id, { status: "in-progress" })} className="rounded-lg border border-border px-3 py-1.5 text-xs">Start Service</button>
                  <button onClick={() => assignResources(a)} className="rounded-lg border border-border px-3 py-1.5 text-xs">Assign Resource</button>
                </div>
              </article>
            ))}
            {queueItemsForDate.length === 0 ? <p className="text-sm text-muted-foreground">No queue entries for the selected date.</p> : null}
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No appointments found.</p>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((a) => (
              <article key={a.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{a.description || a.reason || "Appointment"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Patient: {a.patientId} | {new Date(a.scheduledAt).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{a.serviceType || "service"} | {a.serviceCategory || "category"} | {a.facilityName || "facility"}</p>
                    <p className="text-xs text-muted-foreground">Assigned: {a.assignedStaffType || "-"} | {a.assignedRoom || "-"} | {a.assignedEquipment || "-"}</p>
                  </div>
                  <span className="rounded-full border border-border bg-card px-2 py-1 text-xs">{a.status}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => setDetails(a)} className="rounded-lg border border-border px-3 py-1.5 text-xs">View Details</button>
                  <button onClick={() => assignResources(a)} className="rounded-lg border border-border px-3 py-1.5 text-xs">Assign Resource</button>
                  <button onClick={() => patchAppointment(a.id, { status: "in-progress" })} className="rounded-lg border border-border px-3 py-1.5 text-xs">Start Service</button>
                  <button onClick={() => patchAppointment(a.id, { status: "fulfilled" })} className="rounded-lg border border-border px-3 py-1.5 text-xs">Complete</button>
                  <button onClick={() => patchAppointment(a.id, { status: "cancelled" })} className="rounded-lg border border-border px-3 py-1.5 text-xs">Cancel</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {details ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Appointment Details</h2>
              <button onClick={() => setDetails(null)} className="rounded-lg border border-border px-3 py-1 text-sm">Close</button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <section className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs uppercase text-muted-foreground">Overview</p>
                <p className="font-medium">{details.description || details.reason || "Appointment"}</p>
                <p className="text-sm text-muted-foreground">Status: {details.status} | Priority: {details.priority || "routine"}</p>
              </section>
              <section className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs uppercase text-muted-foreground">Time</p>
                <p className="text-sm">Start: {new Date(details.scheduledAt).toLocaleString()}</p>
              </section>
              <section className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs uppercase text-muted-foreground">Service Info</p>
                <p className="text-sm">Category: {details.serviceCategory || "-"}</p>
                <p className="text-sm">Type: {details.serviceType || "-"}</p>
              </section>
              <section className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs uppercase text-muted-foreground">Location</p>
                <p className="text-sm">{details.facilityName || "-"}</p>
                <p className="text-sm text-muted-foreground">{details.facilityAddress || "-"}</p>
                <p className="text-sm">Unit: {details.location || "-"}</p>
                {details.nearbyHospitalName ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nearby hospital: {details.nearbyHospitalName}
                    {details.nearbyHospitalDistanceKm !== undefined ? ` (${details.nearbyHospitalDistanceKm.toFixed(1)} km)` : ""}
                  </p>
                ) : null}
              </section>
              <section className="rounded-lg border border-border bg-background p-3 md:col-span-2">
                <p className="text-xs uppercase text-muted-foreground">Medical Context</p>
                <p className="text-sm">Reason: {details.reason || "Not provided"}</p>
                <p className="text-sm">Notes: {details.notes || "No additional notes"}</p>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
