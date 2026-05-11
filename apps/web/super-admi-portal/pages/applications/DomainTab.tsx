import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type OrgApplication } from "./types";

interface DomainTabProps {
  selectedApplication: OrgApplication;
  applicationDomainDraft: string;
  setApplicationDomainDraft: (value: string) => void;
  applicationActionBusy: boolean;
  handleSaveApplicationDomain: () => Promise<void> | void;
}

export default function DomainTab({
  selectedApplication,
  applicationDomainDraft,
  setApplicationDomainDraft,
  applicationActionBusy,
  handleSaveApplicationDomain,
}: DomainTabProps) {
  const baseSlug = (selectedApplication.organization_slug || "organization").trim().toLowerCase();
  const defaultAdminEmail = `admin@${baseSlug}.tenadam.local`;
  const defaultAdminPassword = `Admin@${baseSlug}123`;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold">Domain Configuration</p>
        <p className="text-xs text-muted-foreground">
          Current domain: {selectedApplication.organization_domain || "Not configured"}
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          value={applicationDomainDraft}
          onChange={(event) => setApplicationDomainDraft(event.target.value)}
          placeholder="clinic-a.org.tenadam.local"
        />
        <Button size="sm" variant="outline" disabled={applicationActionBusy} onClick={() => void handleSaveApplicationDomain()}>
          Save Domain
        </Button>
      </div>

      <div className="rounded-lg border bg-muted/30 p-3 text-sm">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Default Organization Admin Login</p>
        <p className="mt-1"><span className="font-medium">Email:</span> {defaultAdminEmail}</p>
        <p className="mt-1"><span className="font-medium">Password:</span> {defaultAdminPassword}</p>
      </div>
    </div>
  );
}
