import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, CardColor } from '../types';
import { canPlayClient } from '../utils/rules';
import PlayingCard from '../components/PlayingCard';

interface Props {
  hand: Card[];
  topCard: Card | null;
  currentColor: CardColor;
  isMyTurn: boolean;
  onPlay: (card: Card) => void;
}

export default function Hand({ hand, topCard, currentColor, isMyTurn, onPlay }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.content}>
      {hand.map((card) => {
        const playable = isMyTurn && topCard !== null && canPlayClient(card, topCard, currentColor);
        return (
          <PlayingCard
            key={card.id}
            card={card}
            disabled={!playable}
            onPress={playable ? () => onPlay(card) : undefined}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { maxHeight: 110, backgroundColor: '#1a1a1a', paddingVertical: 8 },
  content: { paddingHorizontal: 12, alignItems: 'center' },
});