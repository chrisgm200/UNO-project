"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
const nanoid_1 = require("nanoid");
const GameState_1 = require("../game/GameState");
class RoomManagerClass {
    constructor() {
        this.rooms = new Map();
    }
    createRoom() {
        const roomId = (0, nanoid_1.nanoid)(6).toUpperCase();
        this.rooms.set(roomId, (0, GameState_1.createInitialState)(roomId));
        return roomId;
    }
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    setRoom(roomId, state) {
        this.rooms.set(roomId, state);
    }
    deleteRoom(roomId) {
        this.rooms.delete(roomId);
    }
    // Limpia salas vacías (llamar periódicamente o en cada desconexión)
    cleanupEmptyRooms() {
        for (const [roomId, state] of this.rooms.entries()) {
            const anyoneConnected = state.players.some((p) => p.connected);
            if (!anyoneConnected)
                this.rooms.delete(roomId);
        }
    }
}
exports.RoomManager = new RoomManagerClass();
