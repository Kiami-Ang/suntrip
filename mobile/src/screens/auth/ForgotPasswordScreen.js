import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { errorMessage } from '../../services/api';
import { validateEmail } from '../../utils/validation';
import colors, { radius, spacing, font } from '../../theme/colors';

export default function ForgotPasswordScreen({ navigation }) {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const em = validateEmail(email);
    if (!em.ok) {
      setError(em.message);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await forgotPassword(em.value);
      navigation.navigate('ResetPassword', { email: em.value });
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível enviar o código.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll contentStyle={{ flexGrow: 1, justifyContent: 'center' }}>
      <View style={styles.iconWrap}>
        <Ionicons name="lock-closed" size={38} color={colors.yellow} />
      </View>
      <Text style={styles.title}>Recuperar palavra-passe</Text>
      <Text style={styles.subtitle}>
        Escreve o email da tua conta. Vamos enviar-te um código de 6 dígitos para redefinires a palavra-passe.
      </Text>

      <Input
        label="Email"
        placeholder="exemplo@gmail.com"
        value={email}
        onChangeText={(t) => setEmail(t.toLowerCase())}
        keyboardType="email-address"
        error={error}
      />

      <Button title="Enviar código" onPress={onSubmit} loading={loading} />
      <Button
        title="Já tenho um código"
        variant="ghost"
        onPress={() => navigation.navigate('ResetPassword', { email: email.trim().toLowerCase() })}
        style={{ marginTop: spacing.sm }}
      />
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
});
