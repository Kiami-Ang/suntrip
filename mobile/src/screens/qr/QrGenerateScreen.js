import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api, { errorMessage } from '../../services/api';
import { formatKz } from '../../utils/format';
import colors, { radius, spacing, font } from '../../theme/colors';

export default function QrGenerateScreen() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState(null);

  const onGenerate = async () => {
    const value = Number(amount);
    if (!value || value < 1) return setError('Indica um valor válido');
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/qr/generate', { amount: value, description });
      setQr(data);
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível gerar o QR'));
    } finally {
      setLoading(false);
    }
  };

  if (qr) {
    return (
      <Screen scroll contentStyle={{ alignItems: 'center' }}>
        <Text style={styles.amount}>{formatKz(qr.payment.amount)}</Text>
        <Text style={styles.desc}>{qr.payment.description}</Text>

        <View style={styles.qrBox}>
          <Image source={{ uri: qr.qrDataUrl }} style={styles.qrImg} />
        </View>

        <Text style={styles.code}>Código: {qr.payment.code}</Text>
        <Text style={styles.hint}>Mostra este QR ao cliente para receber o pagamento.</Text>

        <Button title="Gerar outro" variant="outline" onPress={() => { setQr(null); setAmount(''); setDescription(''); }} style={{ marginTop: spacing.xl, alignSelf: 'stretch' }} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={styles.label}>Valor a cobrar</Text>
      <Input placeholder="0" value={amount} onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" rightText="Kz" error={error} />
      <Input label="Descrição (opcional)" placeholder="Ex: Corrida Talatona → Aeroporto" value={description} onChangeText={setDescription} autoCapitalize="sentences" />
      <Button title="Gerar QR Code" onPress={onGenerate} loading={loading} style={{ marginTop: spacing.sm }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.white, fontSize: font.size.lg, fontWeight: font.weight.semibold, marginBottom: spacing.md },
  amount: { color: colors.white, fontSize: font.size.huge, fontWeight: font.weight.bold, marginTop: spacing.md },
  desc: { color: colors.muted, marginBottom: spacing.xl },
  qrBox: { backgroundColor: '#fff', padding: spacing.lg, borderRadius: radius.xl },
  qrImg: { width: 240, height: 240 },
  code: { color: colors.ocean, fontWeight: font.weight.bold, fontSize: font.size.md, marginTop: spacing.lg, letterSpacing: 1 },
  hint: { color: colors.muted, fontSize: font.size.sm, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.xl },
});
