import { nanoid } from 'nanoid';
import { Card, CardColor, CardValue } from '../types';

export function createCard(color: CardColor, value: CardValue): Card {
  return { id: nanoid(8), color, value };
}

export function isWild(card: Card): boolean {
  return card.value === 'wild' || card.value === 'wild4';
}

export function isNumberCard(card: Card): boolean {
  return !isNaN(Number(card.value));
}

// ¿Se puede jugar `card` sobre `topCard`, dado el color activo?
export function canPlay(card: Card, topCard: Card, activeColor: CardColor): boolean {
  if (isWild(card)) return true;
  if (card.color === activeColor) return true;
  if (card.value === topCard.value) return true;
  return false;
}