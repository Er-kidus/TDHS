import { proxyGet } from "@/lib/patientApiProxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  return proxyGet(`/care/recurrent-medications?${url.searchParams.toString()}`);
}
