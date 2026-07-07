import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import BalanceCard from '../components/BalanceCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import colors, { radius, spacing, font } from '../theme/colors';

function ActionRow({ icon, title, subtitle, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={22} color={colors.ocean} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </Pressable>
  );
}

export default function WalletScreen({ navigation }) {
  const { user, patchUser } = useAuth();
  const [hidden, setHidden] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/wallet/balance');
      patchUser({ balance: data.balance });
    } catch {}
  }, [patchUser]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <Screen scroll refreshing={refreshing} onRefresh={onRefresh}>
      <Text style={styles.h1}>Carteira</Text>

      <BalanceCard
        balance={user?.balance ?? 0}
        name={user?.name}
        hidden={hidden}
        onToggleHidden={() => setHidden((h) => !h)}
      />

      {!user?.hasPin ? (
        <Pressable style={styles.pinAlert} onPress={() => navigation.navigate('SetPin')}>
          <Ionicons name="shield-half" size={20} color={colors.warning} />
          <Text style={styles.pinAlertText}>Define o teu PIN de pagamento para transferir e pagar.</Text>
        </Pressable>
      ) : null}

      <View style={styles.card}>
        <ActionRow icon="add-circle" title="Carregar saldo" subtitle="Recarrega com um código de voucher" onPress={() => navigation.navigate('Deposit')} />
        <ActionRow icon="paper-plane" title="Transferir" subtitle="Enviar para outro utilizador" onPress={() => navigation.navigate('Transfer')} />
        <ActionRow icon="qr-code" title="Receber com QR" subtitle="Gera um código de cobrança" onPress={() => navigation.navigate('QrGenerate')} />
        <ActionRow icon="scan" title="Pagar com QR" subtitle="Lê um código para pagar" onPress={() => navigation.navigate('QrScan')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.white, fontSize: font.size.xxl, fontWeight: font.weight.bold, marginBottom: spacing.lg },
  pinAlert: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.warningBg, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.lg,
    borderWidth: 1, borderColor: colors.warning,
  },
  pinAlertText: { color: colors.warning, flex: 1, fontSize: font.size.sm },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: spacing.lg, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  rowTitle: { color: colors.white, fontSize: font.size.md, fontWeight: font.weight.semibold },
  rowSub: { color: colors.muted, fontSize: font.size.xs, marginTop: 2 },
});
