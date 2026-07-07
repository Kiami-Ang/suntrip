import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import colors, { radius, spacing, font } from '../../theme/colors';

function BigTile({ icon, title, subtitle, color, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tile, { backgroundColor: color }, pressed && { opacity: 0.9 }]}>
      <Ionicons name={icon} size={40} color="#fff" />
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileSub}>{subtitle}</Text>
    </Pressable>
  );
}

export default function QrHubScreen({ navigation }) {
  return (
    <Screen scroll>
      <Text style={styles.h1}>QR Code</Text>
      <Text style={styles.sub}>Recebe ou paga corridas num instante.</Text>

      <BigTile
        icon="qr-code"
        title="Receber"
        subtitle="Gera um QR para te pagarem"
        color={colors.oceanDeep}
        onPress={() => navigation.navigate('QrGenerate')}
      />
      <View style={{ height: spacing.lg }} />
      <BigTile
        icon="scan"
        title="Pagar"
        subtitle="Lê o QR do motorista"
        color={colors.card}
        onPress={() => navigation.navigate('QrScan')}
      />

      <Pressable
        style={({ pressed }) => [styles.codeBtn, pressed && { opacity: 0.85 }]}
        onPress={() => navigation.navigate('QrScan', { mode: 'manual' })}
      >
        <Ionicons name="keypad-outline" size={20} color={colors.ocean} />
        <Text style={styles.codeBtnText}>Pagar com código</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.white, fontSize: font.size.xxl, fontWeight: font.weight.bold },
  sub: { color: colors.muted, marginTop: spacing.xs, marginBottom: spacing.xl },
  tile: { borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.border },
  tileTitle: { color: '#fff', fontSize: font.size.xl, fontWeight: font.weight.bold, marginTop: spacing.md },
  tileSub: { color: 'rgba(255,255,255,0.8)', fontSize: font.size.sm, marginTop: spacing.xs },
  codeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  codeBtnText: { color: colors.ocean, fontWeight: font.weight.semibold, fontSize: font.size.md },
});
