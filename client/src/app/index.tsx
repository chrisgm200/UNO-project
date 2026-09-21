import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useGameSocket } from '../hooks/useSocket';
import { useSounds } from '../hooks/useSounds';
import { theme } from '../theme';

export default function Home() {
  const router = useRouter();
  const { createRoom, joinRoom } = useGameSocket();
  const { playClickSound } = useSounds();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    playClickSound();
    if (!name.trim()) return setError('Ingresa tu nombre');
    setLoading(true);
    const roomId = await createRoom(name.trim());
    router.push({ pathname: '/room/[roomId]', params: { roomId, playerName: name.trim(), isCreator: '1' } });
    setLoading(false);
  };

  const handleJoin = async () => {
    playClickSound();
    if (!name.trim() || !code.trim()) return setError('Ingresa tu nombre y el código de sala');
    setLoading(true);
    const { ok, error: err } = await joinRoom(code.trim().toUpperCase(), name.trim());
    setLoading(false);
    if (!ok) return setError(err || 'No se pudo unir');
    router.push({ pathname: '/room/[roomId]', params: { roomId: code.trim().toUpperCase(), playerName: name.trim() } });
  };

  return (
    <LinearGradient colors={theme.colors.background as any} style={styles.screen}>
      <KeyboardAvoidingView style={styles.centerWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <Text style={styles.title}>UNO Online</Text>

          <TextInput style={styles.input} placeholder="Tu nombre" placeholderTextColor="#8a8fa3" value={name} onChangeText={setName} />

          <TouchableOpacity style={styles.primaryButton} onPress={handleCreate} disabled={loading}>
            <Text style={styles.buttonText}>Crear sala</Text>
          </TouchableOpacity>

          <Text style={styles.or}>— o —</Text>

          <TextInput
            style={styles.input}
            placeholder="Código de sala"
            placeholderTextColor="#8a8fa3"
            autoCapitalize="characters"
            value={code}
            onChangeText={setCode}
          />
          <TouchableOpacity style={styles.secondaryButton} onPress={handleJoin} disabled={loading}>
            <Text style={styles.buttonText}>Unirse</Text>
          </TouchableOpacity>

          {!!error && <Text style={styles.error}>{error}</Text>}
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: { color: '#fff', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  primaryButton: { backgroundColor: '#3498DB', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 8 },
  secondaryButton: { backgroundColor: '#2ECC71', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  or: { color: '#8a8fa3', textAlign: 'center', marginVertical: 16 },
  error: { color: '#E74C3C', textAlign: 'center', marginTop: 16 },
});