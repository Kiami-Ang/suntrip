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

export default function RegisterDriverScreen() {
  const { registerDriver } = useAuth();
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '', confirm: '',
    bankAccount: '', driverLicense: '', vehiclePlate: '', idDocument: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (v) =>
    setForm((f) => ({
      ...f,
      [k]:
        k === 'phone' ? sanitizePhone(v)
        : k === 'email' ? v.toLowerCase()
        : k === 'vehiclePlate' ? v.toUpperCase()
        : v,
    }));

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
    if (form.bankAccount.trim().length < 4) e.bankAccount = 'Conta bancária / IBAN é obrigatória';
    if (form.driverLicense.trim().length < 3) e.driverLicense = 'Carta de condução é obrigatória';
    if (form.vehiclePlate.trim().length < 5) e.vehiclePlate = 'Matrícula inválida (ex: LD-45-23-AB)';
    if (form.idDocument.trim().length < 3) e.idDocument = 'Documento de identificação é obrigatório';
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      await registerDriver({
        name: n.value,
        phone: ph.value,
        email: em.value,
        password: form.password,
        bankAccount: form.bankAccount.trim(),
        driverLicense: form.driverLicense.trim(),
        vehiclePlate: form.vehiclePlate.trim(),
        idDocument: form.idDocument.trim(),
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

      <Input label="Nome completo" placeholder="Ex: Carlos Alberto" value={form.name} onChangeText={set('name')} autoCapitalize="words" error={errors.name} />
      <Input label="Telefone" placeholder="9XXXXXXXX" value={form.phone} onChangeText={set('phone')} keyboardType="number-pad" maxLength={9} error={errors.phone} hint="9 dígitos, começa por 9" />
      <Input label="Email" placeholder="exemplo@gmail.com" value={form.email} onChangeText={set('email')} keyboardType="email-address" error={errors.email} />
      <Input label="Palavra-passe" placeholder="Mínimo 6 caracteres" value={form.password} onChangeText={set('password')} secureTextEntry error={errors.password} />
      <Input label="Confirmar palavra-passe" placeholder="Repita a palavra-passe" value={form.confirm} onChangeText={set('confirm')} secureTextEntry error={errors.confirm} />

      <Text style={styles.section}>Dados profissionais</Text>
      <Input label="Conta bancária / IBAN" placeholder="AO06..." value={form.bankAccount} onChangeText={set('bankAccount')} error={errors.bankAccount} />
      <Input label="Carta de condução" placeholder="Nº da carta" value={form.driverLicense} onChangeText={set('driverLicense')} error={errors.driverLicense} />
      <Input label="Matrícula do veículo" placeholder="LD-45-23-AB" value={form.vehiclePlate} onChangeText={set('vehiclePlate')} autoCapitalize="characters" error={errors.vehiclePlate} />
      <Input label="Documento de identificação (BI)" placeholder="Nº do BI" value={form.idDocument} onChangeText={set('idDocument')} error={errors.idDocument} />

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
  section: {
    color: colors.ocean,
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
});
