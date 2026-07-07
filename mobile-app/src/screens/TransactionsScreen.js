import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import FilterChips from '../components/FilterChips';
import TransactionItem from '../components/TransactionItem';
import Loading from '../components/Loading';
import Card from '../components/Card';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatKz } from '../utils/format';
import { colors } from '../theme/colors';

const PERIODS = [
  { id: '', label: 'Tudo' },
  { id: 'today', label: 'Hoje' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mês' },
];

const STATUSES = [
  { id: '', label: 'Todos' },
  { id: 'pago', label: 'Pago' },
  { id: 'pendente', label: 'Pendente' },
  { id: 'cancelado', label: 'Cancelado' },
];

export default function TransactionsScreen() {
  const { isDriver } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState({ period: '', status: '' });
  const [loading, setLoading] = useState(true);

  const counterpartyLabel = isDriver ? 'Cliente' : 'Motorista';

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.period) params.set('period', filter.period);
    if (filter.status) params.set('status', filter.status);
    params.set('limit', '50');
    try {
      const { data } = await api.get(`/transactions?${params}`);
      setTransactions(data.transactions || []);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const totalPaid = transactions
    .filter((t) => t.status === 'completed')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <Screen>
      <Card>
        <Text style={styles.summaryLabel}>Volume pago no período</Text>
        <Text style={styles.summaryValue}>{formatKz(totalPaid)}</Text>
        <Text style={styles.summaryCount}>{transactions.length} transações</Text>
      </Card>

      <Text style={styles.filterTitle}>Período</Text>
      <FilterChips
        options={PERIODS}
        value={filter.period}
        onChange={(period) => setFilter((f) => ({ ...f, period }))}
      />

      <Text style={styles.filterTitle}>Estado</Text>
      <FilterChips
        options={STATUSES}
        value={filter.status}
        onChange={(status) => setFilter((f) => ({ ...f, status }))}
      />

      {loading ? (
        <Loading />
      ) : transactions.length ? (
        <View style={styles.list}>
          {transactions.map((tx) => (
            <TransactionItem key={tx.id} tx={tx} counterpartyLabel={counterpartyLabel} />
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>Nenhuma transação encontrada</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryLabel: { color: colors.muted, fontSize: 13 },
  summaryValue: { color: colors.yellow, fontSize: 24, fontWeight: '800', marginTop: 4 },
  summaryCount: { color: colors.muted, fontSize: 12, marginTop: 4 },
  filterTitle: { color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  list: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  empty: { color: colors.muted, textAlign: 'center', padding: 32 },
});
