import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import api, { getApiErrorMessage } from '../services/api';
import { formatKz } from '../utils/format';
import { colors } from '../theme/colors';

export default function QrGenerateScreen() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Pagamento corrida');
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    const value = Number(amount);
    if (!value || value < 1) return Alert.alert('Validação', 'Valor inválido');
    setLoading(true);
    try {
      const { data } = await api.post('/qr/generate', { amount: value, description });
      setQr(data);
    } catch (err) {
      Alert.alert('Erro', getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      {!qr ? (
        <>
          <Input label="Valor (Kz)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
          <Input label="Descrição" value={description} onChangeText={setDescription} />
          <Button title="Gerar QR" onPress={generate} loading={loading} />
        </>
      ) : (
        <View style={styles.qrWrap}>
          <Text style={styles.amount}>{formatKz(qr.payment?.amount)}</Text>
          <Text style={styles.code}>{qr.payment?.code}</Text>
          {qr.qrDataUrl ? (
            <Image source={{ uri: qr.qrDataUrl }} style={styles.img} resizeMode="contain" />
          ) : (
            <View style={styles.svgWrap}>
              <QRCode value={qr.payload || qr.payment?.code} size={240} />
            </View>
          )}
          <Text style={styles.exp}>Válido até: {new Date(qr.payment?.expiresAt).toLocaleString('pt-AO')}</Text>
          <Button title="Novo QR" variant="secondary" onPress={() => setQr(null)} style={{ marginTop: 20 }} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  qrWrap: { alignItems: 'center', paddingTop: 12 },
  amount: { color: colors.yellow, fontSize: 28, fontWeight: '800' },
  code: { color: colors.muted, marginVertical: 8 },
  img: { width: 280, height: 280, marginVertical: 16 },
  svgWrap: { marginVertical: 16, padding: 16, backgroundColor: '#fff', borderRadius: 16 },
  exp: { color: colors.muted, fontSize: 12, marginTop: 8 },
});
