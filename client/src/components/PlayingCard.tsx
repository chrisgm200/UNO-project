import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../types';
import { theme } from '../theme';

const GRADIENT_MAP: Record<string, string[]> = {
  red: theme.colors.red,
  yellow: theme.colors.yellow,
  green: theme.colors.green,
  blue: theme.colors.blue,
  wild: theme.colors.wild,
};

const LABEL_MAP: Record<string, string> = {
  skip: '⊘',
  reverse: '⇄',
  draw2: '+2',
  wild: '★',
  wild4: '+4',
};

interface Props {
  card: Card;
  onPress?: () => void;
  disabled?: boolean;
  small?: boolean;
}

export default function PlayingCard({ card, onPress, disabled, small }: Props) {
  const entrance = useRef(new Animated.Value(0.5)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(entrance, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }).start();
  }, []);

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.spring(pressScale, { toValue: 0.92, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    if (!onPress) return;
    Animated.spring(pressScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  const label = LABEL_MAP[card.value] ?? card.value;
  const size = small ? styles.cardSmall : styles.card;

  return (
    <Animated.View style={{ transform: [{ scale: Animated.multiply(entrance, pressScale) }] }}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={disabled || !onPress}>
        <LinearGradient
          colors={GRADIENT_MAP[card.color] as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[size, disabled && styles.disabled]}
        >
          <Text style={styles.cornerLabel}>{label}</Text>
          <Text style={styles.label}>{label}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 68, height: 96, borderRadius: 12, borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 4,
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 5,
  },
  cardSmall: {
    width: 46, height: 66, borderRadius: 9, borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 2,
  },
  cornerLabel: { position: 'absolute', top: 4, left: 6, color: '#fff', fontSize: 11, fontWeight: 'bold', opacity: 0.85 },
  label: { color: '#fff', fontWeight: 'bold', fontSize: 22, textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 3 },
  disabled: { opacity: 0.4 },
});