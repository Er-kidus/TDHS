import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { getPatientAuthHeader } from "@/lib/routeAuth";

function isLoopbackHostname(hostname: string): boolean {
	return hostname === "localhost" || hostname === "127.0.0.1";
}

function isPrivateIPv4(hostname: string): boolean {
	const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
	if (!match) return false;
	const a = Number(match[1]);
	const b = Number(match[2]);
	if (a === 10) return true;
	if (a === 192 && b === 168) return true;
	if (a === 172 && b >= 16 && b <= 31) return true;
	if (a === 127) return true;
	return false;
}

function parseForwardedValue(value: string | null): string {
	if (!value) return "";
	return value.split(",")[0]?.trim() || "";
}

function isInvalidPublicHostname(hostname: string): boolean {
	if (!hostname) return true;
	return hostname === "0.0.0.0" || hostname === "::" || hostname === "[::]";
}

function parseHostHeader(rawHost: string): { host: string; hostname: string } | null {
	const host = rawHost.trim();
	if (!host) return null;
	try {
		const parsed = new URL(`http://${host}`);
		if (isInvalidPublicHostname(parsed.hostname)) return null;
		return { host, hostname: parsed.hostname };
	} catch {
		return null;
	}
}

function getBestRequestHost(request: Request): { host: string; hostname: string } | null {
	const candidates = [
		parseForwardedValue(request.headers.get("x-forwarded-host")),
		parseForwardedValue(request.headers.get("host")),
		parseForwardedValue(request.headers.get("origin")?.replace(/^https?:\/\//, "") || null),
		parseForwardedValue(request.headers.get("referer")?.replace(/^https?:\/\//, "") || null),
	];
	for (const candidate of candidates) {
		const parsed = parseHostHeader(candidate);
		if (parsed) return parsed;
	}
	try {
		const requestUrl = new URL(request.url);
		if (!isInvalidPublicHostname(requestUrl.hostname)) {
			return { host: requestUrl.host, hostname: requestUrl.hostname };
		}
	} catch {
		// Ignore and fall through.
	}
	return null;
}

function getRequestProtocol(request: Request): "http" | "https" {
	const forwardedProto = parseForwardedValue(request.headers.get("x-forwarded-proto")).toLowerCase();
	if (forwardedProto === "https") return "https";
	if (forwardedProto === "http") return "http";
	try {
		return new URL(request.url).protocol === "https:" ? "https" : "http";
	} catch {
		return "http";
	}
}

function getPreferredLiveKitHost(request: Request): string | null {
	try {
		const bestHost = getBestRequestHost(request);
		if (!bestHost || !isPrivateIPv4(bestHost.hostname)) {
			return null;
		}
		const configuredOrigin = (process.env.NEXT_PUBLIC_LOCAL_NETWORK_ORIGIN || "").trim();
		if (configuredOrigin) {
			try {
				const configuredUrl = new URL(configuredOrigin);
				if (isPrivateIPv4(configuredUrl.hostname)) {
					return configuredUrl.hostname;
				}
			} catch {
				// Ignore malformed local network configuration and fall back below.
			}
		}
		return bestHost.hostname;
	} catch {
		// Ignore and fall through.
	}

	return null;
}

function rewriteLiveKitUrlForLan(urlValue: unknown, request: Request): unknown {
	if (typeof urlValue !== "string" || !urlValue.trim()) return urlValue;
	let parsed: URL;
	try {
		parsed = new URL(urlValue);
	} catch {
		return urlValue;
	}
	if (!isLoopbackHostname(parsed.hostname)) return urlValue;
	const preferredHost = getPreferredLiveKitHost(request);
	if (!preferredHost) {
		return urlValue;
	}
	parsed.hostname = preferredHost;
	return parsed.toString();
}

function rewriteLiveKitUrlForHttpsPortal(urlValue: unknown, request: Request): unknown {
	if (typeof urlValue !== "string" || !urlValue.trim()) return urlValue;
	let parsed: URL;
	try {
		parsed = new URL(urlValue);
	} catch {
		return urlValue;
	}
	if (getRequestProtocol(request) !== "https" || parsed.protocol !== "ws:") {
		return urlValue;
	}
	const bestHost = getBestRequestHost(request);
	if (!bestHost) return urlValue;
	return `wss://${bestHost.host}/livekit`;
}

export async function POST(request: Request) {
	try {
		const headers = await getPatientAuthHeader();
		const body = await request.json().catch(() => ({}));
		const res = await backendFetch("/telemedicine/livekit/token", {
			method: "POST",
			headers: {
				...headers,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});
		const data = await res.json().catch(() => ({} as Record<string, unknown>));
		if (data && typeof data === "object") {
			const payload = data as Record<string, unknown>;
			if ("url" in payload) {
				payload.url = rewriteLiveKitUrlForHttpsPortal(rewriteLiveKitUrlForLan(payload.url, request), request);
			}
			if ("serverUrl" in payload) {
				payload.serverUrl = rewriteLiveKitUrlForHttpsPortal(rewriteLiveKitUrlForLan(payload.serverUrl, request), request);
			}
		}
		return NextResponse.json(data, { status: res.status });
	} catch (error) {
		const message = error instanceof Error ? error.message : "failed to issue livekit token";
		const status = message.toLowerCase().includes("not authenticated") || message.toLowerCase().includes("invalid token") ? 401 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}
