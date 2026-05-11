import { proxyPost } from "@/lib/patientApiProxy";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return proxyPost(`/telemedicine/sessions/${encodeURIComponent(id)}/summary`, request);
}
