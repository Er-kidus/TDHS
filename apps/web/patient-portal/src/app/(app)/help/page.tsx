import { LifeBuoy, MessageSquare } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Help & Support</h1>
        <p className="text-sm text-muted-foreground mt-1">Find answers quickly or contact our care support team.</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
        <h2 className="font-semibold">Frequently Asked Questions</h2>
        {[
          "How do I reschedule my appointment?",
          "How can I download my lab report?",
          "How do I enable two-factor authentication?",
        ].map((faq) => (
          <details key={faq} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <summary className="cursor-pointer font-medium">{faq}</summary>
            <p className="text-muted-foreground mt-2">Open the relevant module and use the action buttons displayed on each record.</p>
          </details>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-semibold inline-flex items-center gap-2"><LifeBuoy className="h-4 w-4 text-primary" /> Contact Support</h3>
          <form className="space-y-2 mt-3">
            <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Subject" />
            <textarea rows={4} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Describe your issue" />
            <button className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90">Send Request</button>
          </form>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-semibold inline-flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> Live Chat</h3>
          <p className="text-sm text-muted-foreground mt-2">Support agents are online 24/7 for urgent account and care-flow issues.</p>
          <button className="mt-4 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">Start Live Chat</button>
        </div>
      </section>
    </div>
  );
}
