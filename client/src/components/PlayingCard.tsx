import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../types';

const COLOR_MAP: Record<string, string> = {
  red: '#E74C3C',
  yellow: '#F1C40F',
  green: '#2ECC71',
  blue: '#3498DB',
  wild: '#2C2C2C',
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
  const label = LABEL_MAP[card.value] ?? card.value;
  const size = small ? styles.cardSmall : styles.card;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={[size, { backgroundColor: COLOR_MAP[card.color] }, disabled && styles.disabled]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 64,
    height: 92,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  cardSmall: {
    width: 44,
    height: 64,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  disabled: {
    opacity: 0.4,
  },
});