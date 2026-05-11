import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePatient } from "@/contexts/PatientContext";
import type { Patient as UiPatient } from "@/contexts/PatientContext";
import { useAuth } from "@/contexts/AuthContext";
import { listOrgPatients, type GatewayPatient } from "@/lib/gateway";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Timeline } from "@/components/shared/Timeline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, ChevronRight, Phone, Calendar, Heart, FileText, Activity } from "lucide-react";

function deriveName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? fullName, lastName: parts.slice(1).join(" ") };
}

function profileString(profile: Record<string, unknown>, key: string): string | null {
  const v = profile[key];
  if (typeof v === "string" && v.trim()) return v;
  return null;
}

function toUiPatient(p: GatewayPatient): UiPatient {
  const { firstName, lastName } = deriveName(p.full_name);
  const gender = profileString(p.profile, "gender")?.toUpperCase() === "F" ? "F" : "M";
  const dateOfBirth = profileString(p.profile, "dob") ?? profileString(p.profile, "dateOfBirth") ?? "—";
  const bloodType = profileString(p.profile, "bloodType") ?? "—";
  const allergiesRaw = (p.profile as Record<string, unknown>)["allergies"];
  const allergies = Array.isArray(allergiesRaw) ? (allergiesRaw as string[]) : [];
  const mrn = `TEN-${p.id.slice(0, 6).toUpperCase()}`;
  return {
    id: p.id,
    mrn,
    firstName,
    lastName,
    dateOfBirth,
    gender,
    phone: p.phone,
    allergies,
    bloodType,
    status: p.active ? "active" : "discharged",
  };
}

const patientHistory = [
  { id: "1", title: "Consultation - Dr. Tekle", description: "Follow-up for hypertension", time: "Mar 28, 2026", variant: "info" as const },
  { id: "2", title: "Lab: CBC", description: "Results normal", time: "Mar 25, 2026", variant: "success" as const },
  { id: "3", title: "Prescription", description: "Lisinopril 10mg started", time: "Mar 20, 2026", variant: "default" as const },
  { id: "4", title: "Emergency Visit", description: "Acute chest pain - resolved", time: "Feb 15, 2026", variant: "destructive" as const },
];

const PatientRegistry: React.FC = () => {
  const { t } = useLanguage();
  const { token } = useAuth();
  const { selectedPatient, setSelectedPatient } = usePatient();
  const [searchQuery, setSearchQuery] = useState("");

  const patientsQuery = useQuery({
    queryKey: ["orgPatients", token],
    enabled: !!token,
    queryFn: () => listOrgPatients(token as string, 200),
  });

  const patients = useMemo(() => patientsQuery.data ?? [], [patientsQuery.data]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => {
      const hay = `${p.full_name} ${p.email} ${p.phone} ${p.id}`.toLowerCase();
      return hay.includes(q);
    });
  }, [patients, searchQuery]);

  return (
    <div className="p-4 md:p-6 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{t("nav.patients")}</h1>
        <Button size="sm" className="gap-1.5"><Users className="h-3.5 w-3.5" /> {t("common.new_patient")}</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Patient list */}
        <div className="lg:col-span-1 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, MRN, phone..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 h-10" />
          </div>
          <div className="bg-card rounded-lg border shadow-soft divide-y max-h-[calc(100vh-220px)] overflow-auto">
            {patientsQuery.isLoading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading patients…</div>
            ) : patientsQuery.isError ? (
              <div className="p-4 text-sm text-destructive">Failed to load patients.</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No patients found.</div>
            ) : (
              filtered.map((p) => {
                const ui = toUiPatient(p);
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatient(ui)}
                    className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors ${
                      selectedPatient?.id === p.id ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                      {ui.firstName[0]}{ui.lastName[0] || ui.firstName[1] || ""}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ui.firstName} {ui.lastName}</p>
                      <p className="text-xs text-muted-foreground">{ui.mrn} • {ui.gender}</p>
                    </div>
                    <StatusBadge variant={ui.status === "admitted" ? "info" : "active"} size="sm" dot>{ui.status}</StatusBadge>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Patient profile */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="space-y-4">
              <div className="bg-card rounded-lg border shadow-soft p-5">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary">
                    {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                    <p className="text-sm text-muted-foreground">MRN: {selectedPatient.mrn}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                      <div><span className="text-muted-foreground">DOB</span><p className="font-medium">{selectedPatient.dateOfBirth}</p></div>
                      <div><span className="text-muted-foreground">Gender</span><p className="font-medium">{selectedPatient.gender === "M" ? "Male" : "Female"}</p></div>
                      <div><span className="text-muted-foreground">Blood Type</span><p className="font-medium flex items-center gap-1"><Heart className="h-3 w-3" />{selectedPatient.bloodType}</p></div>
                      <div><span className="text-muted-foreground">Phone</span><p className="font-medium flex items-center gap-1"><Phone className="h-3 w-3" />{selectedPatient.phone}</p></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-card rounded-lg border shadow-soft p-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Activity className="h-4 w-4 text-primary" /> {t("patient.history")}</h3>
                  <Timeline items={patientHistory} />
                </div>
                <div className="bg-card rounded-lg border shadow-soft p-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><FileText className="h-4 w-4 text-primary" /> {t("patient.documents")}</h3>
                  <div className="space-y-2">
                    {["Blood Test Report.pdf", "X-Ray Chest.jpg", "Referral Letter.pdf"].map((doc) => (
                      <div key={doc} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-info" />
                          <span className="text-sm">{doc}</span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-lg border shadow-soft flex items-center justify-center py-20">
              <div className="text-center">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a patient to view their profile</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientRegistry;
