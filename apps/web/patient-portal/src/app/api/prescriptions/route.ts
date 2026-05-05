import { proxyGet } from "@/lib/patientApiProxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  return proxyGet(`/prescriptions?${url.searchParams.toString()}`);
}
