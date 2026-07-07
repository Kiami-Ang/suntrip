import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../components/Screen';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { formatKz } from '../utils/format';
import { pickAvatar } from '../utils/image';
import { errorMessage } from '../services/api';
import colors, { radius, spacing, font } from '../theme/colors';

function Row({ icon, label, value, onPress, danger, last }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, last && styles.rowLast, pressed && onPress && { opacity: 0.85 }]}
    >
      <View style={[styles.rowIcon, danger && { backgroundColor: colors.dangerBg }]}>
        <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.ocean} />
      </View>
      <Text style={[styles.rowLabel, danger && { color: colors.danger }]}>{label}</Text>
      {value ? <Text style={styles.rowValue} numberOfLines={1}>{value}</Text> : null}
      {onPress && !value ? <Ionicons name="chevron-forward" size={18} color={colors.muted} /> : null}
    </Pressable>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateAvatar } = useAuth();
  const [uploading, setUploading] = useState(false);

  const displayName = user?.userType === 'business' && user?.businessName ? user.businessName : user?.name;
  const typeLabel = user?.userType === 'driver' ? 'Motorista' : user?.userType === 'business' ? 'Negócio' : 'Cliente';

  const changePhoto = async (source) => {
    try {
      setUploading(true);
      const dataUrl = await pickAvatar(source);
      if (!dataUrl) return;
      await updateAvatar(dataUrl);
    } catch (err) {
      Alert.alert('Foto de perfil', errorMessage(err, 'Não foi possível atualizar a foto.'));
    } finally {
      setUploading(false);
    }
  };

  const onAvatarPress = () => {
    const options = [
      { text: 'Escolher da galeria', onPress: () => changePhoto('library') },
      { text: 'Tirar foto', onPress: () => changePhoto('camera') },
    ];
    if (user?.avatar) {
      options.push({
        text: 'Remover foto',
        style: 'destructive',
        onPress: async () => {
          try {
            setUploading(true);
            await updateAvatar('');
          } finally {
            setUploading(false);
          }
        },
      });
    }
    options.push({ text: 'Cancelar', style: 'cancel' });
    Alert.alert('Foto de perfil', 'Escolhe uma opção', options);
  };

  const confirmLogout = () => {
    Alert.alert('Terminar sessão', 'Tens a certeza que queres sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <Screen scroll>
      <LinearGradient
        colors={[colors.oceanDeep, colors.navyLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Pressable onPress={onAvatarPress} style={styles.avatarWrap}>
          <Avatar uri={user?.avatar} name={user?.name} size={96} style={styles.avatarRing} />
          <View style={styles.cameraBadge}>
            {uploading ? (
              <ActivityIndicator size="small" color={colors.navy} />
            ) : (
              <Ionicons name="camera" size={16} color={colors.navy} />
            )}
          </View>
        </Pressable>
        <Text style={styles.name}>{displayName}</Text>
        <View style={styles.badge}>
          <Ionicons
            name={user?.userType === 'driver' ? 'car' : user?.userType === 'business' ? 'storefront' : 'person'}
            size={12}
            color={colors.navy}
          />
          <Text style={styles.badgeText}>{typeLabel}</Text>
        </View>
      </LinearGradient>

      <Text style={styles.section}>Conta</Text>
      <View style={styles.card}>
        <Row icon="wallet" label="Saldo" value={formatKz(user?.balance ?? 0)} />
        <Row
          icon={user?.emailVerified ? 'checkmark-circle' : 'mail'}
          label="Email"
          value={user?.emailVerified ? `${user?.email} ✓` : user?.email}
        />
        <Row icon="call" label="Telefone" value={user?.phone} last />
      </View>

      <Text style={styles.section}>Segurança</Text>
      <View style={styles.card}>
        <Row
          icon="shield-checkmark"
          label={user?.hasPin ? 'Alterar PIN de pagamento' : 'Definir PIN de pagamento'}
          onPress={() => navigation.navigate('SetPin')}
          last
        />
      </View>

      {user?.userType === 'driver' ? (
        <>
          <Text style={styles.section}>Dados profissionais</Text>
          <View style={styles.card}>
            <Row icon="card" label="Matrícula" value={user?.vehiclePlate || '—'} />
            <Row icon="document-text" label="Carta" value={user?.driverLicense || '—'} last />
          </View>
        </>
      ) : null}

      {user?.userType === 'business' ? (
        <>
          <Text style={styles.section}>Dados do negócio</Text>
          <View style={styles.card}>
            <Row icon="storefront" label="Negócio" value={user?.businessName || '—'} />
            <Row icon="pricetag" label="Categoria" value={user?.businessCategory || '—'} last={!user?.businessNif} />
            {user?.businessNif ? <Row icon="document-text" label="NIF" value={user.businessNif} last /> : null}
          </View>
        </>
      ) : null}

      {user?.role === 'admin' ? (
        <>
          <Text style={styles.section}>Administração</Text>
          <View style={styles.card}>
            <Row icon="ticket" label="Gerar vouchers de recarga" onPress={() => navigation.navigate('AdminVouchers')} last />
          </View>
        </>
      ) : null}

      <View style={[styles.card, { marginTop: spacing.xl }]}>
        <Row icon="log-out" label="Terminar sessão" danger onPress={confirmLogout} last />
      </View>

      <Text style={styles.version}>SunTrip v1.0.0</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarWrap: { position: 'relative' },
  avatarRing: { borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)' },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.navy,
  },
  name: { color: '#fff', fontSize: font.size.xl, fontWeight: font.weight.bold, marginTop: spacing.md },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.yellow,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  badgeText: { color: colors.navy, fontSize: font.size.xs, fontWeight: font.weight.bold },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowLabel: { color: colors.white, fontSize: font.size.md, flex: 1 },
  rowValue: { color: colors.muted, fontSize: font.size.sm, maxWidth: '45%' },
  section: {
    color: colors.muted,
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  version: { color: colors.mutedDark, textAlign: 'center', marginTop: spacing.xl, fontSize: font.size.xs },
});
