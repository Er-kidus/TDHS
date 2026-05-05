import { Badge } from "@/components/ui/badge";
import { type OrgStaffTemplate } from "./types";
import { cn } from "@/lib/utils";

interface StaffTemplatesTabProps {
  availableStaffTemplates: OrgStaffTemplate[];
  applicationStaffTemplateDraft: string[];
  toggleApplicationStaffTemplate: (templateKey: string) => void;
}

export default function StaffTemplatesTab({
  availableStaffTemplates,
  applicationStaffTemplateDraft,
  toggleApplicationStaffTemplate,
}: StaffTemplatesTabProps) {
  return (
    <div className="space-y-3">
      <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
        {availableStaffTemplates.map((template) => {
          const selected = applicationStaffTemplateDraft.includes(template.template_key);
          return (
            <button
              key={template.template_key}
              type="button"
              onClick={() => toggleApplicationStaffTemplate(template.template_key)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                selected ? "border-primary bg-primary/10" : "border-border/70 hover:bg-muted/40",
              )}
            >
              <div>
                <p className="text-sm font-medium">{template.title}</p>
                <p className="text-xs text-muted-foreground">
                  {template.role_group} • {template.category}
                </p>
              </div>
              <Badge variant="secondary">{template.api_role}</Badge>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {applicationStaffTemplateDraft.slice(0, 6).map((templateKey) => (
          <Badge key={templateKey} variant="outline">
            {templateKey}
          </Badge>
        ))}
      </div>
    </div>
  );
}
