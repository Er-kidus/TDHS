import { proxyGet } from "@/lib/patientApiProxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  return proxyGet(`/patient/pharmacies/search?${url.searchParams.toString()}`);
}
