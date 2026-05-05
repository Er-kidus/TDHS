import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import DomainTab from "./applications/DomainTab";
import QueueTab from "./applications/QueueTab";
import StaffTemplatesTab from "./applications/StaffTemplatesTab";
import UpdateRequestTab from "./applications/UpdateRequestTab";
import { type ApplicationsPageProps } from "./applications/types";

export default function ApplicationsPage({
  orgApplications,
  serviceDefinitions,
  availableStaffTemplates,
  selectedApplication,
  applicationRouteId,
  applicationSearch,
  setApplicationSearch,
  applicationActionBusy,
  setSelectedApplicationId,
  openOnboardingApplication,
  handleApproveApplication,
  handleRejectApplication,
  applicationServiceDraft,
  setApplicationServiceDraft,
  applicationDomainDraft,
  setApplicationDomainDraft,
  applicationUpdateServiceDraft,
  setApplicationUpdateServiceDraft,
  handleSaveApplicationServices,
  handleCreateCatalogService,
  handleSaveApplicationDomain,
  handleApproveUpdateRequest,
  handleRejectUpdateRequest,
  handleSaveApplicationStaffTemplates,
  applicationStaffTemplateDraft,
  toggleApplicationStaffTemplate,
}: ApplicationsPageProps) {
  const navigate = useNavigate();
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<"all" | "pending" | "approved" | "verified">("all");
  const [updateFilter, setUpdateFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const filteredApplications = orgApplications.filter((application) => {
    const haystack = [
      application.organization_name,
      application.organization_slug,
      application.contact_name,
      application.contact_email,
      application.contact_phone,
      application.license_number,
      application.organization_domain || "",
      application.update_request_status || "",
      application.location.address,
      application.status,
      ...(application.requested_services || []),
      ...(application.configured_services || []),
      ...(application.update_requested_services || []),
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = haystack.includes(applicationSearch.toLowerCase());
    const matchesStatus = applicationStatusFilter === "all" || application.status === applicationStatusFilter;
    const matchesUpdate =
      updateFilter === "all" ||
      (application.update_request_status || "none").toLowerCase() === updateFilter;

    return matchesSearch && matchesStatus && matchesUpdate;
  });

  const pendingUpdateCount = orgApplications.filter((application) => (application.update_request_status || "").toLowerCase() === "pending").length;

  const pendingCount = orgApplications.filter((application) => application.status === "pending").length;
  const approvedCount = orgApplications.filter((application) => application.status === "approved").length;
  const verifiedCount = orgApplications.filter((application) => application.status === "verified").length;

  const pendingQueue = useMemo(() => filteredApplications.filter((application) => application.status === "pending"), [filteredApplications]);
  const approvedQueue = useMemo(() => filteredApplications.filter((application) => application.status === "approved"), [filteredApplications]);
  const verifiedQueue = useMemo(() => filteredApplications.filter((application) => application.status === "verified"), [filteredApplications]);

  const renderQueueTable = (rows: typeof filteredApplications) => {
    if (rows.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
          No organization applications match the current filters.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-xl border border-border/70">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Organization</th>
              <th className="px-3 py-2 text-left font-medium">Contact</th>
              <th className="px-3 py-2 text-left font-medium">Domain</th>
              <th className="px-3 py-2 text-left font-medium">Update Request</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((application) => {
              const isSelected = application.id === selectedApplication?.id;
              return (
                <tr
                  key={application.id}
                  onClick={() => setSelectedApplicationId(application.id)}
                  onDoubleClick={() => openOnboardingApplication(application.id)}
                  className={cn(
                    "cursor-pointer border-t border-border/60 hover:bg-muted/30",
                    isSelected && "bg-primary/5",
                  )}
                  title="Double click to open application details page"
                >
                  <td className="px-3 py-3">
                    <p className="font-medium">{application.organization_name}</p>
                    <p className="text-xs text-muted-foreground">{application.organization_slug}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p>{application.contact_name}</p>
                    <p className="text-xs text-muted-foreground">{application.contact_email}</p>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{application.organization_domain || "pending"}</td>
                  <td className="px-3 py-3">
                    <Badge variant={(application.update_request_status || "") === "pending" ? "destructive" : "outline"}>
                      {application.update_request_status || "none"}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={application.status === "verified" ? "secondary" : application.status === "approved" ? "outline" : "destructive"}>
                      {application.status}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (applicationRouteId) {
    return (
      <div className="space-y-4">
        <section className="rounded-xl border border-border/70 bg-background/70 p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Approval Workspace</h2>
              <p className="text-sm text-muted-foreground">Open an application from the queue to review details.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/super-admin/onboarding-queue")}>Back to queue</Button>
          </div>

          {selectedApplication ? (
            <Tabs defaultValue="queue" className="space-y-4">
              <TabsList className="grid h-auto w-full grid-cols-2 gap-2 md:grid-cols-4">
                <TabsTrigger value="queue">Pending Access</TabsTrigger>
                <TabsTrigger value="domain">Organizational Domain</TabsTrigger>
                <TabsTrigger value="update">Update Request</TabsTrigger>
                <TabsTrigger value="staff">Staff Templates</TabsTrigger>
              </TabsList>

              <TabsContent value="queue">
                <QueueTab
                  selectedApplication={selectedApplication}
                  serviceDefinitions={serviceDefinitions}
                  applicationServiceDraft={applicationServiceDraft}
                  setApplicationServiceDraft={setApplicationServiceDraft}
                  applicationActionBusy={applicationActionBusy}
                  handleSaveApplicationServices={handleSaveApplicationServices}
                  handleCreateCatalogService={handleCreateCatalogService}
                  handleSaveApplicationStaffTemplates={handleSaveApplicationStaffTemplates}
                  handleApproveApplication={handleApproveApplication}
                  handleRejectApplication={handleRejectApplication}
                />
              </TabsContent>

              <TabsContent value="domain">
                <DomainTab
                  selectedApplication={selectedApplication}
                  applicationDomainDraft={applicationDomainDraft}
                  setApplicationDomainDraft={setApplicationDomainDraft}
                  applicationActionBusy={applicationActionBusy}
                  handleSaveApplicationDomain={handleSaveApplicationDomain}
                />
              </TabsContent>

              <TabsContent value="update">
                <UpdateRequestTab
                  selectedApplication={selectedApplication}
                  applicationUpdateServiceDraft={applicationUpdateServiceDraft}
                  setApplicationUpdateServiceDraft={setApplicationUpdateServiceDraft}
                  applicationActionBusy={applicationActionBusy}
                  handleApproveUpdateRequest={handleApproveUpdateRequest}
                  handleRejectUpdateRequest={handleRejectUpdateRequest}
                />
              </TabsContent>

              <TabsContent value="staff">
                <StaffTemplatesTab
                  availableStaffTemplates={availableStaffTemplates}
                  applicationStaffTemplateDraft={applicationStaffTemplateDraft}
                  toggleApplicationStaffTemplate={toggleApplicationStaffTemplate}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="rounded-xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
              Select an application from the queue to review onboarding details.
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border/70 bg-background/70 p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-semibold tracking-tight">Onboarding Queue</h2>
          <p className="text-sm text-muted-foreground">Review applications by status and double-click to open the full onboarding detail page.</p>
        </div>

        {(pendingCount > 0 || pendingUpdateCount > 0) && (
          <div className="mb-4 rounded-xl border border-amber-400/50 bg-amber-100/60 px-4 py-3 text-sm text-amber-950 dark:bg-amber-900/20 dark:text-amber-200">
            Pending approvals: {pendingCount} application(s) and {pendingUpdateCount} update request(s) are waiting for action.
          </div>
        )}

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <Input
            value={applicationSearch}
            onChange={(event) => setApplicationSearch(event.target.value)}
            placeholder="Search organization, contact, service, license"
            aria-label="Search applications"
          />
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={applicationStatusFilter}
            aria-label="Filter by application status"
            title="Filter by application status"
            onChange={(event) => setApplicationStatusFilter(event.target.value as "all" | "pending" | "approved" | "verified")}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="verified">Verified</option>
          </select>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={updateFilter}
            aria-label="Filter by update request status"
            title="Filter by update request status"
            onChange={(event) => setUpdateFilter(event.target.value as "all" | "pending" | "approved" | "rejected")}
          >
            <option value="all">All update requests</option>
            <option value="pending">Pending updates</option>
            <option value="approved">Approved updates</option>
            <option value="rejected">Rejected updates</option>
          </select>
          <Button disabled={applicationActionBusy || !selectedApplication} onClick={() => void handleApproveApplication()}>
            Approve Selected
          </Button>
        </div>

        <Tabs defaultValue="pending" className="space-y-3">
          <TabsList className="grid h-auto w-full grid-cols-3">
            <TabsTrigger value="pending">Pending ({pendingQueue.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedQueue.length})</TabsTrigger>
            <TabsTrigger value="verified">Verified ({verifiedQueue.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">{renderQueueTable(pendingQueue)}</TabsContent>
          <TabsContent value="approved">{renderQueueTable(approvedQueue)}</TabsContent>
          <TabsContent value="verified">{renderQueueTable(verifiedQueue)}</TabsContent>
        </Tabs>
      </section>
    </div>
  );
}