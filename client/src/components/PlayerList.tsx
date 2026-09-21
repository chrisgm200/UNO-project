import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PublicPlayer } from '../types';

interface Props {
  players: PublicPlayer[];
  currentPlayerIndex: number;
  mySocketId?: string;
}

export default function PlayerList({ players, currentPlayerIndex, mySocketId }: Props) {
  return (
    <View style={styles.container}>
      {players.map((p, i) => (
        <View key={p.id} style={[styles.chip, i === currentPlayerIndex && styles.activeChip]}>
          <Text style={styles.name}>
            {p.name} {p.id === mySocketId ? '(Tú)' : ''}
          </Text>
          <Text style={styles.count}>{p.cardCount} 🂠</Text>
          {!p.connected && <Text style={styles.disconnected}>desconectado</Text>}
          {p.saidUno && <Text style={styles.uno}>¡UNO!</Text>}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, padding: 12 },
  chip: { backgroundColor: '#2a2a2a', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center' },
  activeChip: { borderWidth: 2, borderColor: '#F1C40F' },
  name: { color: '#fff', fontWeight: '600' },
  count: { color: '#ccc', fontSize: 12 },
  disconnected: { color: '#E74C3C', fontSize: 10 },
  uno: { color: '#F1C40F', fontSize: 11, fontWeight: 'bold' },
});