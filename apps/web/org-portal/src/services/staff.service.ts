// services/staff.service.ts
// Staff management API service with proper payload handling

export interface StaffMember {
  id: string;
  user_id?: string;
  organization_id?: string;
  full_name: string;
  email: string;
  role: string;
  staff_template_key?: string;
  staff_template_title?: string;
  professional_title?: string;
  license_number?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StaffTemplate {
  template_key: string;
  title: string;
  role_group: string;
  category: string;
  api_role: string;
  active?: boolean;
  description?: string;
  min_staff_required?: number;
}

export interface CreateStaffPayload {
  email: string;
  full_name: string;
  password?: string;
  staff_template_key: string;
  professional_title: string;
  license_number: string;
  role: string;
  active?: boolean;
}

export interface UpdateStaffPayload {
  professional_title?: string;
  license_number?: string;
  active?: boolean;
}

class StaffService {
  private baseUrl = "/api/org";

  private generateTempPassword(): string {
    const random = Math.random().toString(36).slice(2, 10);
    const timestamp = Date.now().toString(36).slice(-4);
    return `Temp#${random}${timestamp}A1`;
  }

  /**
   * Get current organization context
   */
  async getOrganizationContext(): Promise<{ organization_id: string }> {
    const res = await fetch(`${this.baseUrl}/me`);
    if (!res.ok) throw new Error("Failed to load organization context");
    return res.json();
  }

  /**
   * Get all staff members for an organization
   */
  async getStaff(organizationId: string, limit = 500): Promise<StaffMember[]> {
    const res = await fetch(
      `${this.baseUrl}/organizations/${encodeURIComponent(organizationId)}/staff?limit=${limit}`
    );
    if (!res.ok) throw new Error("Failed to load staff");
    
    const data = await res.json();
    return Array.isArray(data) ? data : data.data || [];
  }

  /**
   * Get a single staff member
   */
  async getStaffMember(organizationId: string, staffId: string): Promise<StaffMember> {
    const res = await fetch(
      `${this.baseUrl}/organizations/${encodeURIComponent(organizationId)}/staff/${encodeURIComponent(staffId)}`
    );
    if (!res.ok) throw new Error("Failed to load staff member");
    return res.json();
  }

  /**
   * Create a new staff member
   * 
   * IMPORTANT: Use this exact payload structure:
   * {
   *   email: string,
   *   full_name: string,
   *   staff_template_key: string,
   *   professional_title: string,
   *   license_number: string,
   *   role: string,
   *   active: boolean
   * }
   */
  async createStaff(organizationId: string, payload: CreateStaffPayload): Promise<StaffMember> {
    // Validate payload
    if (!payload.email || !payload.full_name || !payload.staff_template_key) {
      throw new Error("Missing required fields: email, full_name, staff_template_key");
    }

    // Org staff creation endpoint does not accept `active` in request JSON.
    // New staff are created active by default on the backend.
    const finalPayload = {
      email: payload.email,
      full_name: payload.full_name,
      staff_template_key: payload.staff_template_key,
      professional_title: payload.professional_title,
      license_number: payload.license_number,
      role: payload.role,
      password: payload.password?.trim() || this.generateTempPassword(),
    };

    // Send properly formatted payload
    const res = await fetch(
      `${this.baseUrl}/organizations/${encodeURIComponent(organizationId)}/staff`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      }
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({} as { message?: string; error?: string }));
      throw new Error(error.message || error.error || `Failed to create staff: ${res.status}`);
    }

    return res.json();
  }

  /**
   * Update a staff member
   */
  async updateStaff(
    organizationId: string,
    staffId: string,
    payload: UpdateStaffPayload
  ): Promise<void> {
    const res = await fetch(
      `${this.baseUrl}/organizations/${encodeURIComponent(organizationId)}/staff/${encodeURIComponent(staffId)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update staff");
    }
  }

  /**
   * Delete (deactivate) a staff member
   */
  async deleteStaff(organizationId: string, staffId: string): Promise<void> {
    const res = await fetch(
      `${this.baseUrl}/organizations/${encodeURIComponent(organizationId)}/staff/${encodeURIComponent(staffId)}`,
      { method: "DELETE" }
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete staff");
    }
  }

  /**
   * Get available staff templates for organization
   */
  async getAvailableTemplates(): Promise<StaffTemplate[]> {
    const res = await fetch(`${this.baseUrl}/staff-role-templates`);
    if (!res.ok) throw new Error("Failed to load staff templates");
    
    const data = await res.json();
    return Array.isArray(data) ? data : data.data || [];
  }

  /**
   * Get staff templates available for organization tier
   */
  async getTemplatesForTier(organizationId: string): Promise<StaffTemplate[]> {
    const res = await fetch(
      `${this.baseUrl}/organizations/${encodeURIComponent(organizationId)}/staff-templates/available`
    );
    if (!res.ok) throw new Error("Failed to load available templates for tier");
    
    const data = await res.json();
    return Array.isArray(data) ? data : data.data || [];
  }
}

export const staffService = new StaffService();
