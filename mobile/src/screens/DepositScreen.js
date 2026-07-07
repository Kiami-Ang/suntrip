import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import api, { errorMessage } from '../services/api';
import { formatKz } from '../utils/format';
import colors, { radius, spacing, font } from '../theme/colors';

const PRESETS = [500, 1000, 2000, 5000, 10000];

export default function DepositScreen({ navigation }) {
  const { patchUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const value = Number(amount);
    if (!value || value < 100) {
      setError('Valor mínimo: 100 Kz');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/wallet/deposit', { amount: value });
      patchUser({ balance: data.balance });
      Alert.alert('Saldo carregado', `Novo saldo: ${formatKz(data.balance)}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível carregar'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.label}>Quanto queres carregar?</Text>
      <Input
        placeholder="0"
        value={amount}
        onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        error={error}
        rightText="Kz"
      />

      <View style={styles.presets}>
        {PRESETS.map((p) => (
          <Pressable key={p} style={styles.preset} onPress={() => setAmount(String(p))}>
            <Text style={styles.presetText}>{formatKz(p)}</Text>
          </Pressable>
        ))}
      </View>

      <Button title="Carregar saldo" onPress={onSubmit} loading={loading} style={{ marginTop: spacing.xl }} />
      <Text style={styles.note}>
        Numa versão futura, o carregamento será feito por Multicaixa Express / referência bancária.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.white, fontSize: font.size.lg, fontWeight: font.weight.semibold, marginBottom: spacing.md },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  preset: { backgroundColor: colors.surface, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
  presetText: { color: colors.white, fontSize: font.size.sm, fontWeight: font.weight.medium },
  note: { color: colors.mutedDark, fontSize: font.size.xs, marginTop: spacing.lg, textAlign: 'center' },
});
