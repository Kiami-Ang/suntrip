import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import api, { errorMessage } from '../services/api';
import { formatKz } from '../utils/format';
import colors, { radius, spacing, font } from '../theme/colors';

export default function DepositScreen({ navigation }) {
  const { patchUser } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const clean = code.trim().toUpperCase();
    if (clean.length < 8) {
      setError('Introduz um código de recarga válido');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/wallet/redeem', { code: clean });
      patchUser({ balance: data.balance });
      Alert.alert(
        'Saldo carregado',
        `Adicionaste ${formatKz(data.amount)}.\nNovo saldo: ${formatKz(data.balance)}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível recarregar'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <Ionicons name="ticket" size={34} color={colors.yellow} />
        <Text style={styles.heroTitle}>Recarregar com código</Text>
        <Text style={styles.heroText}>
          Introduz o código do teu voucher de recarga SunTrip para adicionar saldo à tua carteira.
        </Text>
      </View>

      <Input
        label="Código de recarga"
        placeholder="SUN-XXXX-XXXX-XXXX"
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase())}
        autoCapitalize="characters"
        error={error}
      />

      <Button title="Recarregar" onPress={onSubmit} loading={loading} style={{ marginTop: spacing.sm }} />

      <Text style={styles.note}>
        Os vouchers de recarga são adquiridos junto de um agente SunTrip autorizado. Cada código só
        pode ser usado uma vez.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  heroTitle: { color: colors.white, fontSize: font.size.xl, fontWeight: font.weight.bold, marginTop: spacing.md },
  heroText: { color: colors.muted, textAlign: 'center', marginTop: spacing.sm, fontSize: font.size.sm, paddingHorizontal: spacing.md },
  note: { color: colors.mutedDark, fontSize: font.size.xs, marginTop: spacing.xl, textAlign: 'center' },
});
