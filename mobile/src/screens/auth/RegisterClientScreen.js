import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { errorMessage } from '../../services/api';
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateName,
  sanitizePhone,
} from '../../utils/validation';
import colors, { spacing, font } from '../../theme/colors';

export default function RegisterClientScreen() {
  const { registerClient } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirm: '', address: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: k === 'phone' ? sanitizePhone(v) : k === 'email' ? v.toLowerCase() : v }));

  const onSubmit = async () => {
    const e = {};
    const n = validateName(form.name);
    if (!n.ok) e.name = n.message;
    const ph = validatePhone(form.phone);
    if (!ph.ok) e.phone = ph.message;
    const em = validateEmail(form.email);
    if (!em.ok) e.email = em.message;
    const pw = validatePassword(form.password);
    if (!pw.ok) e.password = pw.message;
    if (form.password !== form.confirm) e.confirm = 'As palavras-passe não coincidem';
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      await registerClient({
        name: n.value,
        phone: ph.value,
        email: em.value,
        password: form.password,
        address: form.address,
      });
    } catch (err) {
      setErrors({ form: errorMessage(err, 'Não foi possível criar a conta') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}

      <Input label="Nome completo" placeholder="Ex: João Manuel" value={form.name} onChangeText={set('name')} autoCapitalize="words" error={errors.name} />
      <Input label="Telefone" placeholder="9XXXXXXXX" value={form.phone} onChangeText={set('phone')} keyboardType="number-pad" maxLength={9} error={errors.phone} hint="9 dígitos, começa por 9" />
      <Input label="Email" placeholder="exemplo@gmail.com" value={form.email} onChangeText={set('email')} keyboardType="email-address" error={errors.email} />
      <Input label="Palavra-passe" placeholder="Mínimo 6 caracteres" value={form.password} onChangeText={set('password')} secureTextEntry error={errors.password} />
      <Input label="Confirmar palavra-passe" placeholder="Repita a palavra-passe" value={form.confirm} onChangeText={set('confirm')} secureTextEntry error={errors.confirm} />
      <Input label="Endereço (opcional)" placeholder="Bairro, município" value={form.address} onChangeText={set('address')} autoCapitalize="sentences" />

      <Button title="Criar conta" onPress={onSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  formError: {
    color: colors.danger,
    backgroundColor: colors.dangerBg,
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    fontSize: font.size.sm,
  },
});
