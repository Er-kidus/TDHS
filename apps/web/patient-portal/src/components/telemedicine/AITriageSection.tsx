"use client";

import { useState } from "react";
import { AITriageWidget, type TriageResult } from "./AITriageWidget";
import AIMatchedDoctors from "./AIMatchedDoctors";

type Doctor = {
  id: string;
  full_name: string;
  specialty: string;
  location: string;
  rating: number;
  years_experience: number;
  available: boolean;
  online?: boolean;
  sub_specialty?: string;
  languages?: string[];
  consultation_modes?: string[];
  emergency_support?: boolean;
  current_sessions?: number;
  session_capacity?: number;
};

interface Props {
  doctors: Doctor[];
}

export function AITriageSection({ doctors }: Props) {
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [triageDone, setTriageDone] = useState(false);
  const [showBrowseAll, setShowBrowseAll] = useState(false);

  function handleTriageComplete(result: TriageResult) {
    setTriageResult(result);
    setTriageDone(true);
  }

  return (
    <div className="space-y-4">
      {/* AI Triage widget - shown unless triage is done */}
      {!triageDone && (
        <AITriageWidget
          onComplete={handleTriageComplete}
          onSkip={() => setShowBrowseAll(true)}
        />
      )}

      {/* After triage: show matched doctors */}
      {(triageDone || showBrowseAll) && (
        <AIMatchedDoctors
          doctors={doctors}
          triageResult={triageResult}
        />
      )}

      {/* Redo triage link */}
      {triageDone && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => { setTriageDone(false); setTriageResult(null); }}
            className="text-sm text-muted-foreground hover:text-foreground transition underline underline-offset-4"
          >
            ← Redo symptom check
          </button>
        </div>
      )}
    </div>
  );
}
