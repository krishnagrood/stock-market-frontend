import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export const connectSocket = (callback) => {
  const wsBase = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, "")
    : "http://localhost:8080";
  const socket = new SockJS(`${wsBase}/ws`);

  const client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    onConnect: () => {
      client.subscribe("/topic/stocks", (msg) => {
        callback(JSON.parse(msg.body));
      });
    },
  });

  client.activate();
};
