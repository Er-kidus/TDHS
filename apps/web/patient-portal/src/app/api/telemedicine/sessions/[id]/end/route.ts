import { proxyPatch } from "@/lib/patientApiProxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyPatch(
    `/telemedicine/sessions/${encodeURIComponent(id)}/end`,
    request
  );
}
