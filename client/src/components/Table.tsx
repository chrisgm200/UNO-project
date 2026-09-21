import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, CardColor } from '../types';
import PlayingCard from './PlayingCard';

const COLOR_MAP: Record<string, string> = {
  red: '#E74C3C', yellow: '#F1C40F', green: '#2ECC71', blue: '#3498DB', wild: '#2C2C2C',
};

interface Props {
  topCard: Card | null;
  currentColor: CardColor;
  deckCount: number;
  onDraw: () => void;
  canDraw: boolean;
}

export default function Table({ topCard, currentColor, deckCount, onDraw, canDraw }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.deckArea}>
        <PlayingCard
          card={{ id: 'deck', color: 'wild', value: 'wild' }}
          onPress={canDraw ? onDraw : undefined}
          disabled={!canDraw}
        />
        <Text style={styles.deckCount}>{deckCount} cartas</Text>
      </View>

      <View style={styles.discardArea}>
        {topCard && <PlayingCard card={topCard} />}
        <View style={[styles.colorIndicator, { backgroundColor: COLOR_MAP[currentColor] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 40, paddingVertical: 24 },
  deckArea: { alignItems: 'center' },
  deckCount: { color: '#aaa', fontSize: 12, marginTop: 6 },
  discardArea: { alignItems: 'center' },
  colorIndicator: { width: 24, height: 24, borderRadius: 12, marginTop: 8, borderWidth: 2, borderColor: '#fff' },
});