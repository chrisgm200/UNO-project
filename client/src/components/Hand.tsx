import React, { useEffect, useRef } from 'react';
import { LayoutAnimation, Platform, ScrollView, StyleSheet, UIManager } from 'react-native';
import { Card, CardColor } from '../types';
import { canPlayClient } from '../utils/rules';
import PlayingCard from './PlayingCard';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  hand: Card[];
  topCard: Card | null;
  currentColor: CardColor;
  isMyTurn: boolean;
  onPlay: (card: Card) => void;
}

export default function Hand({ hand, topCard, currentColor, isMyTurn, onPlay }: Props) {
  const prevCount = useRef(hand.length);

  useEffect(() => {
    if (prevCount.current !== hand.length) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      prevCount.current = hand.length;
    }
  }, [hand.length]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.content}>
      {hand.map((card) => {
        const playable = isMyTurn && topCard !== null && canPlayClient(card, topCard, currentColor);
        return (
          <PlayingCard key={card.id} card={card} disabled={!playable} onPress={playable ? () => onPlay(card) : undefined} />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { maxHeight: 120, backgroundColor: 'rgba(0,0,0,0.35)', paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  content: { paddingHorizontal: 14, alignItems: 'center' },
});