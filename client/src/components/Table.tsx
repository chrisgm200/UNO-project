import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, CardColor } from '../types';
import PlayingCard from './PlayingCard';
import { theme } from '../theme';

const COLOR_DOT: Record<string, string> = { red: '#E74C3C', yellow: '#F1C40F', green: '#2ECC71', blue: '#3498DB', wild: '#2C2C2C' };

interface Props {
  topCard: Card | null;
  currentColor: CardColor;
  deckCount: number;
  onDraw: () => void;
  canDraw: boolean;
  onTopCardChange?: () => void;
}

export default function Table({ topCard, currentColor, deckCount, onDraw, canDraw, onTopCardChange }: Props) {
  const bounce = useRef(new Animated.Value(1)).current;
  const lastTopId = useRef<string | null>(null);

  useEffect(() => {
    if (topCard && topCard.id !== lastTopId.current) {
      const isFirst = lastTopId.current === null;
      lastTopId.current = topCard.id;
      bounce.setValue(0.5);
      Animated.spring(bounce, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
      if (!isFirst) onTopCardChange?.();
    }
  }, [topCard?.id]);

  return (
    <LinearGradient colors={theme.colors.table as any} style={styles.felt}>
      <View style={styles.container}>
        <View style={styles.deckArea}>
          <PlayingCard card={{ id: 'deck', color: 'wild', value: 'wild' }} onPress={canDraw ? onDraw : undefined} disabled={!canDraw} />
          <Text style={styles.deckCount}>{deckCount} cartas</Text>
        </View>
        <View style={styles.discardArea}>
          {topCard && (
            <Animated.View style={{ transform: [{ scale: bounce }] }}>
              <PlayingCard card={topCard} />
            </Animated.View>
          )}
          <View style={[styles.colorIndicator, { backgroundColor: COLOR_DOT[currentColor] }]} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  felt: { borderRadius: 28, paddingVertical: 24, width: '100%' },
  container: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 48 },
  deckArea: { alignItems: 'center' },
  deckCount: { color: '#dfe6e9', fontSize: 12, marginTop: 6 },
  discardArea: { alignItems: 'center' },
  colorIndicator: { width: 22, height: 22, borderRadius: 11, marginTop: 8, borderWidth: 2, borderColor: '#fff' },
});