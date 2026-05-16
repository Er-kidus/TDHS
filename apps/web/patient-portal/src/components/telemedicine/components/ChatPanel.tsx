'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, Send } from 'lucide-react';

type Message = {
  id: string;
  sender: string;
  channel: string;
  content: string;
  created_at?: string;
};

type ChatPanelProps = {
  chatChannel: string;
  displayName: string;
  messages: Message[];
  onMessagesUpdate: (msgs: Message[]) => void;
  /** Set to true while the call is live — enables auto-polling every 5 s */
  autoRefresh?: boolean;
};

export default function ChatPanel({
  chatChannel,
  displayName,
  messages,
  onMessagesUpdate,
  autoRefresh = true,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sendError, setSendError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch messages ─────────────────────────────────────────────────────

  const fetchMessages = useCallback(async (quiet = false) => {
    if (!chatChannel) return;
    if (!quiet) setRefreshing(true);
    try {
      const res = await fetch(
        `/api/messages?limit=100&channel=${encodeURIComponent(chatChannel)}`,
        { cache: 'no-store' }
      );
      if (!res.ok) return;
      const data = await res.json() as Message[];
      onMessagesUpdate(Array.isArray(data) ? data : []);
    } catch { /* ignore network blips */ } finally {
      if (!quiet) setRefreshing(false);
    }
  }, [chatChannel, onMessagesUpdate]);

  // Initial load
  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  // Auto-poll every 5 s while active
  useEffect(() => {
    if (!autoRefresh || !chatChannel) return;
    pollingRef.current = setInterval(() => void fetchMessages(true), 5000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [autoRefresh, chatChannel, fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // ── Send ───────────────────────────────────────────────────────────────

  async function send() {
    const text = input.trim();
    if (!text || !chatChannel || sending) return;
    setSending(true);
    setSendError('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: displayName || 'Patient',
          channel: chatChannel,
          content: text,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error ?? 'Unable to send message');
      }
      setInput('');
      await fetchMessages();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Unable to send message');
    } finally {
      setSending(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-white">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </p>
        <button
          type="button"
          onClick={() => void fetchMessages()}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/60 p-3">
        {messages.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender === displayName;
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                    isOwn
                      ? 'bg-cyan-600 text-white'
                      : 'border border-white/10 bg-slate-800 text-slate-100'
                  }`}
                >
                  {!isOwn && (
                    <p className="mb-1 text-[10px] font-semibold text-slate-400">{msg.sender}</p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  {msg.created_at && (
                    <p className={`mt-1 text-[10px] ${isOwn ? 'text-cyan-200' : 'text-slate-500'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {sendError && (
        <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {sendError}
        </p>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
          placeholder="Type a message…"
          disabled={sending}
          className="flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={sending || !input.trim()}
          className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
