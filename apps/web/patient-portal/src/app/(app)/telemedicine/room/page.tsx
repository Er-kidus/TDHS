import { TelemedicineRoomClient } from "@/components/telemedicine/TelemedicineRoomClient";

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

  return <TelemedicineRoomClient initialSessionId={sessionId} initialDoctorName={doctorName} />;
}
