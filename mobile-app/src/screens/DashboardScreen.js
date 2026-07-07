import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Screen from '../components/Screen';
import BalanceCard from '../components/BalanceCard';
import Card from '../components/Card';
import TransactionItem from '../components/TransactionItem';
import Loading from '../components/Loading';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useOnlineUsers } from '../hooks/useSocket';
import { colors } from '../theme/colors';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user, updateUser, isDriver } = useAuth();
  const onlineCount = useOnlineUsers();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data: d } = await api.get('/dashboard');
      setData(d);
      if (d.user) await updateUser(d.user);
    } catch {
      setData((prev) => prev || { balance: user?.balance ?? 0, recentTransactions: [], stats: {} });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [updateUser, user?.balance]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  if (loading && !data) return <Loading />;

  const counterpartyLabel = isDriver ? 'Cliente' : 'Motorista';

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          tintColor={colors.yellow}
        />
      }
    >
      <BalanceCard
        label={isDriver ? 'Saldo a receber' : 'Saldo disponível'}
        amount={data?.balance ?? user?.balance ?? 0}
        subtitle={`${onlineCount} utilizadores online · Socket.io`}
      />

      {isDriver && user?.vehiclePlate ? (
        <Card>
          <Text style={styles.section}>Dados do veículo</Text>
          <Text style={styles.meta}>Matrícula: {user.vehiclePlate}</Text>
          {user.driverLicense ? <Text style={styles.meta}>Carta: {user.driverLicense}</Text> : null}
        </Card>
      ) : null}

      <Card>
        <Text style={styles.section}>Estatísticas</Text>
        <Text style={styles.meta}>Transações concluídas: {data?.stats?.totalTransactions ?? 0}</Text>
        <Text style={styles.meta}>Volume: {data?.stats?.volume ?? 0} Kz</Text>
      </Card>

      <View style={styles.actions}>
        {!isDriver && (
          <TouchableOpacity style={styles.action} onPress={() => navigation.navigate('QrScan')}>
            <Text style={styles.actionText}>Pagar QR</Text>
          </TouchableOpacity>
        )}
        {isDriver && (
          <TouchableOpacity style={styles.action} onPress={() => navigation.navigate('QrGenerate')}>
            <Text style={styles.actionText}>Gerar QR</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionSec} onPress={() => navigation.navigate('Wallet')}>
          <Text style={styles.actionTextSec}>Carteira</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.section}>Últimas transações</Text>
      {data?.recentTransactions?.length ? (
        data.recentTransactions.map((tx) => (
          <TransactionItem key={tx.id} tx={tx} counterpartyLabel={counterpartyLabel} />
        ))
      ) : (
        <Text style={styles.empty}>Sem transações recentes</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { color: colors.white, fontWeight: '700', fontSize: 16, marginBottom: 8 },
  meta: { color: colors.muted, fontSize: 14, marginBottom: 4 },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  action: {
    flex: 1,
    backgroundColor: colors.yellow,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionSec: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionText: { color: colors.navy, fontWeight: '700' },
  actionTextSec: { color: colors.white, fontWeight: '600' },
  empty: { color: colors.muted, textAlign: 'center', padding: 20 },
});
