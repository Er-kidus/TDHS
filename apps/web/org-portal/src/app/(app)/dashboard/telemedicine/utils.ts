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

    const isLoopback =
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "localhost";

    if (
      isLoopback &&
      typeof window !== "undefined"
    ) {
      parsed.hostname = window.location.hostname;
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