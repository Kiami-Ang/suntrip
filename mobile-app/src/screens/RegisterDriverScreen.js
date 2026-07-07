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
  validatePlate,
} from '../utils/validation';

export default function RegisterDriverScreen() {
  const { registerDriver } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirm: '',
    bankAccount: '',
    driverLicense: '',
    vehiclePlate: '',
    idDocument: '',
    professionalNotes: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    const nameV = validateName(form.name);
    const phoneV = validatePhone(form.phone);
    const emailV = validateEmail(form.email);
    const passV = validatePassword(form.password);
    const bankV = validateBankAccount(form.bankAccount);
    const plateV = validatePlate(form.vehiclePlate);

    if (!nameV.ok) return Alert.alert('Validação', nameV.message);
    if (!phoneV.ok) return Alert.alert('Validação', phoneV.message);
    if (!emailV.ok) return Alert.alert('Validação', emailV.message);
    if (!passV.ok) return Alert.alert('Validação', passV.message);
    if (form.password !== form.confirm) return Alert.alert('Validação', 'Palavras-passe não coincidem');
    if (!bankV.ok) return Alert.alert('Validação', bankV.message);
    if (!form.driverLicense.trim()) return Alert.alert('Validação', 'Carta de condução obrigatória');
    if (!plateV.ok) return Alert.alert('Validação', plateV.message);
    if (!form.idDocument.trim()) return Alert.alert('Validação', 'Documento obrigatório');

    setLoading(true);
    try {
      await registerDriver({
        name: nameV.name,
        phone: phoneV.phone,
        email: emailV.email,
        password: form.password,
        bankAccount: bankV.value,
        driverLicense: form.driverLicense.trim(),
        vehiclePlate: plateV.plate,
        idDocument: form.idDocument.trim(),
        professionalNotes: form.professionalNotes.trim(),
      });
    } catch (err) {
      Alert.alert('Erro', getApiErrorMessage(err, 'Erro no registo'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Input label="Nome completo" value={form.name} onChangeText={(t) => set('name', t)} />
      <Input
        label="Telefone"
        value={form.phone}
        onChangeText={(t) => set('phone', sanitizeAngolanPhoneInput(t))}
        keyboardType="number-pad"
        maxLength={9}
        placeholder="923456789"
      />
      <Input
        label="Email"
        value={form.email}
        onChangeText={(t) => set('email', t.toLowerCase())}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input label="Palavra-passe" value={form.password} onChangeText={(t) => set('password', t)} secureTextEntry />
      <Input label="Confirmar" value={form.confirm} onChangeText={(t) => set('confirm', t)} secureTextEntry />
      <Input
        label="Carta de condução"
        value={form.driverLicense}
        onChangeText={(t) => set('driverLicense', t)}
        placeholder="Número da carta"
      />
      <Input
        label="Matrícula"
        value={form.vehiclePlate}
        onChangeText={(t) => set('vehiclePlate', t.toUpperCase())}
        placeholder="LD-45-23-AB"
      />
      <Input
        label="Documento"
        value={form.idDocument}
        onChangeText={(t) => set('idDocument', t)}
        placeholder="BI ou Passaporte"
      />
      <Input
        label="Conta bancária"
        value={form.bankAccount}
        onChangeText={(t) => set('bankAccount', t)}
      />
      <Input
        label="Notas (opcional)"
        value={form.professionalNotes}
        onChangeText={(t) => set('professionalNotes', t)}
      />
      <Button title="Criar conta de Motorista" onPress={submit} loading={loading} />
    </Screen>
  );
}
