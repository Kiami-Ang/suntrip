import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Screen from '../components/Screen';
import BalanceCard from '../components/BalanceCard';
import Input from '../components/Input';
import Button from '../components/Button';
import api, { getApiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function WalletScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const [balance, setBalance] = useState(user?.balance ?? 0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const refreshBalance = useCallback(async () => {
    try {
      const { data } = await api.get('/wallet/balance');
      setBalance(data.balance);
      await updateUser({ ...user, balance: data.balance });
    } catch {
      /* keep last */
    }
  }, [updateUser, user]);

  useFocusEffect(
    useCallback(() => {
      refreshBalance();
    }, [refreshBalance])
  );

  const deposit = async () => {
    const value = Number(amount);
    if (!value || value < 100) {
      Alert.alert('Validação', 'Depósito mínimo: 100 Kz');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/wallet/deposit', { amount: value });
      setBalance(data.balance);
      await updateUser({ ...user, balance: data.balance });
      setAmount('');
      Alert.alert('Sucesso', 'Saldo adicionado à carteira');
    } catch (err) {
      Alert.alert('Erro', getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <BalanceCard label="Saldo na carteira" amount={balance} subtitle="Adicione saldo para pagar corridas" />

      <Text style={styles.section}>Adicionar saldo</Text>
      <Input
        label="Valor (Kz)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="Mínimo 100"
      />
      <Button title="Depositar" onPress={deposit} loading={loading} />

      <View style={styles.links}>
        <Button
          title="Transferir para utilizador"
          variant="secondary"
          onPress={() => navigation.navigate('Transfer')}
        />
        <Button
          title="Transferência bancária"
          variant="secondary"
          onPress={() => navigation.navigate('BankTransfer')}
          style={{ marginTop: 10 }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { color: colors.white, fontWeight: '700', fontSize: 16, marginBottom: 12, marginTop: 8 },
  links: { marginTop: 24 },
});
