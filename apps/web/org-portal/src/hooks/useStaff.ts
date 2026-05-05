// hooks/useStaff.ts
// Custom React hook for staff management with proper error handling

import { useEffect, useState, useCallback } from "react";
import { staffService, type StaffMember, type StaffTemplate, type CreateStaffPayload } from "@/services/staff.service";

interface UseStaffOptions {
  autoLoad?: boolean;
  limit?: number;
}

interface UseStaffReturn {
  // State
  loading: boolean;
  error: string | null;
  success: string | null;
  organizationId: string;
  staff: StaffMember[];
  templates: StaffTemplate[];
  isSubmitting: boolean;

  // Methods
  loadData: () => Promise<void>;
  createStaff: (payload: CreateStaffPayload) => Promise<StaffMember>;
  updateStaff: (staffId: string, updates: Partial<CreateStaffPayload>) => Promise<void>;
  deleteStaff: (staffId: string) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
}

export function useStaff(options: UseStaffOptions = {}): UseStaffReturn {
  const { autoLoad = true, limit = 500 } = options;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState("");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [templates, setTemplates] = useState<StaffTemplate[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(null), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { organization_id } = await staffService.getOrganizationContext();
      setOrganizationId(organization_id);

      const [staffList, templateList] = await Promise.all([
        staffService.getStaff(organization_id, limit),
        staffService.getAvailableTemplates(),
      ]);

      setStaff(staffList);
      setTemplates(templateList);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load staff data";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const createStaff = useCallback(
    async (payload: CreateStaffPayload): Promise<StaffMember> => {
      if (!organizationId) throw new Error("Organization context not loaded");

      setIsSubmitting(true);
      setError(null);

      try {
        const result = await staffService.createStaff(organizationId, payload);
        setSuccess("Staff member added successfully");
        setStaff((prev) => [...prev, result]);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create staff member";
        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [organizationId]
  );

  const updateStaff = useCallback(
    async (staffId: string, updates: Partial<CreateStaffPayload>): Promise<void> => {
      if (!organizationId) throw new Error("Organization context not loaded");

      setIsSubmitting(true);
      setError(null);

      try {
        await staffService.updateStaff(organizationId, staffId, updates);
        setSuccess("Staff member updated successfully");

        // Update local state
        setStaff((prev) =>
          prev.map((s) =>
            s.id === staffId
              ? { ...s, ...updates }
              : s
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update staff member";
        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [organizationId]
  );

  const deleteStaff = useCallback(
    async (staffId: string): Promise<void> => {
      if (!organizationId) throw new Error("Organization context not loaded");

      setIsSubmitting(true);
      setError(null);

      try {
        await staffService.deleteStaff(organizationId, staffId);
        setSuccess("Staff member removed");

        // Update local state
        setStaff((prev) => prev.filter((s) => s.id !== staffId));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete staff member";
        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [organizationId]
  );

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      void loadData();
    }
  }, [autoLoad, loadData]);

  return {
    loading,
    error,
    success,
    organizationId,
    staff,
    templates,
    isSubmitting,
    loadData,
    createStaff,
    updateStaff,
    deleteStaff,
    clearError,
    clearSuccess,
  };
}

export default useStaff;
