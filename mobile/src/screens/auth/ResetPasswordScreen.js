import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import { errorMessage } from '../../services/api';
import { validateEmail } from '../../utils/validation';
import colors, { radius, spacing, font } from '../../theme/colors';

export default function ResetPasswordScreen({ route }) {
  const { resetPassword, forgotPassword } = useAuth();
  const feedback = useFeedback();
  const initialEmail = route.params?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const onSubmit = async () => {
    const e = {};
    const em = validateEmail(email);
    if (!em.ok) e.email = em.message;
    if (!/^\d{6}$/.test(code)) e.code = 'O código tem 6 dígitos';
    if (password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (password !== confirm) e.confirm = 'As palavras-passe não coincidem';
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      await resetPassword(em.value, code, password);
      // resetPassword inicia a sessão automaticamente (login).
    } catch (err) {
      setErrors({ form: errorMessage(err, 'Não foi possível redefinir a palavra-passe.') });
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    const em = validateEmail(email);
    if (!em.ok) {
      setErrors({ email: em.message });
      return;
    }
    setResending(true);
    try {
      await forgotPassword(em.value);
      feedback.showSuccess('Verifica o teu email (e a pasta de spam).', { title: 'Código enviado' });
    } catch (err) {
      feedback.showError(errorMessage(err, 'Não foi possível reenviar'), { title: 'Erro' });
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen scroll contentStyle={{ flexGrow: 1, justifyContent: 'center' }}>
      <View style={styles.iconWrap}>
        <Ionicons name="key" size={36} color={colors.yellow} />
      </View>
      <Text style={styles.title}>Nova palavra-passe</Text>
      <Text style={styles.subtitle}>Introduz o código recebido por email e a tua nova palavra-passe.</Text>

      {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}

      {!initialEmail ? (
        <Input
          label="Email"
          placeholder="exemplo@gmail.com"
          value={email}
          onChangeText={(t) => setEmail(t.toLowerCase())}
          keyboardType="email-address"
          error={errors.email}
        />
      ) : null}

      <Input
        label="Código de 6 dígitos"
        placeholder="000000"
        value={code}
        onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        maxLength={6}
        error={errors.code}
      />
      <Input
        label="Nova palavra-passe"
        placeholder="••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
      />
      <Input
        label="Confirmar palavra-passe"
        placeholder="••••••"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        error={errors.confirm}
      />

      <Button title="Redefinir e entrar" onPress={onSubmit} loading={loading} />
      <Button title="Reenviar código" variant="outline" onPress={onResend} loading={resending} style={{ marginTop: spacing.sm }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignSelf: 'center',
    width: 84,
    height: 84,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { color: colors.white, fontSize: font.size.xl, fontWeight: font.weight.bold, textAlign: 'center' },
  subtitle: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    fontSize: font.size.sm,
    lineHeight: 20,
  },
  formError: {
    color: colors.danger,
    backgroundColor: colors.dangerBg,
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
});
