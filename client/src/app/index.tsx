import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameSocket } from '../hooks/useSocket';

export default function Home() {
  const router = useRouter();
  const { createRoom, joinRoom } = useGameSocket();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return setError('Ingresa tu nombre');
    setLoading(true);
    const roomId = await createRoom(name.trim());
    router.push({ pathname: '/room/[roomId]', params: { roomId, playerName: name.trim(), isCreator: '1' } });
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!name.trim() || !code.trim()) return setError('Ingresa tu nombre y el código de sala');
    setLoading(true);
    const { ok, error: err } = await joinRoom(code.trim().toUpperCase(), name.trim());
    setLoading(false);
    if (!ok) return setError(err || 'No se pudo unir');
    router.push({ pathname: '/room/[roomId]', params: { roomId: code.trim().toUpperCase(), playerName: name.trim() } });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>UNO Online</Text>

      <TextInput
        style={styles.input}
        placeholder="Tu nombre"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleCreate} disabled={loading}>
        <Text style={styles.buttonText}>Crear sala</Text>
      </TouchableOpacity>

      <Text style={styles.or}>— o —</Text>

      <TextInput
        style={styles.input}
        placeholder="Código de sala"
        placeholderTextColor="#888"
        autoCapitalize="characters"
        value={code}
        onChangeText={setCode}
      />
      <TouchableOpacity style={styles.secondaryButton} onPress={handleJoin} disabled={loading}>
        <Text style={styles.buttonText}>Unirse</Text>
      </TouchableOpacity>

      {!!error && <Text style={styles.error}>{error}</Text>}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', justifyContent: 'center', padding: 24 },
  title: { color: '#fff', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#222', color: '#fff', borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 16 },
  primaryButton: { backgroundColor: '#3498DB', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 8 },
  secondaryButton: { backgroundColor: '#2ECC71', borderRadius: 10, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  or: { color: '#666', textAlign: 'center', marginVertical: 16 },
  error: { color: '#E74C3C', textAlign: 'center', marginTop: 16 },
});