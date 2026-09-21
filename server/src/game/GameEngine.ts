import { Card, CardColor, GameState, Player } from '../types';
import { drawCards } from './Deck';
import { canPlay, isWild } from './Card';

const MAX_PLAYERS = 4;
const MIN_PLAYERS = 2;
const INITIAL_HAND_SIZE = 7;

export class GameEngine {
  static addPlayer(state: GameState, id: string, name: string): GameState {
    if (state.players.some((p) => p.id === id)) return state;
    if (state.players.length >= MAX_PLAYERS) throw new Error('La sala está llena (máximo 4 jugadores)');
    if (state.phase !== 'WAITING_PLAYERS') throw new Error('La partida ya comenzó');
    const player: Player = { id, name, hand: [], connected: true, saidUno: false, wins: 0 };
    return { ...state, players: [...state.players, player] };
  }

  static removePlayer(state: GameState, id: string): GameState {
    return { ...state, players: state.players.map((p) => (p.id === id ? { ...p, connected: false } : p)) };
  }

  static startGame(state: GameState): GameState {
    if (state.players.length < MIN_PLAYERS) throw new Error(`Se necesitan al menos ${MIN_PLAYERS} jugadores`);
    return this.dealNewRound(state);
  }

  // Reparte un mazo nuevo manteniendo jugadores y su contador de victorias
  private static dealNewRound(state: GameState): GameState {
    let deck = [...state.deck.length ? state.deck : []];
    // Si el mazo quedó corto (de la partida anterior), se regenera desde cero
    if (deck.length < state.players.length * INITIAL_HAND_SIZE + 10) {
      deck = require('./Deck').buildFullDeck();
    }

    const players = state.players.map((p) => {
      const { drawn, deck: newDeck } = drawCards(deck, [], INITIAL_HAND_SIZE);
      deck = newDeck;
      return { ...p, hand: drawn, saidUno: false };
    });

    let firstCard: Card;
    do {
      const { drawn, deck: newDeck } = drawCards(deck, [], 1);
      deck = newDeck;
      firstCard = drawn[0];
      if (firstCard.value === 'wild4') deck.unshift(firstCard);
    } while (firstCard.value === 'wild4');

    return {
      ...state,
      players,
      deck,
      discardPile: [firstCard],
      currentColor: firstCard.color === 'wild' ? 'red' : firstCard.color,
      currentPlayerIndex: 0,
      direction: 1,
      phase: 'PLAYING',
      winnerId: null,
      rematchVotes: {},
    };
  }

  static playCard(state: GameState, playerId: string, cardId: string, chosenColor?: CardColor): GameState {
    const playerIndex = state.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== state.currentPlayerIndex) throw new Error('No es tu turno');

    const player = state.players[playerIndex];
    const card = player.hand.find((c) => c.id === cardId);
    if (!card) throw new Error('No tienes esa carta');

    const topCard = state.discardPile[state.discardPile.length - 1];
    if (!canPlay(card, topCard, state.currentColor)) throw new Error('Esa carta no se puede jugar ahora');
    if (isWild(card) && !chosenColor) throw new Error('Debes elegir un color para el comodín');

    const newHand = player.hand.filter((c) => c.id !== cardId);
    let players = [...state.players];
    players[playerIndex] = { ...player, hand: newHand, saidUno: newHand.length === 1 ? player.saidUno : false };

    let newState: GameState = {
      ...state,
      players,
      discardPile: [...state.discardPile, card],
      currentColor: isWild(card) ? (chosenColor as Exclude<CardColor, 'wild'>) : (card.color as Exclude<CardColor, 'wild'>),
    };

    if (newHand.length === 0) {
      const withWin = players.map((p) => (p.id === playerId ? { ...p, wins: p.wins + 1 } : p));
      return { ...newState, players: withWin, phase: 'GAME_OVER', winnerId: playerId, rematchVotes: {} };
    }

    return this.applyCardEffect(newState, card);
  }

  private static applyCardEffect(state: GameState, card: Card): GameState {
    let next = { ...state };
    switch (card.value) {
      case 'skip':
        next = this.advanceTurn(next, 2);
        break;
      case 'reverse':
        next = { ...next, direction: next.direction === 1 ? -1 : 1 };
        next = this.advanceTurn(next, next.players.length === 2 ? 2 : 1);
        break;
      case 'draw2':
        next = this.forceDraw(next, 2);
        next = this.advanceTurn(next, 2);
        break;
      case 'wild4':
        next = this.forceDraw(next, 4);
        next = this.advanceTurn(next, 2);
        break;
      default:
        next = this.advanceTurn(next, 1);
    }
    return next;
  }

  private static advanceTurn(state: GameState, steps: number): GameState {
    const n = state.players.length;
    let idx = state.currentPlayerIndex;
    for (let i = 0; i < steps; i++) idx = (idx + state.direction + n) % n;
    return { ...state, currentPlayerIndex: idx };
  }

  private static forceDraw(state: GameState, count: number): GameState {
    const n = state.players.length;
    const targetIndex = (state.currentPlayerIndex + state.direction + n) % n;
    const { drawn, deck, discardPile } = drawCards(state.deck, state.discardPile, count);
    const players = [...state.players];
    players[targetIndex] = { ...players[targetIndex], hand: [...players[targetIndex].hand, ...drawn] };
    return { ...state, players, deck, discardPile };
  }

  static drawCard(state: GameState, playerId: string): GameState {
    const playerIndex = state.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== state.currentPlayerIndex) throw new Error('No es tu turno');
    const { drawn, deck, discardPile } = drawCards(state.deck, state.discardPile, 1);
    const players = [...state.players];
    players[playerIndex] = { ...players[playerIndex], hand: [...players[playerIndex].hand, ...drawn] };
    return this.advanceTurn({ ...state, players, deck, discardPile }, 1);
  }

  static sayUno(state: GameState, playerId: string): GameState {
    return {
      ...state,
      players: state.players.map((p) => (p.id === playerId && p.hand.length === 1 ? { ...p, saidUno: true } : p)),
    };
  }

  // Vota revancha. Si alguien rechaza, la serie termina de inmediato (resumen).
  // Si todos los conectados aceptan, arranca una ronda nueva conservando victorias.
  static voteRematch(state: GameState, playerId: string, accept: boolean): GameState {
    if (state.phase !== 'GAME_OVER') return state;

    if (!accept) {
      return { ...state, phase: 'SERIES_OVER' };
    }

    const rematchVotes = { ...state.rematchVotes, [playerId]: true };
    const connectedPlayers = state.players.filter((p) => p.connected);
    const allAccepted = connectedPlayers.every((p) => rematchVotes[p.id]);

    if (allAccepted) {
      return this.dealNewRound({ ...state, rematchVotes: {} });
    }

    return { ...state, rematchVotes };
  }
}