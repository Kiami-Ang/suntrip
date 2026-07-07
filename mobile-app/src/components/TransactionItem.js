import { StyleSheet, Text, View } from 'react-native';
import {
  formatDateOnly,
  formatKz,
  formatTimeOnly,
  txDisplayStatus,
  txStatusColor,
  txTypeLabel,
} from '../utils/format';
import { colors } from '../theme/colors';

export default function TransactionItem({ tx, counterpartyLabel = 'Motorista' }) {
  const isIncoming = ['deposit', 'qr_receive'].includes(tx.type);
  const status = tx.status || 'pending';
  const motorista = tx.counterpartyName || tx.recipientName || '—';

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={styles.type}>{txTypeLabel[tx.type] || tx.type}</Text>
        <Text style={[styles.amount, isIncoming ? styles.in : styles.out]}>
          {isIncoming ? '+' : '−'}
          {formatKz(tx.amount)}
        </Text>
      </View>
      <View style={styles.grid}>
        <Text style={styles.meta}>
          {formatDateOnly(tx.createdAt)} · {formatTimeOnly(tx.createdAt)}
        </Text>
        <Text style={styles.meta}>
          {counterpartyLabel}: {motorista}
        </Text>
        <Text style={[styles.badge, { color: txStatusColor[status] }]}>
          {txDisplayStatus[status] || status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  type: { color: colors.white, fontWeight: '600', fontSize: 15, flex: 1 },
  amount: { fontWeight: '700', fontSize: 15 },
  in: { color: colors.success },
  out: { color: colors.white },
  grid: { marginTop: 8, gap: 4 },
  meta: { color: colors.muted, fontSize: 12 },
  badge: { fontSize: 12, fontWeight: '600', marginTop: 2 },
});
