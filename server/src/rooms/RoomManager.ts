import { nanoid } from 'nanoid';
import { GameState } from '../types';
import { createInitialState } from '../game/GameState';

class RoomManagerClass {
  private rooms = new Map<string, GameState>();

  createRoom(): string {
    const roomId = nanoid(6).toUpperCase();
    this.rooms.set(roomId, createInitialState(roomId));
    return roomId;
  }

  getRoom(roomId: string): GameState | undefined {
    return this.rooms.get(roomId);
  }

  setRoom(roomId: string, state: GameState): void {
    this.rooms.set(roomId, state);
  }

  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }

  // Limpia salas vacías (llamar periódicamente o en cada desconexión)
  cleanupEmptyRooms(): void {
    for (const [roomId, state] of this.rooms.entries()) {
      const anyoneConnected = state.players.some((p) => p.connected);
      if (!anyoneConnected) this.rooms.delete(roomId);
    }
  }
}

export const RoomManager = new RoomManagerClass();