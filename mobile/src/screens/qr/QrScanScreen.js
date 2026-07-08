import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import api, { errorMessage } from '../../services/api';
import { formatKz } from '../../utils/format';
import colors, { radius, spacing, font } from '../../theme/colors';

export default function QrScanScreen({ navigation, route }) {
  const { user, patchUser } = useAuth();
  const feedback = useFeedback();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [payment, setPayment] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualMode, setManualMode] = useState(route?.params?.mode === 'manual');
  const [manualCode, setManualCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Reactiva o scanner quando o ecrã ganha foco
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      setPayment(null);
      setPin('');
      setError('');
      setManualCode('');
      setManualMode(route?.params?.mode === 'manual');
    }, [route?.params?.mode])
  );

  const verifyCode = async (rawCode) => {
    const code = String(rawCode || '').trim().toUpperCase();
    if (!code) {
      setError('Introduz um código válido');
      return;
    }
    setError('');
    setVerifying(true);
    try {
      const { data: res } = await api.get(`/qr/verify/${encodeURIComponent(code)}`);
      setPayment(res.payment);
    } catch (err) {
      const msg = errorMessage(err, 'Código inválido');
      if (manualMode) {
        setError(msg);
      } else {
        feedback.showError(msg, { title: 'QR inválido' });
        setScanned(false);
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleScan = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    let code = data;
    try {
      const parsed = JSON.parse(data);
      if (parsed.code) code = parsed.code;
    } catch {
      // não era JSON; usa o texto directo
    }
    verifyCode(code);
  };

  const onPay = async () => {
    if (!user?.hasPin) {
      feedback.showError('Precisas de definir um PIN de pagamento primeiro.', { title: 'PIN necessário' });
      navigation.navigate('SetPin');
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) return setError('PIN deve ter 4 a 6 dígitos');
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/qr/pay', { code: payment.code, pin });
      patchUser({ balance: data.balance });
      feedback.showMoneyOut({ amount: Number(data.amount), to: data.payee, title: 'Pagamento efectuado' });
      navigation.navigate('Main');
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível pagar'));
    } finally {
      setLoading(false);
    }
  };

  // Ecrã de confirmação após ler o QR
  if (payment) {
    return (
      <Screen scroll>
        <View style={styles.confirmCard}>
          <Text style={styles.confirmLabel}>Vais pagar</Text>
          <Text style={styles.confirmAmount}>{formatKz(payment.amount)}</Text>
          <Text style={styles.confirmTo}>a {payment.payeeName}</Text>
          {payment.description ? <Text style={styles.confirmDesc}>{payment.description}</Text> : null}
        </View>

        <Text style={styles.saldo}>Saldo: {formatKz(user?.balance ?? 0)}</Text>

        <Input
          label="PIN de pagamento"
          placeholder="••••"
          value={pin}
          onChangeText={(t) => setPin(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          error={error}
        />

        <Button title="Confirmar pagamento" onPress={onPay} loading={loading} />
        <Button title="Cancelar" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: spacing.sm }} />
      </Screen>
    );
  }

  // Alternador entre câmara e código (segmented control)
  const ModeToggle = () => (
    <View style={styles.toggle}>
      <Pressable
        style={[styles.toggleBtn, !manualMode && styles.toggleBtnActive]}
        onPress={() => { setManualMode(false); setError(''); }}
      >
        <Text style={[styles.toggleText, !manualMode && styles.toggleTextActive]}>Câmara</Text>
      </Pressable>
      <Pressable
        style={[styles.toggleBtn, manualMode && styles.toggleBtnActive]}
        onPress={() => { setManualMode(true); setError(''); }}
      >
        <Text style={[styles.toggleText, manualMode && styles.toggleTextActive]}>Código</Text>
      </Pressable>
    </View>
  );

  // Pagamento por código (entrada manual, sem câmara)
  if (manualMode) {
    return (
      <Screen scroll>
        <ModeToggle />
        <Text style={styles.permTitle}>Pagar com código</Text>
        <Text style={[styles.info, { marginBottom: spacing.xl }]}>
          Escreve o código que aparece no QR (ex: ST-1A2B3C4D).
        </Text>
        <Input
          label="Código de pagamento"
          value={manualCode}
          onChangeText={(t) => setManualCode(t.toUpperCase())}
          placeholder="ST-XXXXXXXX"
          autoCapitalize="characters"
          error={error}
        />
        <Button title="Verificar código" onPress={() => verifyCode(manualCode)} loading={verifying} />
      </Screen>
    );
  }

  if (!permission) {
    return <Screen><Text style={styles.info}>A verificar permissões...</Text></Screen>;
  }

  if (!permission.granted) {
    return (
      <Screen contentStyle={{ justifyContent: 'center', flex: 1 }}>
        <Text style={styles.permTitle}>Câmara necessária</Text>
        <Text style={styles.info}>Precisamos da câmara para ler os QR Codes de pagamento.</Text>
        <Button title="Permitir câmara" onPress={requestPermission} style={{ marginTop: spacing.lg }} />
        <Button
          title="Pagar com código"
          variant="outline"
          onPress={() => setManualMode(true)}
          style={{ marginTop: spacing.sm }}
        />
      </Screen>
    );
  }

  return (
    <View style={styles.cameraWrap}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <Text style={styles.scanHint}>Aponta a câmara ao QR Code</Text>
        {scanned ? (
          <Pressable style={styles.rescan} onPress={() => setScanned(false)}>
            <Text style={styles.rescanText}>Tocar para ler de novo</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Barra superior: alternador câmara/código + fechar (respeita a status bar) */}
      <View style={[styles.topBar, { top: insets.top + 10 }]}>
        <View style={styles.toggleDark}>
          <Pressable style={[styles.toggleBtn, styles.toggleBtnActive]}>
            <Text style={[styles.toggleText, styles.toggleTextActive]}>Câmara</Text>
          </Pressable>
          <Pressable style={styles.toggleBtn} onPress={() => setManualMode(true)}>
            <Text style={styles.toggleText}>Código</Text>
          </Pressable>
        </View>
        <Pressable style={styles.close} onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>Fechar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraWrap: { flex: 1, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  frame: { width: 240, height: 240, borderWidth: 3, borderColor: colors.yellow, borderRadius: radius.xl, backgroundColor: 'transparent' },
  scanHint: { color: '#fff', marginTop: spacing.xl, fontSize: font.size.md, fontWeight: font.weight.semibold },
  rescan: { marginTop: spacing.lg, backgroundColor: colors.yellow, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.full },
  rescanText: { color: colors.navy, fontWeight: font.weight.bold },
  topBar: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full },
  closeText: { color: '#fff', fontWeight: font.weight.semibold },
  // Alternador câmara/código
  toggle: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.full, padding: 4, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  toggleDark: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: radius.full, padding: 4, borderWidth: 1, borderColor: colors.border },
  toggleBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full },
  toggleBtnActive: { backgroundColor: colors.yellow },
  toggleText: { color: colors.muted, fontWeight: font.weight.semibold, fontSize: font.size.sm },
  toggleTextActive: { color: colors.navy },
  info: { color: colors.muted, textAlign: 'center', fontSize: font.size.sm, paddingHorizontal: spacing.lg },
  permTitle: { color: colors.white, fontSize: font.size.xl, fontWeight: font.weight.bold, textAlign: 'center', marginBottom: spacing.sm },
  confirmCard: { backgroundColor: colors.oceanDeep, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg },
  confirmLabel: { color: 'rgba(255,255,255,0.8)', fontSize: font.size.sm },
  confirmAmount: { color: '#fff', fontSize: font.size.huge, fontWeight: font.weight.bold, marginVertical: spacing.xs },
  confirmTo: { color: '#fff', fontSize: font.size.md },
  confirmDesc: { color: 'rgba(255,255,255,0.8)', fontSize: font.size.sm, marginTop: spacing.sm, textAlign: 'center' },
  saldo: { color: colors.muted, fontSize: font.size.sm, marginBottom: spacing.lg },
});
