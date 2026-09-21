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
  scale?: number;
}

export default function Table({ topCard, currentColor, deckCount, onDraw, canDraw, onTopCardChange, scale = 1 }: Props) {
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
    <LinearGradient colors={theme.colors.table as any} style={[styles.felt, { borderRadius: 28 * scale, paddingVertical: 24 * scale }]}>
      <View style={[styles.container, { gap: 48 * scale }]}>
        <View style={styles.deckArea}>
          <PlayingCard card={{ id: 'deck', color: 'wild', value: 'wild' }} onPress={canDraw ? onDraw : undefined} disabled={!canDraw} scale={scale} />
          <Text style={[styles.deckCount, { fontSize: 12 * scale, marginTop: 6 * scale }]}>{deckCount} cartas</Text>
        </View>
        <View style={styles.discardArea}>
          {topCard && (
            <Animated.View style={{ transform: [{ scale: bounce }] }}>
              <PlayingCard card={topCard} scale={scale} />
            </Animated.View>
          )}
          <View style={[styles.colorIndicator, { backgroundColor: COLOR_DOT[currentColor], width: 22 * scale, height: 22 * scale, borderRadius: 11 * scale, marginTop: 8 * scale }]} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  felt: { width: '100%' },
  container: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  deckArea: { alignItems: 'center' },
  deckCount: { color: '#dfe6e9' },
  discardArea: { alignItems: 'center' },
  colorIndicator: { borderWidth: 2, borderColor: '#fff' },
});