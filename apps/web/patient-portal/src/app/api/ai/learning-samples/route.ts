import { proxyPost } from "@/lib/patientApiProxy";

export async function POST(request: Request) {
  return proxyPost("/ai/learning-samples", request);
}
