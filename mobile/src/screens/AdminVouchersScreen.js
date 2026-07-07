import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import api, { errorMessage } from '../services/api';
import { formatKz } from '../utils/format';
import colors, { radius, spacing, font } from '../theme/colors';

const PRESETS = [500, 1000, 2000, 5000, 10000];

export default function AdminVouchersScreen() {
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState([]);

  const onGenerate = async () => {
    const value = Number(amount);
    const qty = Number(quantity);
    if (!value || value < 100) return setError('Valor mínimo: 100 Kz');
    if (!qty || qty < 1 || qty > 100) return setError('Quantidade entre 1 e 100');
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/wallet/vouchers/generate', { amount: value, quantity: qty });
      setVouchers(data.vouchers);
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível gerar'));
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copiado', 'Código copiado para a área de transferência.');
  };

  const copyAll = async () => {
    const text = vouchers.map((v) => `${v.code}  —  ${formatKz(v.amount)}`).join('\n');
    await Clipboard.setStringAsync(text);
    Alert.alert('Copiado', 'Todos os códigos foram copiados.');
  };

  return (
    <Screen scroll>
      <Text style={styles.label}>Valor de cada voucher</Text>
      <Input placeholder="0" value={amount} onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" rightText="Kz" />
      <View style={styles.presets}>
        {PRESETS.map((p) => (
          <Pressable key={p} style={styles.preset} onPress={() => setAmount(String(p))}>
            <Text style={styles.presetText}>{formatKz(p)}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, { marginTop: spacing.lg }]}>Quantidade</Text>
      <Input placeholder="1" value={quantity} onChangeText={(t) => setQuantity(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" error={error} />

      <Button title="Gerar vouchers" onPress={onGenerate} loading={loading} style={{ marginTop: spacing.md }} />

      {vouchers.length ? (
        <>
          <View style={styles.resultHead}>
            <Text style={styles.resultTitle}>{vouchers.length} voucher(s) gerado(s)</Text>
            <Pressable onPress={copyAll} style={styles.copyAll}>
              <Ionicons name="copy" size={16} color={colors.navy} />
              <Text style={styles.copyAllText}>Copiar todos</Text>
            </Pressable>
          </View>
          {vouchers.map((v) => (
            <Pressable key={v.id} style={styles.voucher} onPress={() => copy(v.code)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.voucherCode}>{v.code}</Text>
                <Text style={styles.voucherAmount}>{formatKz(v.amount)}</Text>
              </View>
              <Ionicons name="copy-outline" size={20} color={colors.ocean} />
            </Pressable>
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.white, fontSize: font.size.md, fontWeight: font.weight.semibold, marginBottom: spacing.sm },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  preset: { backgroundColor: colors.surface, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
  presetText: { color: colors.white, fontSize: font.size.sm, fontWeight: font.weight.medium },
  resultHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.sm },
  resultTitle: { color: colors.white, fontWeight: font.weight.semibold },
  copyAll: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.yellow, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full },
  copyAllText: { color: colors.navy, fontWeight: font.weight.bold, fontSize: font.size.xs },
  voucher: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  voucherCode: { color: colors.white, fontSize: font.size.md, fontWeight: font.weight.bold, letterSpacing: 1 },
  voucherAmount: { color: colors.ocean, fontSize: font.size.sm, marginTop: 2 },
});
