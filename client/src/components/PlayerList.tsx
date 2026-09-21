import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { PublicPlayer } from '../types';

function PlayerChip({ active, children }: { active: boolean; children: React.ReactNode }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active]);

  const borderColor = pulse.interpolate({ inputRange: [0, 1], outputRange: ['#F1C40F', '#fff8d6'] });

  return (
    <Animated.View style={[styles.chip, active && styles.activeChip, active && { borderColor }]}>
      {children}
    </Animated.View>
  );
}

interface Props {
  players: PublicPlayer[];
  currentPlayerIndex: number;
  mySocketId?: string;
}

export default function PlayerList({ players, currentPlayerIndex, mySocketId }: Props) {
  return (
    <View style={styles.container}>
      {players.map((p, i) => (
        <PlayerChip key={p.id} active={i === currentPlayerIndex}>
          <Text style={styles.name}>{p.name} {p.id === mySocketId ? '(Tú)' : ''}</Text>
          <Text style={styles.count}>{p.cardCount} 🂠</Text>
          {p.wins > 0 && <Text style={styles.wins}>🏆 {p.wins}</Text>}
          {!p.connected && <Text style={styles.disconnected}>desconectado</Text>}
          {p.saidUno && <Text style={styles.uno}>¡UNO!</Text>}
        </PlayerChip>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, paddingVertical: 12 },
  chip: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  activeChip: { backgroundColor: 'rgba(241,196,15,0.12)' },
  name: { color: '#fff', fontWeight: '600' },
  count: { color: '#ccc', fontSize: 12 },
  wins: { color: '#F1C40F', fontSize: 11, fontWeight: 'bold' },
  disconnected: { color: '#E74C3C', fontSize: 10 },
  uno: { color: '#F1C40F', fontSize: 11, fontWeight: 'bold' },
});