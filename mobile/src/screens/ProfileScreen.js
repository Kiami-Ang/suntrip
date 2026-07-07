import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { initials, formatKz } from '../utils/format';
import colors, { radius, spacing, font } from '../theme/colors';

function Row({ icon, label, value, onPress, danger }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.row, pressed && onPress && { opacity: 0.85 }]}>
      <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.ocean} style={{ width: 28 }} />
      <Text style={[styles.rowLabel, danger && { color: colors.danger }]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress && !value ? <Ionicons name="chevron-forward" size={18} color={colors.muted} /> : null}
    </Pressable>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert('Terminar sessão', 'Tens a certeza que queres sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <Screen scroll>
      <View style={styles.head}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(user?.name)}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user?.userType === 'driver' ? 'Motorista' : 'Cliente'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Row icon="wallet" label="Saldo" value={formatKz(user?.balance ?? 0)} />
        <Row icon="mail" label="Email" value={user?.email} />
        <Row icon="call" label="Telefone" value={user?.phone} />
      </View>

      <Text style={styles.section}>Segurança</Text>
      <View style={styles.card}>
        <Row
          icon="shield-checkmark"
          label={user?.hasPin ? 'Alterar PIN de pagamento' : 'Definir PIN de pagamento'}
          onPress={() => navigation.navigate('SetPin')}
        />
      </View>

      {user?.userType === 'driver' ? (
        <>
          <Text style={styles.section}>Dados profissionais</Text>
          <View style={styles.card}>
            <Row icon="card" label="Matrícula" value={user?.vehiclePlate || '—'} />
            <Row icon="document-text" label="Carta" value={user?.driverLicense || '—'} />
          </View>
        </>
      ) : null}

      <View style={[styles.card, { marginTop: spacing.xl }]}>
        <Row icon="log-out" label="Terminar sessão" danger onPress={confirmLogout} />
      </View>

      <Text style={styles.version}>SunTrip v1.0.0</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 84, height: 84, borderRadius: radius.full, backgroundColor: colors.oceanDeep, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: font.weight.bold },
  name: { color: colors.white, fontSize: font.size.xl, fontWeight: font.weight.bold, marginTop: spacing.md },
  badge: { backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.full, marginTop: spacing.sm },
  badgeText: { color: colors.ocean, fontSize: font.size.xs, fontWeight: font.weight.semibold },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowLabel: { color: colors.white, fontSize: font.size.md, flex: 1, marginLeft: spacing.sm },
  rowValue: { color: colors.muted, fontSize: font.size.sm },
  section: { color: colors.muted, fontSize: font.size.xs, fontWeight: font.weight.bold, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.xl, marginBottom: spacing.sm, marginLeft: spacing.xs },
  version: { color: colors.mutedDark, textAlign: 'center', marginTop: spacing.xl, fontSize: font.size.xs },
});
