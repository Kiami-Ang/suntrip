import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors, { radius, spacing, font } from '../theme/colors';
import { formatKz, formatDateTime, txTypeLabel, txStatusLabel } from '../utils/format';

const ICONS = { deposit: '↓', transfer: '↔', qr_payment: '⚡' };

export default function TransactionItem({ tx }) {
  const isCredit = tx.direction === 'credit';
  const statusColor =
    tx.status === 'completed' ? colors.success : tx.status === 'pending' ? colors.warning : colors.danger;

  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: isCredit ? colors.successBg : colors.dangerBg }]}>
        <Text style={[styles.iconText, { color: isCredit ? colors.success : colors.danger }]}>
          {ICONS[tx.type] || '•'}
        </Text>
      </View>

      <View style={styles.middle}>
        <Text style={styles.title} numberOfLines={1}>
          {tx.counterpartyName || txTypeLabel[tx.type] || 'Movimento'}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {txTypeLabel[tx.type]} · {formatDateTime(tx.createdAt)}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: isCredit ? colors.success : colors.white }]}>
          {isCredit ? '+' : '-'} {formatKz(tx.amount)}
        </Text>
        <Text style={[styles.status, { color: statusColor }]}>{txStatusLabel[tx.status]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 20, fontWeight: font.weight.bold },
  middle: { flex: 1, marginLeft: spacing.md },
  title: { color: colors.white, fontSize: font.size.md, fontWeight: font.weight.semibold },
  sub: { color: colors.muted, fontSize: font.size.xs, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: font.size.md, fontWeight: font.weight.bold },
  status: { fontSize: font.size.xs, marginTop: 2 },
});
