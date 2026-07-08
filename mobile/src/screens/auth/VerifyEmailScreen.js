import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import { errorMessage } from '../../services/api';
import colors, { radius, spacing, font } from '../../theme/colors';

export default function VerifyEmailScreen() {
  const { user, verifyEmail, resendCode, logout } = useAuth();
  const feedback = useFeedback();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const onVerify = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError('O código tem 6 dígitos');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifyEmail(code);
    } catch (err) {
      setError(errorMessage(err, 'Código incorrecto'));
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setResending(true);
    try {
      await resendCode();
      feedback.showSuccess('Verifica o teu email (e a pasta de spam).', { title: 'Código enviado' });
    } catch (err) {
      feedback.showError(errorMessage(err, 'Não foi possível reenviar'), { title: 'Erro' });
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen scroll contentStyle={{ flex: 1, justifyContent: 'center' }}>
      <View style={styles.iconWrap}>
        <Ionicons name="mail-open" size={40} color={colors.yellow} />
      </View>
      <Text style={styles.title}>Confirma o teu email</Text>
      <Text style={styles.subtitle}>
        Enviámos um código de 6 dígitos para {'\n'}
        <Text style={styles.email}>{user?.email}</Text>
      </Text>

      <Input
        label="Código de verificação"
        placeholder="000000"
        value={code}
        onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        maxLength={6}
        error={error}
      />

      <Button title="Verificar" onPress={onVerify} loading={loading} />
      <Button title="Reenviar código" variant="outline" onPress={onResend} loading={resending} style={{ marginTop: spacing.sm }} />
      <Button title="Sair" variant="ghost" onPress={logout} style={{ marginTop: spacing.sm }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignSelf: 'center', width: 84, height: 84, borderRadius: radius.full, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  title: { color: colors.white, fontSize: font.size.xl, fontWeight: font.weight.bold, textAlign: 'center' },
  subtitle: { color: colors.muted, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xl, fontSize: font.size.sm },
  email: { color: colors.ocean, fontWeight: font.weight.semibold },
});
