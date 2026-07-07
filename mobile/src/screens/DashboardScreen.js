import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import BalanceCard from '../components/BalanceCard';
import TransactionItem from '../components/TransactionItem';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import useSocket from '../hooks/useSocket';
import api from '../services/api';
import { formatKz } from '../utils/format';
import colors, { radius, spacing, font } from '../theme/colors';

function QuickAction({ icon, label, onPress, primary }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && { opacity: 0.85 }]}>
      <View style={[styles.actionIcon, primary && { backgroundColor: colors.yellow }]}>
        <Ionicons name={icon} size={22} color={primary ? colors.navy : colors.ocean} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

export default function DashboardScreen({ navigation }) {
  const { user, patchUser } = useAuth();
  const { unread } = useNotifications();
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
      patchUser({ balance: res.data.balance });
    } catch {
      // silencioso; mantém dados anteriores
    }
  }, [patchUser]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useSocket({ onReceived: () => load() });

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const stats = data?.stats;
  const recent = data?.recentTransactions || [];

  return (
    <Screen scroll refreshing={refreshing} onRefresh={onRefresh}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Olá,</Text>
          <Text style={styles.name}>{user?.name?.split(' ')[0] || 'Utilizador'}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.online}>
            <View style={styles.dot} />
            <Text style={styles.onlineText}>{data?.onlineCount ?? 0} online</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Notifications')}
            style={({ pressed }) => [styles.bell, pressed && { opacity: 0.85 }]}
          >
            <Ionicons name="notifications" size={20} color={colors.white} />
            {unread > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <BalanceCard balance={data?.balance ?? user?.balance ?? 0} name={user?.name} />

      <View style={styles.actions}>
        <QuickAction icon="add-circle" label="Carregar" primary onPress={() => navigation.navigate('Deposit')} />
        <QuickAction icon="paper-plane" label="Transferir" onPress={() => navigation.navigate('Transfer')} />
        <QuickAction icon="qr-code" label="Receber" onPress={() => navigation.navigate('QrGenerate')} />
        <QuickAction icon="scan" label="Pagar" onPress={() => navigation.navigate('QrScan')} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Entradas (30d)</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>{formatKz(stats?.totalIn ?? 0)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Saídas (30d)</Text>
          <Text style={[styles.statValue, { color: colors.white }]}>{formatKz(stats?.totalOut ?? 0)}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Movimentos recentes</Text>
        <Pressable onPress={() => navigation.navigate('Transactions')}>
          <Text style={styles.seeAll}>Ver tudo</Text>
        </Pressable>
      </View>

      {recent.length === 0 ? (
        <EmptyState icon="🧾" title="Sem movimentos" subtitle="As tuas transações aparecem aqui." />
      ) : (
        recent.map((tx) => <TransactionItem key={tx.id} tx={tx} />)
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  hello: { color: colors.muted, fontSize: font.size.md },
  name: { color: colors.white, fontSize: font.size.xxl, fontWeight: font.weight.bold },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  online: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: 6 },
  onlineText: { color: colors.muted, fontSize: font.size.xs },
  bell: {
    width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  badge: {
    position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
    borderWidth: 2, borderColor: colors.navy,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: font.weight.bold },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl },
  action: { alignItems: 'center', flex: 1 },
  actionIcon: {
    width: 56, height: 56, borderRadius: radius.lg, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  actionLabel: { color: colors.white, fontSize: font.size.xs, fontWeight: font.weight.medium },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  statLabel: { color: colors.muted, fontSize: font.size.xs },
  statValue: { fontSize: font.size.lg, fontWeight: font.weight.bold, marginTop: spacing.xs },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.sm },
  sectionTitle: { color: colors.white, fontSize: font.size.lg, fontWeight: font.weight.bold },
  seeAll: { color: colors.ocean, fontSize: font.size.sm, fontWeight: font.weight.semibold },
});
