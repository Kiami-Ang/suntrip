import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Button from '../components/Button';
import api, { getApiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatKz } from '../utils/format';
import { colors } from '../theme/colors';

function parseQrData(raw) {
  if (!raw) return null;
  try {
    const json = JSON.parse(raw);
    return json.code || null;
  } catch {
    if (raw.startsWith('ST-')) return raw.trim();
    return null;
  }
}

export default function QrScanScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [preview, setPreview] = useState(null);
  const [paying, setPaying] = useState(false);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>A carregar câmara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Precisamos de acesso à câmara para ler QR.</Text>
        <Button title="Permitir câmara" onPress={requestPermission} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const handleScan = async ({ data }) => {
    if (scanned) return;
    const code = parseQrData(data);
    if (!code) return;

    setScanned(true);
    try {
      const { data: verify } = await api.get(`/qr/verify/${encodeURIComponent(code)}`);
      setPreview(verify.payment);
    } catch (err) {
      Alert.alert('QR inválido', getApiErrorMessage(err));
      setScanned(false);
    }
  };

  const pay = async () => {
    if (!preview?.code) return;
    setPaying(true);
    try {
      const { data } = await api.post('/qr/pay', { code: preview.code });
      await updateUser({ ...user, balance: data.balance });
      Alert.alert('Pago', `Pagamento de ${formatKz(preview.amount)} concluído`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Erro', getApiErrorMessage(err));
      setScanned(false);
      setPreview(null);
    } finally {
      setPaying(false);
    }
  };

  if (preview) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Confirmar pagamento</Text>
        <Text style={styles.amount}>{formatKz(preview.amount)}</Text>
        <Text style={styles.text}>Para: {preview.receiver?.name || 'Motorista'}</Text>
        <Text style={styles.text}>{preview.description}</Text>
        <Button title="Confirmar pagamento" onPress={pay} loading={paying} style={{ marginTop: 24, width: '90%' }} />
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={() => {
            setPreview(null);
            setScanned(false);
          }}
          style={{ marginTop: 12, width: '90%' }}
        />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Aponte para o QR Code do motorista</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.navy },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  overlayText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  center: {
    flex: 1,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: { color: colors.white, fontSize: 20, fontWeight: '700' },
  amount: { color: colors.yellow, fontSize: 32, fontWeight: '800', marginVertical: 16 },
  text: { color: colors.muted, textAlign: 'center', marginTop: 4 },
});
