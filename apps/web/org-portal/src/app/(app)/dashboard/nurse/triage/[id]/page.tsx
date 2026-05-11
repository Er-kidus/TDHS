import { TriageFormClient } from '@/components/triage/TriageFormClient';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TriageFormPage({ params }: PageProps) {
  const { id } = await params;
  return <TriageFormClient appointmentId={id} />;
}
