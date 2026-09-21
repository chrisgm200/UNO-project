import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CardColor } from '../types';

interface Props {
  visible: boolean;
  onSelect: (color: Exclude<CardColor, 'wild'>) => void;
}

const OPTIONS: { color: Exclude<CardColor, 'wild'>; label: string; bg: string }[] = [
  { color: 'red', label: 'Rojo', bg: '#E74C3C' },
  { color: 'yellow', label: 'Amarillo', bg: '#F1C40F' },
  { color: 'green', label: 'Verde', bg: '#2ECC71' },
  { color: 'blue', label: 'Azul', bg: '#3498DB' },
];

export default function ColorPickerModal({ visible, onSelect }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Elige un color</Text>
          <View style={styles.row}>
            {OPTIONS.map((opt) => (
              <Pressable key={opt.color} style={[styles.swatch, { backgroundColor: opt.bg }]} onPress={() => onSelect(opt.color)} />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  box: { backgroundColor: '#1e1e1e', borderRadius: 16, padding: 24, alignItems: 'center' },
  title: { color: '#fff', fontSize: 16, marginBottom: 16, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12 },
  swatch: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#fff' },
});