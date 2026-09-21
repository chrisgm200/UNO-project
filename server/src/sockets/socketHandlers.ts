import { Server, Socket } from 'socket.io';
import { RoomManager } from '../rooms/RoomManager';
import { GameEngine } from '../game/GameEngine';
import { toPublicState } from '../game/GameState';
import { ClientToServerEvents, ServerToClientEvents } from '../types';

function broadcastState(io: Server, roomId: string) {
  const state = RoomManager.getRoom(roomId);
  if (!state) return;
  for (const player of state.players) {
    io.to(player.id).emit('stateUpdate', toPublicState(state, player.id));
  }
}

export function registerSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>
) {
  socket.on('createRoom', (playerName, cb) => {
    const roomId = RoomManager.createRoom();
    let state = RoomManager.getRoom(roomId)!;
    state = GameEngine.addPlayer(state, socket.id, playerName);
    RoomManager.setRoom(roomId, state);
    socket.join(roomId);
    cb(roomId);
    broadcastState(io, roomId);
  });

  socket.on('joinRoom', ({ roomId, playerName }, cb) => {
    try {
      let state = RoomManager.getRoom(roomId);
      if (!state) return cb(false, 'La sala no existe');

      state = GameEngine.addPlayer(state, socket.id, playerName);
      RoomManager.setRoom(roomId, state);
      socket.join(roomId);
      cb(true);
      socket.to(roomId).emit('playerJoined', playerName);
      broadcastState(io, roomId);
    } catch (err: any) {
      cb(false, err.message);
    }
  });

  socket.on('startGame', (roomId) => {
    try {
      let state = RoomManager.getRoom(roomId);
      if (!state) return;
      state = GameEngine.startGame(state);
      RoomManager.setRoom(roomId, state);
      broadcastState(io, roomId);
    } catch (err: any) {
      socket.emit('errorMessage', err.message);
    }
  });

  socket.on('playCard', ({ roomId, cardId, chosenColor }) => {
    try {
      let state = RoomManager.getRoom(roomId);
      if (!state) return;
      state = GameEngine.playCard(state, socket.id, cardId, chosenColor);
      RoomManager.setRoom(roomId, state);
      broadcastState(io, roomId);

      if (state.phase === 'GAME_OVER' && state.winnerId) {
        const winner = state.players.find((p) => p.id === state.winnerId);
        io.to(roomId).emit('gameOver', winner?.name ?? 'Jugador');
      }
    } catch (err: any) {
      socket.emit('errorMessage', err.message);
    }
  });

  socket.on('drawCard', (roomId) => {
    try {
      let state = RoomManager.getRoom(roomId);
      if (!state) return;
      state = GameEngine.drawCard(state, socket.id);
      RoomManager.setRoom(roomId, state);
      broadcastState(io, roomId);
    } catch (err: any) {
      socket.emit('errorMessage', err.message);
    }
  });

  socket.on('sayUno', (roomId) => {
    let state = RoomManager.getRoom(roomId);
    if (!state) return;
    state = GameEngine.sayUno(state, socket.id);
    RoomManager.setRoom(roomId, state);
    broadcastState(io, roomId);
  });

  socket.on('disconnect', () => {
    for (const [roomId, state] of (RoomManager as any).rooms.entries()) {
      const isInRoom = state.players.some((p: any) => p.id === socket.id);
      if (isInRoom) {
        const player = state.players.find((p: any) => p.id === socket.id);
        const newState = GameEngine.removePlayer(state, socket.id);
        RoomManager.setRoom(roomId, newState);
        socket.to(roomId).emit('playerLeft', player?.name ?? 'Jugador');
        broadcastState(io, roomId);
      }
    }
    RoomManager.cleanupEmptyRooms();
  });
  
  socket.on('voteRematch', ({ roomId, accept }) => {
  let state = RoomManager.getRoom(roomId);
  if (!state) return;
  state = GameEngine.voteRematch(state, socket.id, accept);
  RoomManager.setRoom(roomId, state);
  broadcastState(io, roomId);
  });
}