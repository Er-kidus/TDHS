import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type OrgApplication } from "./types";

interface QueueTabProps {
  selectedApplication: OrgApplication;
  serviceDefinitions: Array<{ id: string; name: string }>;
  applicationServiceDraft: string;
  setApplicationServiceDraft: (value: string) => void;
  applicationActionBusy: boolean;
  handleSaveApplicationServices: () => Promise<void> | void;
  handleCreateCatalogService: (name: string) => Promise<boolean>;
  handleSaveApplicationStaffTemplates: () => Promise<void> | void;
  handleApproveApplication: () => Promise<void> | void;
  handleRejectApplication: () => Promise<void> | void;
}

export default function QueueTab({
  selectedApplication,
  serviceDefinitions,
  applicationServiceDraft,
  setApplicationServiceDraft,
  applicationActionBusy,
  handleSaveApplicationServices,
  handleCreateCatalogService,
  handleSaveApplicationStaffTemplates,
  handleApproveApplication,
  handleRejectApplication,
}: QueueTabProps) {
  const [catalogSearch, setCatalogSearch] = useState("");
  const [newServiceName, setNewServiceName] = useState("");

  const configuredServices = useMemo(
    () =>
      applicationServiceDraft
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    [applicationServiceDraft],
  );

  const filteredCatalog = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();
    if (!query) return serviceDefinitions;
    return serviceDefinitions.filter((service) => service.name.toLowerCase().includes(query));
  }, [catalogSearch, serviceDefinitions]);

  function addServiceToDraft(serviceName: string) {
    const normalized = serviceName.trim();
    if (!normalized) return;
    const existingSet = new Set(configuredServices.map((service) => service.toLowerCase()));
    if (existingSet.has(normalized.toLowerCase())) return;
    setApplicationServiceDraft([...configuredServices, normalized].join(", "));
  }

  function removeServiceFromDraft(serviceName: string) {
    const next = configuredServices.filter((service) => service.toLowerCase() !== serviceName.toLowerCase());
    setApplicationServiceDraft(next.join(", "));
  }

  async function submitNewCatalogService() {
    const serviceName = newServiceName.trim();
    if (!serviceName) return;
    const created = await handleCreateCatalogService(serviceName);
    if (created) {
      addServiceToDraft(serviceName);
      setNewServiceName("");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold">{selectedApplication.organization_name}</p>
        <p className="text-xs text-muted-foreground">
          {selectedApplication.organization_slug} • {selectedApplication.status}
        </p>
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-2">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Contact</p>
          <p className="font-medium">{selectedApplication.contact_name}</p>
          <p className="text-muted-foreground">{selectedApplication.contact_email}</p>
          <p className="text-muted-foreground">{selectedApplication.contact_phone}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">License</p>
          <p className="font-medium">{selectedApplication.license_number}</p>
          <p className="text-muted-foreground">{selectedApplication.location.address}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase text-muted-foreground">Configured Services</p>
        <div className="rounded-xl border border-border/70 bg-background/70 p-3">
          <div className="grid gap-2 md:grid-cols-[1fr_auto]">
            <Input
              value={catalogSearch}
              onChange={(event) => setCatalogSearch(event.target.value)}
              placeholder="Search service catalog"
            />
            <Input
              value={newServiceName}
              onChange={(event) => setNewServiceName(event.target.value)}
              placeholder="Add new service to DB"
            />
          </div>

          <div className="mt-2 flex items-center justify-end">
            <Button size="sm" variant="outline" disabled={applicationActionBusy || !newServiceName.trim()} onClick={() => void submitNewCatalogService()}>
              Add Service
            </Button>
          </div>

          <div className="mt-3 max-h-40 overflow-auto pr-1">
            <div className="grid gap-2 sm:grid-cols-2">
              {filteredCatalog.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => addServiceToDraft(service.name)}
                  className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-left text-xs hover:bg-muted/60"
                >
                  {service.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {configuredServices.map((service) => (
            <div key={service} className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-xs">
              <span>{service}</span>
              <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => removeServiceFromDraft(service)}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {(selectedApplication.requested_services || []).map((service) => (
            <Badge key={service} variant="secondary">
              {service}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={applicationActionBusy} onClick={() => void handleSaveApplicationServices()}>
            Save Services
          </Button>
          <Button size="sm" variant="outline" disabled={applicationActionBusy} onClick={() => void handleSaveApplicationStaffTemplates()}>
            Save Staff Templates
          </Button>
          <Button size="sm" variant="outline" disabled={applicationActionBusy} onClick={() => void handleRejectApplication()}>
            Reject Application
          </Button>
          <Button size="sm" disabled={applicationActionBusy} onClick={() => void handleApproveApplication()}>
            Approve Application
          </Button>
        </div>
      </div>
    </div>
  );
}
