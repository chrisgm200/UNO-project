"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
const RoomManager_1 = require("../rooms/RoomManager");
const GameEngine_1 = require("../game/GameEngine");
const GameState_1 = require("../game/GameState");
function broadcastState(io, roomId) {
    const state = RoomManager_1.RoomManager.getRoom(roomId);
    if (!state)
        return;
    for (const player of state.players) {
        io.to(player.id).emit('stateUpdate', (0, GameState_1.toPublicState)(state, player.id));
    }
}
function registerSocketHandlers(io, socket) {
    socket.on('createRoom', (playerName, cb) => {
        const roomId = RoomManager_1.RoomManager.createRoom();
        let state = RoomManager_1.RoomManager.getRoom(roomId);
        state = GameEngine_1.GameEngine.addPlayer(state, socket.id, playerName);
        RoomManager_1.RoomManager.setRoom(roomId, state);
        socket.join(roomId);
        cb(roomId);
        broadcastState(io, roomId);
    });
    socket.on('joinRoom', ({ roomId, playerName }, cb) => {
        try {
            let state = RoomManager_1.RoomManager.getRoom(roomId);
            if (!state)
                return cb(false, 'La sala no existe');
            state = GameEngine_1.GameEngine.addPlayer(state, socket.id, playerName);
            RoomManager_1.RoomManager.setRoom(roomId, state);
            socket.join(roomId);
            cb(true);
            socket.to(roomId).emit('playerJoined', playerName);
            broadcastState(io, roomId);
        }
        catch (err) {
            cb(false, err.message);
        }
    });
    socket.on('startGame', (roomId) => {
        try {
            let state = RoomManager_1.RoomManager.getRoom(roomId);
            if (!state)
                return;
            state = GameEngine_1.GameEngine.startGame(state);
            RoomManager_1.RoomManager.setRoom(roomId, state);
            broadcastState(io, roomId);
        }
        catch (err) {
            socket.emit('errorMessage', err.message);
        }
    });
    socket.on('playCard', ({ roomId, cardId, chosenColor }) => {
        try {
            let state = RoomManager_1.RoomManager.getRoom(roomId);
            if (!state)
                return;
            state = GameEngine_1.GameEngine.playCard(state, socket.id, cardId, chosenColor);
            RoomManager_1.RoomManager.setRoom(roomId, state);
            broadcastState(io, roomId);
            if (state.phase === 'GAME_OVER' && state.winnerId) {
                const winner = state.players.find((p) => p.id === state.winnerId);
                io.to(roomId).emit('gameOver', winner?.name ?? 'Jugador');
            }
        }
        catch (err) {
            socket.emit('errorMessage', err.message);
        }
    });
    socket.on('drawCard', (roomId) => {
        try {
            let state = RoomManager_1.RoomManager.getRoom(roomId);
            if (!state)
                return;
            state = GameEngine_1.GameEngine.drawCard(state, socket.id);
            RoomManager_1.RoomManager.setRoom(roomId, state);
            broadcastState(io, roomId);
        }
        catch (err) {
            socket.emit('errorMessage', err.message);
        }
    });
    socket.on('sayUno', (roomId) => {
        let state = RoomManager_1.RoomManager.getRoom(roomId);
        if (!state)
            return;
        state = GameEngine_1.GameEngine.sayUno(state, socket.id);
        RoomManager_1.RoomManager.setRoom(roomId, state);
        broadcastState(io, roomId);
    });
    socket.on('disconnect', () => {
        for (const [roomId, state] of RoomManager_1.RoomManager.rooms.entries()) {
            const isInRoom = state.players.some((p) => p.id === socket.id);
            if (isInRoom) {
                const player = state.players.find((p) => p.id === socket.id);
                const newState = GameEngine_1.GameEngine.removePlayer(state, socket.id);
                RoomManager_1.RoomManager.setRoom(roomId, newState);
                socket.to(roomId).emit('playerLeft', player?.name ?? 'Jugador');
                broadcastState(io, roomId);
            }
        }
        RoomManager_1.RoomManager.cleanupEmptyRooms();
    });
}
