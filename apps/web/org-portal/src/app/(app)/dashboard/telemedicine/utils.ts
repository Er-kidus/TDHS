import { TranscriptLine } from "./types";

export function isPrivateOrLoopbackHost(
  hostname: string
): boolean {
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  ) {
    return true;
  }

  const match = hostname.match(
    /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  );

  if (!match) return false;

  const a = Number(match[1]);
  const b = Number(match[2]);

  if (a === 10) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31)
    return true;
  if (a === 127) return true;

  return false;
}

export function normalizeLiveKitServerUrl(
  rawUrl: string
): string {
  if (!rawUrl) return rawUrl;

  try {
    const parsed = new URL(rawUrl);

    // Replace ANY local/private IP (including 10.x, 192.168.x, 172.16-31.x, loopback)
    // with the browser's actual hostname. This makes the URL correct regardless of
    // which NIC the dev machine is using or whether the configured IP has changed.
    const isLocalOrPrivate =
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "localhost" ||
      isPrivateOrLoopbackHost(parsed.hostname);

    if (isLocalOrPrivate && typeof window !== "undefined") {
      const isNgrok = window.location.hostname.includes("ngrok");
      parsed.hostname = window.location.hostname;
      
      if (isNgrok) {
        parsed.protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        parsed.port = window.location.port;
        let path = parsed.pathname === '/' ? '' : parsed.pathname;
        if (!path.startsWith('/livekit')) {
          path = '/livekit' + path;
        }
        if (!path.endsWith('/')) {
          path += '/';
        }
        parsed.pathname = path;
      } else if (window.location.protocol === "https:") {
        parsed.protocol = "wss:";
      }
    }

    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

export function stripLiveKitProxyPath(
  rawUrl: string
): string {
  if (!rawUrl) return rawUrl;

  try {
    const parsed = new URL(rawUrl);

    if (typeof window !== "undefined" && window.location.hostname.includes("ngrok")) {
      return parsed.toString();
    }

    if (
      parsed.pathname.startsWith("/livekit")
    ) {
      parsed.pathname =
        parsed.pathname.replace(
          /^\/livekit(?=\/|$)/,
          ""
        ) || "/";
    }

    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

export function parseSymptoms(
  raw: string
): string[] {
  return raw
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildTranscript(
  transcriptLines: TranscriptLine[],
  fallback: string
): string {
  if (transcriptLines.length > 0) {
    return transcriptLines
      .map(
        (line) =>
          `${new Date(line.createdAt).toLocaleTimeString()} ${line.speaker}: ${line.text}`
      )
      .join("\n");
  }

  return fallback.trim();
}

export function buildDoctorNotes(
  roomNotes: string,
  possibleSolutions: string
): string {
  const sections = [
    roomNotes.trim(),
    possibleSolutions.trim()
      ? `Possible solutions:\n${possibleSolutions.trim()}`
      : "",
  ].filter(Boolean);

  return sections.join("\n\n");
}

export function buildAiDraftSummary(
  roomNotes: string,
  symptomsInput: string,
  possibleSolutions: string
): string {
  const segments = [
    roomNotes.trim(),
    symptomsInput.trim(),
    possibleSolutions.trim(),
  ].filter(Boolean);

  return segments.length > 0
    ? segments.join("\n\n")
    : "Draft a concise encounter summary, confirm the plan, then save to the chart.";
}