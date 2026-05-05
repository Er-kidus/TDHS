// StaffForm Component
// Reusable form for creating/editing staff members with role validation

import React, { useState, useEffect } from "react";
import { StaffAssignmentRequest } from "@/services/staff.service";
import AlertMessage from "./AlertMessage";

interface StaffFormProps {
  onSubmit: (data: StaffAssignmentRequest) => Promise<void>;
  loading: boolean;
  error?: string;
  availableRoles?: string[];
  availableTemplates?: string[];
  onCancel?: () => void;
}

const STAFF_TEMPLATES = [
  { key: "ward-clerk", label: "Ward Clerk", suggestedRole: "reception" },
  { key: "nurse", label: "Nurse", suggestedRole: "nurse" },
  { key: "doctor", label: "Doctor", suggestedRole: "doctor" },
  { key: "laboratory", label: "Laboratory Technician", suggestedRole: "lab" },
  { key: "pharmacist", label: "Pharmacist", suggestedRole: "pharmacist" },
];

export default function StaffForm({
  onSubmit,
  loading,
  error,
  availableRoles = [],
  onCancel,
}: StaffFormProps) {
  const [formData, setFormData] = useState<StaffAssignmentRequest>({
    email: "",
    full_name: "",
    staff_template_key: "",
    professional_title: "",
    license_number: "",
    role: "",
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [suggestedRole, setSuggestedRole] = useState<string | null>(null);

  const selectedTemplate = STAFF_TEMPLATES.find(
    (t) => t.key === formData.staff_template_key
  );

  useEffect(() => {
    if (selectedTemplate) {
      setSuggestedRole(selectedTemplate.suggestedRole);
      setFormData((prev) => ({
        ...prev,
        role: selectedTemplate.suggestedRole,
      }));
    } else {
      setSuggestedRole(null);
    }
  }, [formData.staff_template_key]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate required fields
    if (!formData.full_name.trim()) {
      setFormError("Full name is required");
      return;
    }

    if (!formData.email.trim()) {
      setFormError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError("Please enter a valid email address");
      return;
    }

    if (!formData.staff_template_key) {
      setFormError("Staff template is required");
      return;
    }

    if (availableRoles.length > 0 && !formData.role) {
      setFormError("Role is required");
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        email: "",
        full_name: "",
        staff_template_key: "",
        professional_title: "",
        license_number: "",
        role: "",
      });
    } catch (err) {
      // Error is handled by parent component
    }
  };

  const displayRoles =
    availableRoles.length > 0
      ? availableRoles
      : suggestedRole
        ? [suggestedRole]
        : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      {(formError || error) && (
        <AlertMessage
          type="error"
          message={formError || error}
          onClose={() => setFormError(null)}
        />
      )}

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium mb-2">
          Full Name *
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          placeholder="Enter full name"
          disabled={loading}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email address"
          disabled={loading}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          required
        />
      </div>

      <div>
        <label
          htmlFor="staff_template_key"
          className="block text-sm font-medium mb-2"
        >
          Staff Template *
        </label>
        <select
          id="staff_template_key"
          name="staff_template_key"
          value={formData.staff_template_key}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          required
        >
          <option value="">Select a template...</option>
          {STAFF_TEMPLATES.map((template) => (
            <option key={template.key} value={template.key}>
              {template.label}
            </option>
          ))}
        </select>
        {suggestedRole && (
          <p className="text-sm text-gray-600 mt-1">
            Suggested role: <span className="font-medium">{suggestedRole}</span>
          </p>
        )}
      </div>

      {displayRoles.length > 0 && (
        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-2">
            Role
            {availableRoles.length > 0 && <span className="text-red-500"> *</span>}
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            required={availableRoles.length > 0}
          >
            <option value="">Select a role...</option>
            {displayRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label
          htmlFor="professional_title"
          className="block text-sm font-medium mb-2"
        >
          Professional Title
        </label>
        <input
          type="text"
          id="professional_title"
          name="professional_title"
          value={formData.professional_title}
          onChange={handleChange}
          placeholder="e.g., Senior Nurse, Cardiac Specialist"
          disabled={loading}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label
          htmlFor="license_number"
          className="block text-sm font-medium mb-2"
        >
          License Number
        </label>
        <input
          type="text"
          id="license_number"
          name="license_number"
          value={formData.license_number}
          onChange={handleChange}
          placeholder="Professional license number"
          disabled={loading}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {loading ? "Adding Staff..." : "Add Staff Member"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 disabled:bg-gray-200 font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
