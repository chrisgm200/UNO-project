import React, { useEffect, useRef, useState } from 'react';
import { Alert, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useGameSocket } from '../../hooks/useSocket';
import { useIsDesktopWeb } from '../../hooks/useIsDesktopWeb';
import { Card, CardColor } from '../../types';
import { theme } from '../../theme';
import Hand from '../../components/Hand';
import Table from '../../components/Table';
import PlayerList from '../../components/PlayerList';
import ColorPickerModal from '../../components/ColorPickerModal';

export default function Room() {
  const router = useRouter();
  const isDesktop = useIsDesktopWeb();
  const { roomId, playerName, isCreator } = useLocalSearchParams<{ roomId: string; playerName: string; isCreator?: string }>();
  const { mySocketId, connected, state, error, clearError, joinRoom, startGame, playCard, drawCard, sayUno, voteRematch } = useGameSocket();
  const [pendingCard, setPendingCard] = useState<Card | null>(null);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!isCreator && playerName && !hasJoinedRef.current) {
      hasJoinedRef.current = true;
      joinRoom(roomId, playerName);
    }
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  if (!connected || !state) {
    return (
      <LinearGradient colors={theme.colors.background as any} style={styles.center}>
        <Text style={styles.info}>Conectando...</Text>
      </LinearGradient>
    );
  }

  const isMyTurn = state.players[state.currentPlayerIndex]?.id === mySocketId;

  const handlePlay = (card: Card) => {
    if (card.value === 'wild' || card.value === 'wild4') setPendingCard(card);
    else playCard(roomId, card.id);
  };

  const handleColorChosen = (color: Exclude<CardColor, 'wild'>) => {
    if (pendingCard) playCard(roomId, pendingCard.id, color);
    setPendingCard(null);
  };

  const shareLink = async () => {
    const url = Linking.createURL(`/room/${roomId}`);
    await Share.share({ message: `Únete a mi partida de UNO! Código: ${roomId}\n${url}` });
  };

  const myHandSize = state.myHand.length;
  const iVotedRematch = state.rematchAccepted.includes(mySocketId ?? '');
  const sortedByWins = [...state.players].sort((a, b) => b.wins - a.wins);

  const PlayingArea = (
    <>
      <Table topCard={state.topCard} currentColor={state.currentColor} deckCount={state.deckCount} onDraw={() => drawCard(roomId)} canDraw={isMyTurn} />
      <Text style={styles.turnIndicator}>{isMyTurn ? 'Tu turno' : `Turno de ${state.players[state.currentPlayerIndex]?.name}`}</Text>
      {isMyTurn && myHandSize === 2 && (
        <TouchableOpacity style={styles.unoButton} onPress={() => sayUno(roomId)}>
          <Text style={styles.buttonText}>¡Decir UNO!</Text>
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <LinearGradient colors={theme.colors.background as any} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.roomCode}>Sala: {roomId}</Text>
        <TouchableOpacity onPress={shareLink} style={styles.shareButton}>
          <Text style={styles.shareText}>Compartir</Text>
        </TouchableOpacity>
      </View>

      <View style={isDesktop ? styles.desktopBody : styles.mobileBody}>
        {isDesktop && (
          <View style={styles.sidebar}>
            <PlayerList players={state.players} currentPlayerIndex={state.currentPlayerIndex} mySocketId={mySocketId} layout="column" />
          </View>
        )}

        <View style={styles.mainArea}>
          {!isDesktop && (
            <PlayerList players={state.players} currentPlayerIndex={state.currentPlayerIndex} mySocketId={mySocketId} layout="row" />
          )}

          {state.phase === 'WAITING_PLAYERS' && (
            <View style={styles.center}>
              <Text style={styles.info}>Esperando jugadores ({state.players.length}/4)...</Text>
              {state.players.length >= 2 && (
                <TouchableOpacity style={styles.startButton} onPress={() => startGame(roomId)}>
                  <Text style={styles.buttonText}>Iniciar partida</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {state.phase === 'PLAYING' && PlayingArea}

          {state.phase === 'GAME_OVER' && (
            <View style={styles.center}>
              <Text style={styles.winner}>🏆 Ganó: {state.players.find((p) => p.id === state.winnerId)?.name}</Text>
              <View style={styles.winsRow}>
                {sortedByWins.map((p) => (
                  <Text key={p.id} style={styles.winsText}>{p.name}: {p.wins} 🏆</Text>
                ))}
              </View>
              {!iVotedRematch ? (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity style={styles.startButton} onPress={() => voteRematch(roomId, true)}>
                    <Text style={styles.buttonText}>Jugar de nuevo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineButton} onPress={() => voteRematch(roomId, false)}>
                    <Text style={styles.buttonText}>Salir</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.info}>Esperando a los demás ({state.rematchAccepted.length}/{state.players.filter((p) => p.connected).length})...</Text>
              )}
            </View>
          )}

          {state.phase === 'SERIES_OVER' && (
            <View style={styles.center}>
              <Text style={styles.winner}>📊 Resumen final</Text>
              {sortedByWins.map((p, i) => (
                <Text key={p.id} style={[styles.winsText, i === 0 && styles.champion]}>
                  {i === 0 ? '🥇 ' : ''}{p.name}: {p.wins} partida{p.wins === 1 ? '' : 's'} ganada{p.wins === 1 ? '' : 's'}
                </Text>
              ))}
              <TouchableOpacity style={styles.startButton} onPress={() => router.replace('/')}>
                <Text style={styles.buttonText}>Volver al inicio</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {state.phase === 'PLAYING' && (
        <>
          <Hand hand={state.myHand} topCard={state.topCard} currentColor={state.currentColor} isMyTurn={isMyTurn} onPlay={handlePlay} />
          <ColorPickerModal visible={!!pendingCard} onSelect={handleColorChosen} />
        </>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  roomCode: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  shareButton: { backgroundColor: '#3498DB', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  shareText: { color: '#fff', fontWeight: '600' },
  info: { color: '#ccc', fontSize: 16, textAlign: 'center' },
  startButton: { backgroundColor: '#2ECC71', padding: 14, borderRadius: 10 },
  declineButton: { backgroundColor: '#E74C3C', padding: 14, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  turnIndicator: { color: '#F1C40F', textAlign: 'center', fontWeight: '600', marginBottom: 8 },
  unoButton: { backgroundColor: '#E74C3C', alignSelf: 'center', padding: 12, borderRadius: 10, marginBottom: 8 },
  winner: { color: '#F1C40F', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  winsRow: { alignItems: 'center', gap: 4 },
  winsText: { color: '#ccc', fontSize: 15 },
  champion: { color: '#F1C40F', fontWeight: 'bold', fontSize: 18 },
  mobileBody: { flex: 1 },
  desktopBody: { flex: 1, flexDirection: 'row', maxWidth: 1100, width: '100%', alignSelf: 'center' },
  sidebar: { width: 220, paddingTop: 12 },
  mainArea: { flex: 1 },
});