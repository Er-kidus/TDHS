import { NextResponse } from "next/server";
import { BackendRequestError, backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

type OrgContext = {
  organization_id?: string;
  organization_name?: string;
  name?: string;
};

async function getOrgContext(auth: Record<string, string>): Promise<OrgContext> {
  if (!auth.Authorization) return {};
  const upstream = await backendFetch("/org/me", { method: "GET", headers: { ...auth } });
  return (await upstream.json().catch(() => ({}))) as OrgContext;
}

function getString(row: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function filterAppointmentsByOrg(payload: unknown, organizationId?: string) {
  if (!organizationId || !Array.isArray(payload)) return payload;
  const orgId = organizationId.trim().toLowerCase();
  return payload.filter((item) => {
    if (!item || typeof item !== "object") return false;
    const row = item as Record<string, unknown>;
    const facilityId = getString(row, "facilityId", "facility_id").toLowerCase();
    const nearbyHospitalId = getString(row, "nearbyHospitalId", "nearby_hospital_id").toLowerCase();
    return facilityId === orgId || nearbyHospitalId === orgId;
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ?? "50";

    const auth = await orgAuthHeaderFromCookie();
    const org: OrgContext = await getOrgContext(auth).catch(() => ({}));
    const upstream = await backendFetch(`/appointments?limit=${encodeURIComponent(limit)}`, {
      method: "GET",
      headers: { ...auth },
    });

    const text = await upstream.text();
    let payload: unknown = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }

    return NextResponse.json(filterAppointmentsByOrg(payload, org.organization_id), { status: upstream.status });
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to load appointments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => ({}));
    const bodyObj = (body && typeof body === "object" ? (body as Record<string, unknown>) : {}) as Record<
      string,
      unknown
    >;
    const patientId = typeof bodyObj.patientId === "string" ? bodyObj.patientId : undefined;
    const { patientId: _patientId, ...rest } = bodyObj;
    void _patientId;

    const auth = await orgAuthHeaderFromCookie();
    const org: OrgContext = await getOrgContext(auth).catch(() => ({}));
    if (org.organization_id && typeof rest.facilityId !== "string" && typeof rest.facility_id !== "string") {
      rest.facilityId = org.organization_id;
    }
    if ((org.organization_name || org.name) && typeof rest.facilityName !== "string" && typeof rest.facility_name !== "string") {
      rest.facilityName = org.organization_name || org.name;
    }
    const qs = patientId ? `?patientId=${encodeURIComponent(patientId)}` : "";

    const upstream = await backendFetch(`/appointments${qs}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...auth },
      body: JSON.stringify(rest),
    });

    const text = await upstream.text();
    let payload: unknown = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }

    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to create appointment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
