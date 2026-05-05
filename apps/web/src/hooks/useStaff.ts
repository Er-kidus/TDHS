// useStaff Hook
// React custom hook for staff management state and operations

import { useState, useCallback } from "react";
import staffService, {
  StaffProfile,
  StaffAssignmentRequest,
} from "@/services/staff.service";

export interface UseStaffState {
  staff: StaffProfile[];
  loading: boolean;
  error: string | null;
  availableRoles: string[];
}

export interface UseStaffActions {
  fetchStaff: (orgId: string) => Promise<void>;
  createStaff: (orgId: string, data: StaffAssignmentRequest) => Promise<void>;
  updateStaff: (orgId: string, staffId: string, data: Partial<StaffProfile>) => Promise<void>;
  deleteStaff: (orgId: string, staffId: string) => Promise<void>;
  clearError: () => void;
}

export function useStaff(): UseStaffState & UseStaffActions {
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  const fetchStaff = useCallback(async (orgId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await staffService.getStaff(orgId);
      setStaff(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch staff";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createStaff = useCallback(
    async (orgId: string, data: StaffAssignmentRequest) => {
      setLoading(true);
      setError(null);
      try {
        const newStaff = await staffService.createStaff(orgId, data);
        setStaff((prev) => [...prev, newStaff]);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to create staff";
        setError(errorMsg);

        // Extract available roles from error for better UX
        const roles = staffService.extractAvailableRoles(err);
        if (roles.length > 0) {
          setAvailableRoles(roles);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateStaff = useCallback(
    async (orgId: string, staffId: string, data: Partial<StaffProfile>) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await staffService.updateStaff(orgId, staffId, data);
        setStaff((prev) =>
          prev.map((s) => (s.id === staffId ? updated : s))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update staff";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteStaff = useCallback(
    async (orgId: string, staffId: string) => {
      setLoading(true);
      setError(null);
      try {
        await staffService.deleteStaff(orgId, staffId);
        setStaff((prev) => prev.filter((s) => s.id !== staffId));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete staff";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    staff,
    loading,
    error,
    availableRoles,
    fetchStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    clearError,
  };
}
