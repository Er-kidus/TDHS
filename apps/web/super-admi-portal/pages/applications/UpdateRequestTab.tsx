import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type OrgApplication } from "./types";

interface UpdateRequestTabProps {
  selectedApplication: OrgApplication;
  applicationUpdateServiceDraft: string;
  setApplicationUpdateServiceDraft: (value: string) => void;
  applicationActionBusy: boolean;
  handleApproveUpdateRequest: () => Promise<void> | void;
  handleRejectUpdateRequest: () => Promise<void> | void;
}

export default function UpdateRequestTab({
  selectedApplication,
  applicationUpdateServiceDraft,
  setApplicationUpdateServiceDraft,
  applicationActionBusy,
  handleApproveUpdateRequest,
  handleRejectUpdateRequest,
}: UpdateRequestTabProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Status: {selectedApplication.update_request_status || "none"}
      </p>
      <Input
        value={applicationUpdateServiceDraft}
        onChange={(event) => setApplicationUpdateServiceDraft(event.target.value)}
        placeholder="Requested additional services"
      />
      {!!selectedApplication.update_request_notes && (
        <p className="text-xs text-muted-foreground">Notes: {selectedApplication.update_request_notes}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={applicationActionBusy} onClick={() => void handleApproveUpdateRequest()}>
          Approve Update
        </Button>
        <Button size="sm" variant="outline" disabled={applicationActionBusy} onClick={() => void handleRejectUpdateRequest()}>
          Reject Update
        </Button>
      </div>
    </div>
  );
}
