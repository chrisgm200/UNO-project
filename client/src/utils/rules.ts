import { Card, CardColor } from '../types';

export function canPlayClient(card: Card, topCard: Card, activeColor: CardColor): boolean {
  if (card.value === 'wild' || card.value === 'wild4') return true;
  if (card.color === activeColor) return true;
  if (card.value === topCard.value) return true;
  return false;
}