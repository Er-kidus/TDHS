// components/staff/StaffList.tsx
// Reusable staff list component

import { type StaffMember } from "@/services/staff.service";

interface StaffListProps {
  staff: StaffMember[];
  isLoading?: boolean;
  isSubmitting?: boolean;
  onEdit: (member: StaffMember) => void;
  onDelete: (id: string) => Promise<void> | void;
}

export function StaffList({
  staff,
  isLoading = false,
  isSubmitting = false,
  onEdit,
  onDelete,
}: StaffListProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-center text-sm text-muted-foreground">Loading staff...</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-4 text-sm font-semibold">Organization Staff ({staff.length})</h2>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {staff.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4">No staff members yet</p>
        ) : (
          staff.map((member) => (
            <StaffListItem
              key={member.id}
              member={member}
              isSubmitting={isSubmitting}
              onEdit={() => onEdit(member)}
              onDelete={() => onDelete(member.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface StaffListItemProps {
  member: StaffMember;
  isSubmitting: boolean;
  onEdit: () => void;
  onDelete: () => Promise<void> | void;
}

function StaffListItem({
  member,
  isSubmitting,
  onEdit,
  onDelete,
}: StaffListItemProps) {
  const isActive = member.active !== false;

  return (
    <div className="rounded-lg border border-border bg-background p-3 space-y-2 hover:bg-muted/30 transition-colors">
      {/* Header with name and status */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-sm line-clamp-1">{member.full_name}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{member.email}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded whitespace-nowrap flex-shrink-0 ${
            isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Role info */}
      <div className="text-xs text-muted-foreground space-y-0.5">
        {member.staff_template_title && (
          <p>{member.staff_template_title}</p>
        )}
        {member.professional_title && (
          <p>Title: {member.professional_title}</p>
        )}
        {member.license_number && (
          <p>License: {member.license_number}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onEdit}
          disabled={isSubmitting}
          className="text-xs px-2 py-1 rounded border border-border hover:bg-muted disabled:opacity-50 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => {
            if (confirm("Are you sure you want to remove this staff member?")) {
              void onDelete();
            }
          }}
          disabled={isSubmitting}
          className="text-xs px-2 py-1 rounded border border-border text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
