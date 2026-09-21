import { useEffect, useRef, useState, useCallback } from 'react';
import { getSocket } from '../socket';
import { CardColor, PublicGameState } from '../types';

export function useGameSocket() {
  const socketRef = useRef(getSocket());
  const [state, setState] = useState<PublicGameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(() => socketRef.current.connected); // ← clave: lee el estado ACTUAL, no asume false

  useEffect(() => {
    const socket = socketRef.current;

    // Si ya estaba conectado antes de este mount, sincroniza de inmediato
    if (socket.connected) setConnected(true);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onState = (s: PublicGameState) => setState(s);
    const onError = (msg: string) => setError(msg);
    const onConnectError = (err: Error) => {
      console.error('SOCKET CONNECT ERROR:', err.message);
      setError(`No se pudo conectar al servidor: ${err.message}`);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('stateUpdate', onState);
    socket.on('errorMessage', onError);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('stateUpdate', onState);
      socket.off('errorMessage', onError);
      socket.off('connect_error', onConnectError);
    };
  }, []);

  const createRoom = useCallback((playerName: string): Promise<string> => {
    return new Promise((resolve) => {
      socketRef.current.emit('createRoom', playerName, (roomId: string) => resolve(roomId));
    });
  }, []);

  const joinRoom = useCallback((roomId: string, playerName: string): Promise<{ ok: boolean; error?: string }> => {
    return new Promise((resolve) => {
      socketRef.current.emit('joinRoom', { roomId, playerName }, (ok: boolean, err?: string) => {
        resolve({ ok, error: err });
      });
    });
  }, []);

  const startGame = useCallback((roomId: string) => {
    socketRef.current.emit('startGame', roomId);
  }, []);

  const playCard = useCallback((roomId: string, cardId: string, chosenColor?: CardColor) => {
    socketRef.current.emit('playCard', { roomId, cardId, chosenColor });
  }, []);

  const drawCard = useCallback((roomId: string) => {
    socketRef.current.emit('drawCard', roomId);
  }, []);

  const sayUno = useCallback((roomId: string) => {
    socketRef.current.emit('sayUno', roomId);
  }, []);
  const voteRematch = useCallback((roomId: string, accept: boolean) => {
  socketRef.current.emit('voteRematch', { roomId, accept });
}, []);

  return {
    mySocketId: socketRef.current.id,
    connected,
    state,
    error,
    clearError: () => setError(null),
    createRoom,
    joinRoom,
    startGame,
    playCard,
    drawCard,
    sayUno,
    voteRematch
  };
}