// components/staff/StaffForm.tsx
// Reusable staff form component for adding/editing

import { type StaffTemplate } from "@/services/staff.service";
import { mapTemplateRoleToBackendRole } from "@/lib/staff-role-mapping";

type StaffFormData = {
  full_name: string;
  email: string;
  staff_template_key: string;
  professional_title: string;
  license_number: string;
  active?: boolean;
};

interface StaffFormProps {
  templates: StaffTemplate[];
  isEditing?: boolean;
  isSubmitting?: boolean;
  formData: StaffFormData;
  onFormChange: (data: Partial<StaffFormData>) => void;
  onSubmit: () => Promise<void> | void;
  onCancel?: () => void;
}

export function StaffForm({
  templates,
  isEditing = false,
  isSubmitting = false,
  formData,
  onFormChange,
  onSubmit,
  onCancel,
}: StaffFormProps) {
  const selectedTemplate = templates.find(
    (t) => t.template_key === formData.staff_template_key
  );
  const apiRole = mapTemplateRoleToBackendRole(selectedTemplate?.api_role);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit();
      }}
      className="space-y-3"
    >
      {/* Full Name */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Full Name *
        </label>
        <input
          type="text"
          required
          value={formData.full_name}
          onChange={(e) => onFormChange({ full_name: e.target.value })}
          placeholder="e.g., John Smith"
          className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Email *
        </label>
        <input
          type="email"
          required
          disabled={isEditing}
          value={formData.email}
          onChange={(e) => onFormChange({ email: e.target.value })}
          placeholder="e.g., john@tenadam.com"
          className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {isEditing && (
          <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
        )}
      </div>

      {/* Staff Template */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Staff Role Template *
        </label>
        <select
          required
          value={formData.staff_template_key}
          onChange={(e) => onFormChange({ staff_template_key: e.target.value })}
          className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">-- Select template --</option>
          {templates.map((template) => (
            <option key={template.template_key} value={template.template_key}>
              {template.title} ({template.api_role})
            </option>
          ))}
        </select>
      </div>

      {/* API Role (Read-only) */}
      {formData.staff_template_key && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            API Role (Auto-mapped)
          </label>
          <input
            type="text"
            readOnly
            value={apiRole}
            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm opacity-50"
          />
        </div>
      )}

      {/* Professional Title */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Professional Title
        </label>
        <input
          type="text"
          value={formData.professional_title}
          onChange={(e) => onFormChange({ professional_title: e.target.value })}
          placeholder="e.g., Senior Receptionist"
          className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* License Number */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          License/ID Number
        </label>
        <input
          type="text"
          value={formData.license_number}
          onChange={(e) => onFormChange({ license_number: e.target.value })}
          placeholder="e.g., LIC-12345"
          className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Active Status (Edit only) */}
      {isEditing && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Status
          </label>
          <select
            value={formData.active ? "active" : "inactive"}
            onChange={(e) => onFormChange({ active: e.target.value === "active" })}
            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:opacity-90"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Staff" : "Add Staff"}
        </button>
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-9 px-3 rounded-lg border border-border text-sm disabled:opacity-50 hover:bg-muted"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
