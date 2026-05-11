"use client";

import { useEffect, useRef, useState } from "react";

export type NotificationEvent = {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
};

export function useNotificationsSocket(url?: string) {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!url) return;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as NotificationEvent;
        setEvents((prev) => [payload, ...prev].slice(0, 50));
      } catch {
        // ignore malformed events
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [url]);

  return { connected, events };
}
