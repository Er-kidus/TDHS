import React from "react";
import { usePatient } from "@/contexts/PatientContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { X, AlertTriangle, Heart } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

export const PatientBanner: React.FC = () => {
  const { selectedPatient, setSelectedPatient } = usePatient();
  const { t } = useLanguage();

  if (!selectedPatient) return null;

  return (
    <div className="bg-primary/5 border-b border-primary/20 px-4 py-2 animate-fade-in">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
              {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {selectedPatient.firstName} {selectedPatient.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("patient.id")}: {selectedPatient.mrn}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            <span>{selectedPatient.gender === "M" ? "Male" : "Female"}</span>
            <span>•</span>
            <span>DOB: {selectedPatient.dateOfBirth}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" /> {selectedPatient.bloodType}
            </span>
          </div>
          {selectedPatient.allergies.length > 0 && (
            <StatusBadge variant="destructive" size="sm" dot>
              <AlertTriangle className="h-3 w-3 mr-1" />
              {selectedPatient.allergies.join(", ")}
            </StatusBadge>
          )}
          <StatusBadge
            variant={
              selectedPatient.status === "emergency" ? "urgent" :
              selectedPatient.status === "admitted" ? "info" :
              selectedPatient.status === "active" ? "active" : "completed"
            }
            size="sm"
            dot
          >
            {selectedPatient.status}
          </StatusBadge>
        </div>
        <button
          onClick={() => setSelectedPatient(null)}
          className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors touch-target"
          aria-label="Close patient context"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
