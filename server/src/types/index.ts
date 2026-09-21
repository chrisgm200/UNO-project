export type CardColor = 'red' | 'yellow' | 'green' | 'blue' | 'wild';
export type CardValue =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4';

export interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
}

export interface Player {
  id: string;       // socket.id
  name: string;
  hand: Card[];
  connected: boolean;
  saidUno: boolean;
}

export type GamePhase = 'WAITING_PLAYERS' | 'PLAYING' | 'CHOOSING_COLOR' | 'GAME_OVER';

export interface GameState {
  roomId: string;
  players: Player[];
  deck: Card[];
  discardPile: Card[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  currentColor: Exclude<CardColor, 'wild'>;
  phase: GamePhase;
  winnerId: string | null;
  pendingDrawCount: number; // acumulado por +2 encadenados de la misma familia (sin apilar entre +2 y +4)
}

// Estado "público" que se envía al cliente (oculta las manos de los demás)
export interface PublicPlayer {
  id: string;
  name: string;
  cardCount: number;
  connected: boolean;
  saidUno: boolean;
}

export interface PublicGameState {
  roomId: string;
  players: PublicPlayer[];
  myHand: Card[];
  topCard: Card | null;
  currentColor: CardColor;
  currentPlayerIndex: number;
  direction: 1 | -1;
  phase: GamePhase;
  winnerId: string | null;
  deckCount: number;
}

// Eventos Cliente -> Servidor
export interface ClientToServerEvents {
  createRoom: (playerName: string, cb: (roomId: string) => void) => void;
  joinRoom: (data: { roomId: string; playerName: string }, cb: (ok: boolean, error?: string) => void) => void;
  startGame: (roomId: string) => void;
  playCard: (data: { roomId: string; cardId: string; chosenColor?: CardColor }) => void;
  drawCard: (roomId: string) => void;
  sayUno: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

// Eventos Servidor -> Cliente
export interface ServerToClientEvents {
  stateUpdate: (state: PublicGameState) => void;
  errorMessage: (msg: string) => void;
  playerJoined: (playerName: string) => void;
  playerLeft: (playerName: string) => void;
  gameOver: (winnerName: string) => void;
}