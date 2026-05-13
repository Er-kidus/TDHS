"use client";

import { useState } from "react";
import { TranscriptLine } from "./types";

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