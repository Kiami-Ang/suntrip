import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import TransactionItem from '../components/TransactionItem';
import EmptyState from '../components/EmptyState';
import api from '../services/api';
import colors, { radius, spacing, font } from '../theme/colors';

const PERIODS = [
  { key: 'all', label: 'Tudo' },
  { key: 'today', label: 'Hoje' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mês' },
];
const STATUSES = [
  { key: 'all', label: 'Todos' },
  { key: 'pago', label: 'Pago' },
  { key: 'pendente', label: 'Pendente' },
  { key: 'cancelado', label: 'Cancelado' },
];

function Chips({ options, value, onChange }) {
  return (
    <View style={styles.chips}>
      {options.map((o) => {
        const active = value === o.key;
        return (
          <Pressable key={o.key} onPress={() => onChange(o.key)} style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TransactionsScreen() {
  const [period, setPeriod] = useState('all');
  const [status, setStatus] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const params = {};
      if (period !== 'all') params.period = period;
      if (status !== 'all') params.status = status;
      const { data } = await api.get('/transactions', { params });
      setItems(data.transactions);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [period, status]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.h1}>Histórico</Text>
        <Chips options={PERIODS} value={period} onChange={setPeriod} />
        <Chips options={STATUSES} value={status} onChange={setStatus} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.ocean} style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => <TransactionItem tx={item} />}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState icon="🧾" title="Sem movimentos" subtitle="Não há transações para este filtro." />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  h1: { color: colors.white, fontSize: font.size.xxl, fontWeight: font.weight.bold, marginBottom: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  chip: { backgroundColor: colors.surface, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.ocean, borderColor: colors.ocean },
  chipText: { color: colors.muted, fontSize: font.size.xs, fontWeight: font.weight.medium },
  chipTextActive: { color: colors.navy, fontWeight: font.weight.bold },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
});
