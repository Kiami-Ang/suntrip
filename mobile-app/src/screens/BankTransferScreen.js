import { useState } from 'react';
import { Alert } from 'react-native';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import api, { getApiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BankTransferScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    recipientName: '',
    bank: '',
    iban: '',
    reference: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    const value = Number(form.amount);
    if (!form.recipientName || !form.bank || !form.iban || !form.reference) {
      return Alert.alert('Validação', 'Preencha todos os campos');
    }
    if (!value || value < 100) return Alert.alert('Validação', 'Mínimo 100 Kz');

    setLoading(true);
    try {
      const { data } = await api.post('/bank/transfer', { ...form, amount: value });
      await updateUser({ ...user, balance: data.balance });
      Alert.alert('Sucesso', 'Transferência bancária registada', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Erro', getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Input label="Nome do beneficiário" value={form.recipientName} onChangeText={(t) => set('recipientName', t)} />
      <Input label="Banco" value={form.bank} onChangeText={(t) => set('bank', t)} />
      <Input label="IBAN" value={form.iban} onChangeText={(t) => set('iban', t)} />
      <Input label="Referência" value={form.reference} onChangeText={(t) => set('reference', t)} />
      <Input label="Valor (Kz)" value={form.amount} onChangeText={(t) => set('amount', t)} keyboardType="numeric" />
      <Button title="Enviar" onPress={submit} loading={loading} />
    </Screen>
  );
}
