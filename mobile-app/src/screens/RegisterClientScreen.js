import { useState } from 'react';
import { Alert } from 'react-native';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/api';
import {
  sanitizeAngolanPhoneInput,
  validateBankAccount,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '../utils/validation';

export default function RegisterClientScreen() {
  const { registerClient } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirm: '',
    bankAccount: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    const nameV = validateName(form.name);
    const phoneV = validatePhone(form.phone);
    const emailV = validateEmail(form.email);
    const passV = validatePassword(form.password);
    const bankV = validateBankAccount(form.bankAccount, 'Conta ou IBAN');

    if (!nameV.ok) return Alert.alert('Validação', nameV.message);
    if (!phoneV.ok) return Alert.alert('Validação', phoneV.message);
    if (!emailV.ok) return Alert.alert('Validação', emailV.message);
    if (!passV.ok) return Alert.alert('Validação', passV.message);
    if (form.password !== form.confirm) return Alert.alert('Validação', 'Palavras-passe não coincidem');
    if (!bankV.ok) return Alert.alert('Validação', bankV.message);

    setLoading(true);
    try {
      await registerClient({
        name: nameV.name,
        phone: phoneV.phone,
        email: emailV.email,
        password: form.password,
        bankAccount: bankV.value,
        address: form.address.trim(),
      });
    } catch (err) {
      Alert.alert('Erro', getApiErrorMessage(err, 'Erro no registo'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Input label="Nome completo" value={form.name} onChangeText={(t) => set('name', t)} placeholder="Seu nome completo" />
      <Input
        label="Telefone"
        value={form.phone}
        onChangeText={(t) => set('phone', sanitizeAngolanPhoneInput(t))}
        keyboardType="number-pad"
        maxLength={9}
        placeholder="923456789"
        hint="9 dígitos, começa com 9"
      />
      <Input
        label="Email"
        value={form.email}
        onChangeText={(t) => set('email', t.toLowerCase())}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="seuemail@gmail.com"
      />
      <Input label="Palavra-passe" value={form.password} onChangeText={(t) => set('password', t)} secureTextEntry />
      <Input label="Confirmar" value={form.confirm} onChangeText={(t) => set('confirm', t)} secureTextEntry />
      <Input
        label="Conta bancária ou IBAN"
        value={form.bankAccount}
        onChangeText={(t) => set('bankAccount', t)}
        placeholder="Digite sua conta bancária"
      />
      <Input label="Morada (opcional)" value={form.address} onChangeText={(t) => set('address', t)} />
      <Button title="Criar conta de Cliente" onPress={submit} loading={loading} />
    </Screen>
  );
}
