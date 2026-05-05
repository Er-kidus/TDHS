import { fetchPatientResource } from "@/lib/serverApi";

type MessageItem = {
  id: string;
  sender: string;
  channel: string;
  content: string;
  created_at: string;
};

export default async function MessagesPage() {
  const data = (await fetchPatientResource("/messages?limit=100")) as MessageItem[];
  const messages = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-2">
        {messages.length === 0 ? <p className="text-sm text-muted-foreground">No messages yet.</p> : null}
        {messages.map((msg) => (
          <article key={msg.id} className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-center justify-between">
              <p className="font-medium">{msg.sender}</p>
              <p className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</p>
            </div>
            <p className="text-xs text-muted-foreground">{msg.channel}</p>
            <p className="text-sm mt-2">{msg.content}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
