// Staff Management API Service
// Type-safe API layer for staff management operations

import { API_BASE_URL } from "@/config";

export interface StaffAssignmentRequest {
  email: string;
  full_name: string;
  staff_template_key: string;
  professional_title?: string;
  license_number?: string;
  role?: string; // Optional - will be auto-mapped from template if not provided
  active?: boolean;
}

export interface StaffProfile {
  id: string;
  organization_id: string;
  user_id: string;
  email: string;
  full_name: string;
  staff_template_key: string;
  staff_template_title?: string;
  role: string;
  professional_title: string;
  license_number: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffApiResponse<T = any> {
  status?: string;
  message?: string;
  data?: T;
  available_roles?: string[];
  error?: string;
}

export interface StaffApiError {
  error: string;
  message: string;
  available_roles?: string[];
  staff_template?: string;
  details?: any;
}

class StaffService {
  private baseUrl = `${API_BASE_URL}/api/org/organizations`;

  /**
   * Create a new staff member assignment
   * @param organizationId - Organization ID
   * @param data - Staff assignment request data
   * @throws Error with helpful messages including available roles
   */
  async createStaff(
    organizationId: string,
    data: StaffAssignmentRequest
  ): Promise<StaffProfile> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${organizationId}/staff`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData: StaffApiError = await response.json();

        // Format helpful error message with available roles
        let errorMessage = errorData.message || "Failed to create staff member";

        if (errorData.available_roles && errorData.available_roles.length > 0) {
          errorMessage += `\n\nAvailable roles:\n${errorData.available_roles.join(", ")}`;
        }

        if (errorData.staff_template) {
          errorMessage = `Template: ${errorData.staff_template}\n${errorMessage}`;
        }

        const error = new Error(errorMessage);
        (error as any).statusCode = response.status;
        (error as any).availableRoles = errorData.available_roles;
        throw error;
      }

      const result: StaffApiResponse = await response.json();
      return result.data || result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error creating staff member");
    }
  }

  /**
   * Get all staff members for an organization
   */
  async getStaff(organizationId: string): Promise<StaffProfile[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${organizationId}/staff`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch staff: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Network error fetching staff");
    }
  }

  /**
   * Get a specific staff member
   */
  async getStaffMember(
    organizationId: string,
    staffId: string
  ): Promise<StaffProfile> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${organizationId}/staff/${staffId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch staff member: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Network error fetching staff member");
    }
  }

  /**
   * Update a staff member
   */
  async updateStaff(
    organizationId: string,
    staffId: string,
    data: Partial<StaffProfile>
  ): Promise<StaffProfile> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${organizationId}/staff/${staffId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update staff: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Network error updating staff");
    }
  }

  /**
   * Delete (deactivate) a staff member
   */
  async deleteStaff(organizationId: string, staffId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${organizationId}/staff/${staffId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete staff: ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Network error deleting staff");
    }
  }

  /**
   * Parse role error and extract available roles
   */
  static extractAvailableRoles(error: any): string[] {
    if (error.availableRoles && Array.isArray(error.availableRoles)) {
      return error.availableRoles;
    }
    return [];
  }

  /**
   * Check if error is a role validation error
   */
  static isRoleError(error: any): boolean {
    return (
      error &&
      error.message &&
      (error.message.includes("role") ||
        error.message.includes("unsupported"))
    );
  }
}

export default new StaffService();
