"use client";

import { useEffect, useRef } from "react";
import type { EventoSSE } from "@/lib/types";

const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL ?? "http://localhost:3000";

export function useSSE(onEvent: (ev: EventoSSE) => void, enabled = true) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled) return;

    let es: EventSource | null = null;
    let retryDelay = 2_000;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;

    function connect() {
      if (destroyed) return;
      es = new EventSource(`${BFF_URL}/events`, { withCredentials: true });

      es.onopen = () => {
        retryDelay = 2_000;
      };

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data as string) as EventoSSE;
          onEventRef.current(data);
        } catch {
          // mensagem malformada — ignora
        }
      };

      es.onerror = () => {
        es?.close();
        es = null;
        if (!destroyed) {
          reconnectTimer = setTimeout(() => {
            retryDelay = Math.min(retryDelay * 2, 30_000);
            connect();
          }, retryDelay);
        }
      };
    }

    connect();

    return () => {
      destroyed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [enabled]);
}
