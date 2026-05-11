// Staff Management Page
// Full-featured staff management page with create, read, update, delete operations

import React, { useEffect, useState } from "react";
import { useStaff } from "@/hooks/useStaff";
import { StaffAssignmentRequest } from "@/services/staff.service";
import StaffForm from "@/components/staff/StaffForm";
import StaffList from "@/components/staff/StaffList";
import AlertMessage from "@/components/staff/AlertMessage";

interface PageParams {
  orgId: string;
}

export default function StaffManagementPage() {
  const {
    staff,
    loading,
    error,
    availableRoles,
    fetchStaff,
    createStaff,
    deleteStaff,
    clearError,
  } = useStaff();

  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string>("");

  // Get org ID from URL params or context
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("orgId") || localStorage.getItem("organizationId") || "";
    setOrgId(id);

    if (id) {
      fetchStaff(id);
    }
  }, [fetchStaff]);

  const handleCreateStaff = async (data: StaffAssignmentRequest) => {
    if (!orgId) {
      alert("Organization ID not found");
      return;
    }

    try {
      await createStaff(orgId, data);
      setSuccessMessage(
        `Staff member ${data.full_name} has been added successfully!`
      );
      setShowForm(false);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      // Error is already set in hook
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!orgId) {
      alert("Organization ID not found");
      return;
    }

    try {
      await deleteStaff(orgId, staffId);
      setSuccessMessage("Staff member has been removed successfully!");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      // Error is already set in hook
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-2">
            Manage healthcare staff assignments and roles
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <AlertMessage
            type="error"
            message={error}
            onClose={clearError}
            closeable={true}
          />
        )}

        {successMessage && (
          <AlertMessage
            type="success"
            message={successMessage}
            closeable={true}
            onClose={() => setSuccessMessage(null)}
          />
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium mb-4"
                >
                  + Add New Staff Member
                </button>
              )}

              {showForm && (
                <>
                  <h2 className="text-xl font-semibold mb-4">Add Staff Member</h2>
                  <StaffForm
                    onSubmit={handleCreateStaff}
                    loading={loading}
                    error={error}
                    availableRoles={availableRoles}
                    onCancel={() => setShowForm(false)}
                  />
                </>
              )}
            </div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Staff Members ({staff.length})
              </h2>
              <StaffList
                staff={staff}
                loading={loading}
                onDelete={handleDeleteStaff}
              />
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Click "Add New Staff Member" to create a new staff assignment
            </li>
            <li>• Select a staff template matching the role (Ward Clerk, Nurse, etc.)</li>
            <li>
              • The role will be automatically validated against available roles
            </li>
            <li>• License number is required for licensed professionals</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
