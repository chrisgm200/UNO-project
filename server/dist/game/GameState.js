"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitialState = createInitialState;
exports.toPublicState = toPublicState;
const Deck_1 = require("./Deck");
function createInitialState(roomId) {
    return {
        roomId,
        players: [],
        deck: (0, Deck_1.buildFullDeck)(),
        discardPile: [],
        currentPlayerIndex: 0,
        direction: 1,
        currentColor: 'red',
        phase: 'WAITING_PLAYERS',
        winnerId: null,
        pendingDrawCount: 0,
    };
}
// Convierte el estado interno en la versión "segura" para un jugador específico
function toPublicState(state, forPlayerId) {
    const me = state.players.find((p) => p.id === forPlayerId);
    return {
        roomId: state.roomId,
        players: state.players.map((p) => ({
            id: p.id,
            name: p.name,
            cardCount: p.hand.length,
            connected: p.connected,
            saidUno: p.saidUno,
        })),
        myHand: me ? me.hand : [],
        topCard: state.discardPile[state.discardPile.length - 1] ?? null,
        currentColor: state.currentColor,
        currentPlayerIndex: state.currentPlayerIndex,
        direction: state.direction,
        phase: state.phase,
        winnerId: state.winnerId,
        deckCount: state.deck.length,
    };
}
