import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from './config';

// Usamos globalThis para que el socket sobreviva al Fast Refresh de Metro/React.
// Sin esto, cada hot-reload crea una conexión nueva y deja la vieja abierta (zombi).
declare global {
  var __unoSocket: Socket | undefined;
}

export function getSocket(): Socket {
  if (!globalThis.__unoSocket) {
    globalThis.__unoSocket = io(SERVER_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: 5,
    });
  }
  return globalThis.__unoSocket;
}