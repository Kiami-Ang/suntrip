import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import api, { errorMessage } from '../services/api';
import { formatKz, initials } from '../utils/format';
import colors, { radius, spacing, font } from '../theme/colors';

export default function TransferScreen({ navigation }) {
  const { user, patchUser } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [recipient, setRecipient] = useState(null);
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recipient || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get('/users/search', { params: { q: query.trim() } });
        setResults(data.users);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query, recipient]);

  const executeTransfer = async (value) => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/wallet/transfer', {
        recipientId: recipient.id,
        amount: value,
        pin,
      });
      patchUser({ balance: data.balance });
      Alert.alert('Transferência enviada', `Enviaste ${formatKz(value)} a ${recipient.name}.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível transferir'));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = () => {
    if (!user?.hasPin) {
      Alert.alert('PIN necessário', 'Precisas de definir um PIN de pagamento primeiro.', [
        { text: 'Definir PIN', onPress: () => navigation.navigate('SetPin') },
        { text: 'Cancelar', style: 'cancel' },
      ]);
      return;
    }
    const value = Number(amount);
    if (!value || value < 50) return setError('Valor mínimo: 50 Kz');
    if (!/^\d{4,6}$/.test(pin)) return setError('PIN deve ter 4 a 6 dígitos');
    setError('');

    // Confirmação com o nome do destinatário antes de enviar
    Alert.alert(
      'Confirmar transferência',
      `Vais enviar ${formatKz(value)} a:\n\n${recipient.name}\n${recipient.phone}\n\nÉ a pessoa certa?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim, enviar', onPress: () => executeTransfer(value) },
      ]
    );
  };

  if (recipient) {
    return (
      <Screen scroll>
        <View style={styles.recipientCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(recipient.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rName}>{recipient.name}</Text>
            <Text style={styles.rPhone}>{recipient.phone}</Text>
          </View>
          <Pressable onPress={() => { setRecipient(null); setAmount(''); setPin(''); setError(''); }}>
            <Text style={styles.change}>Mudar</Text>
          </Pressable>
        </View>

        <Text style={styles.saldo}>Saldo: {formatKz(user?.balance ?? 0)}</Text>

        <Input label="Valor" placeholder="0" value={amount} onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" rightText="Kz" />
        <Input label="PIN de pagamento" placeholder="••••" value={pin} onChangeText={(t) => setPin(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" secureTextEntry maxLength={6} error={error} />

        <Button title="Confirmar transferência" onPress={onSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Input
        label="Para quem?"
        placeholder="Telefone, email ou nome"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />

      {searching ? <ActivityIndicator color={colors.ocean} style={{ marginTop: spacing.md }} /> : null}

      {results.map((u) => (
        <Pressable key={u.id} style={styles.result} onPress={() => { setRecipient(u); setQuery(''); }}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(u.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rName}>{u.name}</Text>
            <Text style={styles.rPhone}>{u.phone} · {u.userType === 'driver' ? 'Motorista' : 'Cliente'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>
      ))}

      {query.trim().length >= 2 && !searching && results.length === 0 ? (
        <Text style={styles.empty}>Nenhum utilizador encontrado.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  result: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  recipientCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  avatar: { width: 48, height: 48, borderRadius: radius.full, backgroundColor: colors.oceanDeep, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  avatarText: { color: '#fff', fontWeight: font.weight.bold, fontSize: font.size.md },
  rName: { color: colors.white, fontSize: font.size.md, fontWeight: font.weight.semibold },
  rPhone: { color: colors.muted, fontSize: font.size.xs, marginTop: 2 },
  change: { color: colors.ocean, fontWeight: font.weight.semibold },
  saldo: { color: colors.muted, fontSize: font.size.sm, marginBottom: spacing.lg },
  empty: { color: colors.muted, textAlign: 'center', marginTop: spacing.xl },
});
