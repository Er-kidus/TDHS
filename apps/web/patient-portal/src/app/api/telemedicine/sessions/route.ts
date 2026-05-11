import { proxyGet, proxyPost } from "@/lib/patientApiProxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  return proxyGet(`/telemedicine/sessions?${url.searchParams.toString()}`);
}

export async function POST(request: Request) {
  return proxyPost("/telemedicine/sessions", request);
}
