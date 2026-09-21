import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { PublicPlayer } from '../types';

function PlayerChip({ active, scale, children }: { active: boolean; scale: number; children: React.ReactNode }) {
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
    <Animated.View style={{
      backgroundColor: active ? 'rgba(241,196,15,0.12)' : 'rgba(255,255,255,0.06)',
      borderRadius: 14 * scale, paddingVertical: 8 * scale, paddingHorizontal: 14 * scale,
      alignItems: 'center', borderWidth: 2, borderColor: active ? borderColor : 'transparent',
    }}>
      {children}
    </Animated.View>
  );
}

interface Props {
  players: PublicPlayer[];
  currentPlayerIndex: number;
  mySocketId?: string;
  scale?: number;
}

export default function PlayerList({ players, currentPlayerIndex, mySocketId, scale = 1 }: Props) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 * scale, paddingVertical: 12 * scale }}>
      {players.map((p, i) => (
        <PlayerChip key={p.id} active={i === currentPlayerIndex} scale={scale}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 * scale }}>{p.name} {p.id === mySocketId ? '(Tú)' : ''}</Text>
          <Text style={{ color: '#ccc', fontSize: 12 * scale }}>{p.cardCount} 🂠</Text>
          {p.wins > 0 && <Text style={{ color: '#F1C40F', fontSize: 11 * scale, fontWeight: 'bold' }}>🏆 {p.wins}</Text>}
          {!p.connected && <Text style={{ color: '#E74C3C', fontSize: 10 * scale }}>desconectado</Text>}
          {p.saidUno && <Text style={{ color: '#F1C40F', fontSize: 11 * scale, fontWeight: 'bold' }}>¡UNO!</Text>}
        </PlayerChip>
      ))}
    </View>
  );
}