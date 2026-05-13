import React, { useEffect, useMemo, useState } from 'react';
import { Textarea } from '../../ui/textarea';
import { useDataChannel } from '@livekit/components-react';

type TelemedicineMessage = {
  id: string;
  sender: string;
  channel: string;
  content: string;
  created_at?: string;
};

export default function ChatPanel({
  chatChannel,
  displayName,
  messages,
  onMessagesUpdate,
}: {
  chatChannel: string;
  displayName: string;
  messages: TelemedicineMessage[];
  onMessagesUpdate: (next: TelemedicineMessage[]) => void;
}) {
  const [input, setInput] = useState('');
  const { send, message } = useDataChannel(chatChannel, (msg) => {
    // handled by hook; callback kept for typings
  }) as any;

  useEffect(() => {
    if (!message) return;
    try {
      const text = new TextDecoder().decode(message.data || new Uint8Array());
      const parsed = JSON.parse(text);
      if (parsed && parsed.channel === chatChannel) {
        onMessagesUpdate([...messages, parsed]);
      }
    } catch {
      // ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const payload = {
      id: `local-${Date.now()}`,
      sender: displayName || 'Patient',
      channel: chatChannel,
      content: trimmed,
      created_at: new Date().toISOString(),
    } as TelemedicineMessage;
    // optimistic update
    onMessagesUpdate([...messages, payload]);
    setInput('');
    try {
      if (send) {
        const encoder = new TextEncoder();
        await send(encoder.encode(JSON.stringify(payload)), { topic: chatChannel });
      }
      // persist to server for history
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null);
    } catch (err) {
      // ignore send errors silently; messages remain optimistically shown
    }
  }

  const lastItems = useMemo(() => messages.slice(-100), [messages]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 rounded-3xl border border-border bg-card p-4 text-card-foreground">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Live chat</p>
          <p className="text-sm text-muted-foreground">Messages sync in real time while the call is active.</p>
        </div>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-[11px] text-muted-foreground">
          {lastItems.length} messages
        </span>
      </div>

      <div className="max-h-[55vh] flex-1 space-y-3 overflow-y-auto rounded-2xl border border-border bg-background p-3">
        {lastItems.map((messageItem) => (
          <article key={messageItem.id} className="rounded-2xl border border-border bg-card px-3 py-2 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-foreground">{messageItem.sender}</p>
              {messageItem.created_at ? <p className="text-[11px] text-muted-foreground">{new Date(messageItem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p> : null}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{messageItem.content}</p>
          </article>
        ))}
        {lastItems.length === 0 ? <p className="text-sm text-muted-foreground">No messages yet for this session.</p> : null}
      </div>
      <div className="flex gap-2">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-20 flex-1 border-border bg-background text-foreground placeholder:text-muted-foreground" placeholder="Type a message to the care team..." />
        <button type="button" onClick={() => void handleSend()} disabled={!input.trim()} className="self-end rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">Send</button>
      </div>
    </div>
  );
}
