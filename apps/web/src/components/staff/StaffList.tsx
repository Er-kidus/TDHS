// StaffList Component
// Reusable list component for displaying staff members

import React from "react";
import { StaffProfile } from "@/services/staff.service";

interface StaffListProps {
  staff: StaffProfile[];
  loading: boolean;
  onEdit?: (staff: StaffProfile) => void;
  onDelete?: (staffId: string) => void;
  onView?: (staff: StaffProfile) => void;
}

export default function StaffList({
  staff,
  loading,
  onEdit,
  onDelete,
  onView,
}: StaffListProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <p className="mt-2 text-gray-600">Loading staff...</p>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>No staff members found.</p>
        <p className="text-sm mt-1">Add a new staff member to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow rounded-lg">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Name
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Email
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Role
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Template
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Title
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Status
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {staff.map((member) => (
            <tr
              key={member.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {member.full_name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">{member.email}</td>
              <td className="px-6 py-4 text-sm">
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  {member.role}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {member.staff_template_title || member.staff_template_key}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {member.professional_title || "—"}
              </td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    member.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {member.active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-6 py-4 text-sm space-x-2 flex">
                {onView && (
                  <button
                    onClick={() => onView(member)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(member)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to remove ${member.full_name}?`
                        )
                      ) {
                        onDelete(member.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
