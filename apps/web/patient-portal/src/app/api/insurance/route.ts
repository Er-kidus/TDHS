import { proxyGet } from "@/lib/patientApiProxy";

export async function GET() {
  return proxyGet("/insurance");
}
