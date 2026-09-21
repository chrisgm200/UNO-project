import { Card, CardColor, CardValue } from '../types';
import { createCard } from './Card';

const COLORS: Exclude<CardColor, 'wild'>[] = ['red', 'yellow', 'green', 'blue'];

export function buildFullDeck(): Card[] {
  const deck: Card[] = [];

  for (const color of COLORS) {
    deck.push(createCard(color, '0')); // un solo 0 por color

    for (let n = 1; n <= 9; n++) {
      deck.push(createCard(color, String(n) as CardValue));
      deck.push(createCard(color, String(n) as CardValue));
    }

    (['skip', 'reverse', 'draw2'] as CardValue[]).forEach((v) => {
      deck.push(createCard(color, v));
      deck.push(createCard(color, v));
    });
  }

  for (let i = 0; i < 4; i++) {
    deck.push(createCard('wild', 'wild'));
    deck.push(createCard('wild', 'wild4'));
  }

  return shuffle(deck);
}

export function shuffle(cards: Card[]): Card[] {
  const arr = [...cards];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Saca `count` cartas del mazo; si se acaba, reciclamos el descarte (menos la última carta)
export function drawCards(
  deck: Card[],
  discardPile: Card[],
  count: number
): { drawn: Card[]; deck: Card[]; discardPile: Card[] } {
  let workingDeck = [...deck];
  let workingDiscard = [...discardPile];
  const drawn: Card[] = [];

  for (let i = 0; i < count; i++) {
    if (workingDeck.length === 0) {
      const top = workingDiscard.pop()!;
      workingDeck = shuffle(workingDiscard);
      workingDiscard = [top];
    }
    const card = workingDeck.pop();
    if (card) drawn.push(card);
  }

  return { drawn, deck: workingDeck, discardPile: workingDiscard };
}