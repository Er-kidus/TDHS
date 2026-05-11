export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  "http://localhost:8000";

export class BackendRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "BackendRequestError";
    this.status = status;
  }
}

export async function backendFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  let res: Response;

  try {
    res = await fetch(url, {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(init.headers ?? {}),
        ...(init.method && init.method !== "GET"
          ? { "Content-Type": "application/json" }
          : {}),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(
      `Backend request failed. Is the API gateway running at ${API_BASE_URL}? (${message})`
    );
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;

    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // ignore JSON parse errors
    }

    throw new BackendRequestError(res.status, message);
  }

  return res;
}
