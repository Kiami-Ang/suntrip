import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors, { radius, spacing, font } from '../theme/colors';
import { formatKz } from '../utils/format';

export default function BalanceCard({ balance, name, hidden = false, onToggleHidden }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Saldo disponível</Text>
        {onToggleHidden ? (
          <Text style={styles.eye} onPress={onToggleHidden}>
            {hidden ? 'Mostrar' : 'Ocultar'}
          </Text>
        ) : null}
      </View>
      <Text style={styles.amount}>{hidden ? '••••••' : formatKz(balance)}</Text>
      {name ? <Text style={styles.name}>{name}</Text> : null}
      <View style={styles.brandRow}>
        <Text style={styles.brand}>SunTrip</Text>
        <Text style={styles.brandType}>Carteira Digital</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.oceanDeep,
    borderRadius: radius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: 'rgba(255,255,255,0.8)', fontSize: font.size.sm, fontWeight: font.weight.medium },
  eye: { color: '#fff', fontSize: font.size.sm, fontWeight: font.weight.semibold },
  amount: {
    color: '#fff',
    fontSize: font.size.huge,
    fontWeight: font.weight.bold,
    marginTop: spacing.sm,
  },
  name: { color: 'rgba(255,255,255,0.9)', fontSize: font.size.md, marginTop: spacing.xs },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  brand: { color: colors.yellow, fontSize: font.size.lg, fontWeight: font.weight.bold },
  brandType: { color: 'rgba(255,255,255,0.7)', fontSize: font.size.xs },
});
