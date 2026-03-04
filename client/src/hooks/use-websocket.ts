import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useAppWebSocket() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const connect = () => {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'order') {
            queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
          } else if (data.type === 'accurate_payment') {
            queryClient.invalidateQueries({ queryKey: [api.accuratePayments.list.path] });
          } else if (data.type === 'bonus_payment') {
            queryClient.invalidateQueries({ queryKey: [api.bonusPayments.list.path] });
          }
        } catch (e) {
          console.error("Failed to parse WS message", e);
        }
      };

      wsRef.current.onclose = () => {
        // Simple reconnect with backoff
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [queryClient]);
}
