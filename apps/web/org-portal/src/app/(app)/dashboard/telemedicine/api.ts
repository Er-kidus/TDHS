import { ApiPayload } from "./types";

export async function readJsonResponse(
  response: Response
): Promise<ApiPayload> {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function getErrorMessage(
  payload: ApiPayload,
  fallback: string
): string {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload
  ) {
    const error = payload.error;

    if (
      typeof error === "string" &&
      error.trim()
    ) {
      return error;
    }
  }

  if (
    typeof payload === "string" &&
    payload.trim()
  ) {
    return payload;
  }

  return fallback;
}