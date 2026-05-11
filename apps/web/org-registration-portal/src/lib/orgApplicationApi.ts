export type OrgApplication = {
  id: string;
  organization_name: string;
  organization_slug: string;
  organization_domain?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  license_number: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  requested_services: string[];
  configured_services: string[];
  selected_staff_templates: string[];
  update_requested_services?: string[];
  update_request_notes?: string;
  update_request_status?: string;
  last_update_request_at?: string | null;
  domain_configured_at?: string | null;
  status: string;
  approved_by?: string;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type PendingSubmissionSnapshot = {
  id?: string;
  organizationName: string;
  organizationSlug: string;
  contactEmail: string;
  status: string;
  requestedServices: string[];
};

export type OrgConfiguration = {
  organization_id: string;
  organization_name: string;
  organization_slug: string;
  tier: string;
  enabled_services: string[];
};

export type OrgServiceManagementConfiguration = {
  organization_id: string;
  organization_name: string;
  organization_slug: string;
  tier: string;
  installed_services: string[];
};

export type OrgProfile = {
  id: string;
  role: string;
  type: string;
  email?: string;
  organization_id?: string;
};

const AUTH_TOKEN_KEY = "org-registration-auth-token";
const SHARED_AUTH_KEY = "tenadam_auth";
export const LAST_SUBMISSION_KEY = "org-registration-last-submission";

export function getOrgAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  const dedicatedToken = window.localStorage.getItem(AUTH_TOKEN_KEY);
  if (dedicatedToken) {
    console.info("[Auth] Restored actor token on refresh", {
      actor: "org-registration",
      source: "dedicated",
      token: dedicatedToken,
    });
    return dedicatedToken;
  }

  const sharedAuth = window.localStorage.getItem(SHARED_AUTH_KEY);
  if (!sharedAuth) return null;

  try {
    const parsed = JSON.parse(sharedAuth) as { token?: string };
    if (parsed?.token) {
      console.info("[Auth] Restored actor token on refresh", {
        actor: "org-registration",
        source: "shared",
        token: parsed.token,
      });
      return parsed.token;
    }
    return null;
  } catch {
    return null;
  }
}

export function setOrgAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  console.info("[Auth] Logged in actor token", {
    actor: "org-registration",
    token,
  });
}

export function clearOrgAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function setLastSubmission(snapshot: PendingSubmissionSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_SUBMISSION_KEY, JSON.stringify(snapshot));
}

export function getLastSubmission(): PendingSubmissionSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LAST_SUBMISSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingSubmissionSnapshot;
  } catch {
    return null;
  }
}

async function parseJson(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function getOrgProfile(): Promise<OrgProfile> {
  const token = getOrgAuthToken();
  if (!token) {
    throw new Error("Sign in to load profile.");
  }

  const response = await fetch("/org/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await parseJson(response);
  if (!response.ok) {
    throw new Error(body?.error || `Failed to load profile (${response.status})`);
  }

  return body as OrgProfile;
}

export async function getMyApplication(): Promise<OrgApplication | null> {
  const token = getOrgAuthToken();
  if (!token) {
    throw new Error("Sign in to load organization application details.");
  }

  const response = await fetch("/org/application/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await parseJson(response);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(body?.error || `Failed to load application (${response.status})`);
  }

  return body as OrgApplication;
}

export async function getMyOrganizationConfiguration(): Promise<OrgConfiguration | null> {
  const token = getOrgAuthToken();
  if (!token) {
    throw new Error("Sign in to load organization configuration.");
  }

  const response = await fetch("/org/configuration/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await parseJson(response);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(body?.error || `Failed to load organization configuration (${response.status})`);
  }

  return body as OrgConfiguration;
}

export async function getMyServiceManagementConfiguration(): Promise<OrgServiceManagementConfiguration | null> {
  const token = getOrgAuthToken();
  if (!token) {
    throw new Error("Sign in to load service management configuration.");
  }

  const response = await fetch("/org/service-management/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await parseJson(response);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(body?.error || `Failed to load service management configuration (${response.status})`);
  }

  return body as OrgServiceManagementConfiguration;
}

export async function requestApplicationUpdate(applicationId: string, services: string[], notes: string) {
  const token = getOrgAuthToken();
  if (!token) {
    throw new Error("Sign in to request updates.");
  }

  const response = await fetch(`/org/applications/${encodeURIComponent(applicationId)}/request-update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ services, notes }),
  });

  const body = await parseJson(response);
  if (!response.ok) {
    throw new Error(body?.error || `Failed to submit update request (${response.status})`);
  }

  return body as OrgApplication;
}
