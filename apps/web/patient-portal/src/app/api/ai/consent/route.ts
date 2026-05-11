import { proxyGet, proxyPut } from "@/lib/patientApiProxy";

export async function GET() {
  return proxyGet("/ai/consent");
}

export async function PUT(request: Request) {
  return proxyPut("/ai/consent", request);
}
