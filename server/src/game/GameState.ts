import { GameState, PublicGameState } from '../types';
import { buildFullDeck } from './Deck';

export function createInitialState(roomId: string): GameState {
  return {
    roomId,
    players: [],
    deck: buildFullDeck(),
    discardPile: [],
    currentPlayerIndex: 0,
    direction: 1,
    currentColor: 'red',
    phase: 'WAITING_PLAYERS',
    winnerId: null,
    pendingDrawCount: 0,
    rematchVotes: {}, // ← nuevo
  };
}

export function toPublicState(state: GameState, forPlayerId: string): PublicGameState {
  const me = state.players.find((p) => p.id === forPlayerId);

  return {
    roomId: state.roomId,
    players: state.players.map((p) => ({
      id: p.id,
      name: p.name,
      cardCount: p.hand.length,
      connected: p.connected,
      saidUno: p.saidUno,
      wins: p.wins, // ← nuevo
    })),
    myHand: me ? me.hand : [],
    topCard: state.discardPile[state.discardPile.length - 1] ?? null,
    currentColor: state.currentColor,
    currentPlayerIndex: state.currentPlayerIndex,
    direction: state.direction,
    phase: state.phase,
    winnerId: state.winnerId,
    deckCount: state.deck.length,
    rematchAccepted: Object.keys(state.rematchVotes).filter((id) => state.rematchVotes[id]), // ← nuevo
  };
}