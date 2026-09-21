import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text } from 'react-native';
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
  skip: '⊘', reverse: '⇄', draw2: '+2', wild: '★', wild4: '+4',
};

interface Props {
  card: Card;
  onPress?: () => void;
  disabled?: boolean;
  small?: boolean;
  scale?: number;
}

export default function PlayingCard({ card, onPress, disabled, small, scale = 1 }: Props) {
  const entrance = useRef(new Animated.Value(0.5)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(entrance, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }).start();
  }, []);

  const handlePressIn = () => { if (onPress) Animated.spring(pressScale, { toValue: 0.92, useNativeDriver: true }).start(); };
  const handlePressOut = () => { if (onPress) Animated.spring(pressScale, { toValue: 1, friction: 4, useNativeDriver: true }).start(); };

  const label = LABEL_MAP[card.value] ?? card.value;
  const base = small ? { w: 46, h: 66, r: 9, bw: 2, font: 15, corner: 9 } : { w: 68, h: 96, r: 12, bw: 3, font: 22, corner: 11 };

  const cardStyle = {
    width: base.w * scale,
    height: base.h * scale,
    borderRadius: base.r * scale,
    borderWidth: base.bw,
    borderColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginHorizontal: 4 * scale,
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 5,
    opacity: disabled ? 0.4 : 1,
  };

  return (
    <Animated.View style={{ transform: [{ scale: Animated.multiply(entrance, pressScale) }] }}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={disabled || !onPress}>
        <LinearGradient colors={GRADIENT_MAP[card.color] as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={cardStyle}>
          <Text style={{ position: 'absolute', top: 4, left: 6, color: '#fff', fontSize: base.corner * scale, fontWeight: 'bold', opacity: 0.85 }}>{label}</Text>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: base.font * scale, textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 3 }}>{label}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}