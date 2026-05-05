// app/(app)/dashboard/staff-management-simple/page.tsx
// Simplified staff management page using reusable components

"use client";

import React, { useEffect } from "react";
import useStaff from "@/hooks/useStaff";
import { StaffForm } from "@/components/staff/StaffForm";
import { StaffList } from "@/components/staff/StaffList";
import { ErrorAlert, SuccessAlert } from "@/components/staff/AlertMessage";
import { type CreateStaffPayload, type StaffMember } from "@/services/staff.service";
import { mapTemplateRoleToBackendRole } from "@/lib/staff-role-mapping";

export default function StaffManagementSimplePage() {
  const {
    loading,
    error,
    success,
    staff,
    templates,
    isSubmitting,
    createStaff,
    updateStaff,
    deleteStaff,
    clearError,
    clearSuccess,
  } = useStaff();

  const [editingId, setEditingId] = useLocalStorage<string | null>("editing-staff-id", null);
  const [formData, setFormData] = useLocalStorage("staff-form-data", {
    full_name: "",
    email: "",
    staff_template_key: "",
    professional_title: "",
    license_number: "",
    active: true,
  });

  const selectedTemplate = templates.find((t) => t.template_key === formData.staff_template_key);
  const apiRole = mapTemplateRoleToBackendRole(selectedTemplate?.api_role);

  function startEdit(member: StaffMember) {

    setFormData({
      full_name: member.full_name,
      email: member.email,
      staff_template_key: member.staff_template_key || "",
      professional_title: member.professional_title || "",
      license_number: member.license_number || "",
      active: member.active !== false,
    });
    setEditingId(member.id);
  }

  function resetForm() {
    setFormData({
      full_name: "",
      email: "",
      staff_template_key: "",
      professional_title: "",
      license_number: "",
      active: true,
    });
    setEditingId(null);
  }

  async function handleSave() {
    if (!formData.full_name.trim() || !formData.email.trim() || !formData.staff_template_key) {
      clearError();
      return; // Form validation prevents this
    }

    try {
      if (editingId) {
        await updateStaff(editingId, {
          professional_title: formData.professional_title,
          license_number: formData.license_number,
          active: formData.active,
        });
      } else {
        const payload: CreateStaffPayload = {
          email: formData.email.toLowerCase(),
          full_name: formData.full_name,
          staff_template_key: formData.staff_template_key,
          professional_title: formData.professional_title,
          license_number: formData.license_number,
          role: apiRole,
          active: formData.active,
        };
        await createStaff(payload);
      }
      resetForm();
    } catch {
      // Error is handled in the hook
    }
  }

  async function handleDelete(staffId: string) {
    if (!confirm("Remove this staff member?")) return;
    try {
      await deleteStaff(staffId);
      if (editingId === staffId) resetForm();
    } catch {
      // Error is handled in the hook
    }
  }

  // Auto-dismiss messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(clearSuccess, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, clearSuccess]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
        <div className="text-center text-muted-foreground">Loading staff management...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
      {/* Header */}
      <header className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-xl font-semibold">Staff Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add, edit, and manage organization staff members with role templates
        </p>
      </header>

      {/* Messages */}
      {error && <ErrorAlert error={error} onDismiss={clearError} />}
      {success && <SuccessAlert message={success} onDismiss={clearSuccess} />}

      {/* Main Content */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* Form */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-4 text-sm font-semibold">
            {editingId ? "Edit Staff" : "Add Staff"}
          </h2>
          <StaffForm
            templates={templates}
            isEditing={Boolean(editingId)}
            isSubmitting={isSubmitting}
            formData={formData}
            onFormChange={(changes) =>
              setFormData((prev) => ({ ...prev, ...changes }))
            }
            onSubmit={handleSave}
            onCancel={resetForm}
          />
        </div>

        {/* List */}
        <StaffList
          staff={staff}
          isSubmitting={isSubmitting}
          onEdit={startEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

/**
 * Simple localStorage hook for form state
 */
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = React.useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    const stored = localStorage.getItem(key);
    if (!stored) return initialValue;
    try {
      return JSON.parse(stored) as T;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = (newValue: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const valueToStore = newValue instanceof Function ? newValue(prev) : newValue;
      localStorage.setItem(key, JSON.stringify(valueToStore));
      return valueToStore;
    });
  };

  return [value, setStoredValue] as const;
}
