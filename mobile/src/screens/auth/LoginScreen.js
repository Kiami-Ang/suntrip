import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { errorMessage } from '../../services/api';
import { validateEmail } from '../../utils/validation';
import colors, { spacing, font } from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const e = {};
    const em = validateEmail(email);
    if (!em.ok) e.email = em.message;
    if (!password) e.password = 'Palavra-passe é obrigatória';
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      await login(em.value, password);
    } catch (err) {
      setErrors({ form: errorMessage(err, 'Não foi possível entrar') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>
          Sun<Text style={{ color: colors.yellow }}>Trip</Text>
        </Text>
        <Text style={styles.tagline}>Carteira digital e pagamentos de transporte</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.title}>Entrar</Text>

        {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}

        <Input
          label="Email"
          placeholder="exemplo@gmail.com"
          value={email}
          onChangeText={(t) => setEmail(t.toLowerCase())}
          keyboardType="email-address"
          error={errors.email}
        />
        <Input
          label="Palavra-passe"
          placeholder="••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />

        <Button title="Entrar" onPress={onSubmit} loading={loading} style={{ marginTop: spacing.sm }} />

        <Pressable style={styles.forgot} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.link}>Esqueci-me da palavra-passe</Text>
        </Pressable>

        <Pressable style={styles.footer} onPress={() => navigation.navigate('RegisterChoose')}>
          <Text style={styles.footerText}>
            Ainda não tens conta? <Text style={styles.link}>Criar conta</Text>
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.xxl },
  logo: { fontSize: 44, fontWeight: font.weight.bold, color: colors.ocean },
  tagline: { color: colors.muted, marginTop: spacing.sm, textAlign: 'center' },
  form: {},
  title: { color: colors.white, fontSize: font.size.xl, fontWeight: font.weight.bold, marginBottom: spacing.lg },
  formError: {
    color: colors.danger,
    backgroundColor: colors.dangerBg,
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  forgot: { marginTop: spacing.lg, alignItems: 'center' },
  footer: { marginTop: spacing.xl, alignItems: 'center' },
  footerText: { color: colors.muted },
  link: { color: colors.ocean, fontWeight: font.weight.semibold },
});
