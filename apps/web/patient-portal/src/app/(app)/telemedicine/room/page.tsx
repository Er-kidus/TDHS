import { redirect } from "next/navigation";

type TelemedicineRoomPageProps = {
  searchParams?: Promise<{
    session_id?: string;
    sessionId?: string;
    doctor_name?: string;
    doctorName?: string;
  }>;
};

export default async function TelemedicineRoomPage({ searchParams }: TelemedicineRoomPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const sessionId = params?.session_id || params?.sessionId || "";
  const doctorName = params?.doctor_name || params?.doctorName || "";
  const query = new URLSearchParams();
  if (sessionId) query.set("session_id", sessionId);
  if (doctorName) query.set("doctor_name", doctorName);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  redirect(`/telemedicine${suffix}`);
}
