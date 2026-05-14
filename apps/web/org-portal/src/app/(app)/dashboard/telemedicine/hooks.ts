"use client";

import { useCallback, useState } from "react";
import {
  Artifact,
  Doctor,
  OrgMe,
  OrgUser,
  Patient,
  QueueSession,
  TelemedicineMessage,
  TranscriptLine,
  BrowserSpeechRecognition,
} from "./types";
import { readJsonResponse, getErrorMessage } from "./api";

export function useTranscript() {
  const [
    transcriptLines,
    setTranscriptLines,
  ] = useState<TranscriptLine[]>([]);

  function addTranscriptLine(
    speaker: string,
    text: string,
    source: "voice" | "manual"
  ) {
    const content = text.trim();

    if (!content) return;

    const line: TranscriptLine = {
      id: crypto.randomUUID(),
      speaker,
      text: content,
      source,
      createdAt: new Date().toISOString(),
    };

    setTranscriptLines((prev) => [
      ...prev,
      line,
    ]);
  }

  return {
    transcriptLines,
    addTranscriptLine,
    setTranscriptLines,
  };
}

export function useTelemedicineData() {
  const [doctors, setDoctors] = useState<Doctor[]>(
    []
  );
  const [orgUsers, setOrgUsers] = useState<
    OrgUser[]
  >([]);
  const [
    queueSessions,
    setQueueSessions,
  ] = useState<QueueSession[]>([]);
  const [patients, setPatients] = useState<
    Patient[]
  >([]);
  const [artifacts, setArtifacts] = useState<
    Artifact[]
  >([]);
  const [messages, setMessages] = useState<
    TelemedicineMessage[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(
    ""
  );
  const [orgMe, setOrgMe] = useState<OrgMe | null>(
    null
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadingError("");

    try {
      const meRes = await fetch("/api/org/me", {
        cache: "no-store",
      });
      const meData = await readJsonResponse(meRes);
      const role =
        meRes.ok &&
        meData &&
        typeof meData === "object" &&
        typeof meData.role === "string"
          ? meData.role.toLowerCase()
          : "";

      if (
        meRes.ok &&
        meData &&
        typeof meData === "object" &&
        typeof meData.id === "string" &&
        typeof meData.role === "string"
      ) {
        setOrgMe({
          id: meData.id,
          role: meData.role,
          email:
            typeof meData.email === "string"
              ? meData.email
              : undefined,
        });
      } else {
        setOrgMe(null);
      }

      const canReadUsers = role === "superadmin";
      const canReadPatients =
        role === "superadmin" || role === "admin";

      const [
        docsRes,
        artifactsRes,
        queueRes,
        usersRes,
        patientsRes,
      ] = await Promise.all([
        fetch("/api/org/doctors", {
          cache: "no-store",
        }),
        fetch("/api/org/telemedicine/artifacts", {
          cache: "no-store",
        }),
        fetch("/api/org/telemedicine/queue", {
          cache: "no-store",
        }),
        canReadUsers
          ? fetch("/api/org/users", {
              cache: "no-store",
            })
          : Promise.resolve(null),
        canReadPatients
          ? fetch("/api/org/patients?limit=300", {
              cache: "no-store",
            })
          : Promise.resolve(null),
      ]);

      const docsData = await readJsonResponse(docsRes);
      const artifactsData = await readJsonResponse(
        artifactsRes
      );
      const queueData = await readJsonResponse(queueRes);
      const usersData = usersRes
        ? await readJsonResponse(usersRes)
        : null;
      const patientsData = patientsRes
        ? await readJsonResponse(patientsRes)
        : null;

      const errors: string[] = [];

      if (docsRes.ok)
        setDoctors(Array.isArray(docsData) ? docsData : []);
      else {
        setDoctors([]);
        errors.push(
          getErrorMessage(docsData, "Unable to load practitioners")
        );
      }

      if (usersRes && usersRes.ok) {
        setOrgUsers(
          Array.isArray(usersData)
            ? (usersData as OrgUser[])
            : []
        );
      } else {
        setOrgUsers([]);
      }

      if (artifactsRes.ok)
        setArtifacts(
          Array.isArray(artifactsData)
            ? artifactsData
            : []
        );
      else {
        setArtifacts([]);
        errors.push(
          getErrorMessage(
            artifactsData,
            "Unable to load telemedicine artifacts"
          )
        );
      }

      if (queueRes.ok) {
        setQueueSessions(
          Array.isArray(queueData)
            ? (queueData as QueueSession[])
            : []
        );
      } else {
        setQueueSessions([]);
        errors.push(
          getErrorMessage(
            queueData,
            "Unable to load telemedicine queue"
          )
        );
      }

      if (patientsRes && patientsRes.ok) {
        setPatients(
          Array.isArray(patientsData)
            ? (patientsData as Patient[])
            : []
        );
      } else {
        setPatients([]);
      }

      setLoadingError(errors.join(" • "));
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    doctors,
    orgUsers,
    queueSessions,
    patients,
    artifacts,
    messages,
    loading,
    loadingError,
    orgMe,
    loadData,
    setArtifacts,
    setMessages,
  };
}

export function useSpeechRecognition(
  onTranscript: (text: string) => void,
  onError: (error: string) => void
) {
  const [isListening, setIsListening] = useState(
    false
  );
  const [recognition, setRecognition] = useState<
    BrowserSpeechRecognition | null
  >(null);

  const start = () => {
    const speechWindow = window as Window & {
      SpeechRecognition?: new () => BrowserSpeechRecognition;
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    };

    const SpeechRecognitionCtor =
      typeof window !== "undefined"
        ? speechWindow.SpeechRecognition ||
          speechWindow.webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognitionCtor) {
      onError(
        "Browser speech recognition is unavailable. You can still add manual transcript lines."
      );
      return;
    }

    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }

    const rec = new SpeechRecognitionCtor();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onresult = (event) => {
      for (
        let idx = event.resultIndex;
        idx < event.results.length;
        idx += 1
      ) {
        const result = event.results[idx];
        if (!result?.isFinal) continue;

        const text = String(
          result[0]?.transcript || ""
        ).trim();
        if (!text) continue;

        onTranscript(text);
      }
    };

    rec.onerror = (event) => {
      onError(
        `AI scribe stopped: ${String(
          event?.error || "speech recognition error"
        )}`
      );
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.start();
    setRecognition(rec);
    setIsListening(true);
  };

  const stop = () => {
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }
    setIsListening(false);
  };

  return { isListening, start, stop };
}