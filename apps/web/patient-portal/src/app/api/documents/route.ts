import { proxyGet, proxyPost } from "@/lib/patientApiProxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  return proxyGet(`/documents?${url.searchParams.toString()}`);
}

export async function POST(request: Request) {
  return proxyPost("/documents", request);
}
