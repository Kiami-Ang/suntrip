import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import api, { getApiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function TransferScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const search = async (q) => {
    setQuery(q);
    if (q.length < 2) {
      setUsers([]);
      return;
    }
    try {
      const { data } = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    }
  };

  const transfer = async () => {
    if (!selected) return Alert.alert('Validação', 'Seleccione um destinatário');
    const value = Number(amount);
    if (!value || value < 50) return Alert.alert('Validação', 'Mínimo 50 Kz');
    setLoading(true);
    try {
      const { data } = await api.post('/wallet/transfer', {
        recipientId: selected.id,
        amount: value,
        description: description || undefined,
      });
      await updateUser({ ...user, balance: data.balance });
      Alert.alert('Sucesso', 'Transferência concluída', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Erro', getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll={false}>
      <View style={styles.flex}>
        <Input label="Procurar utilizador" value={query} onChangeText={search} placeholder="Nome ou email" />
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          style={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.userRow, selected?.id === item.id && styles.userSelected]}
              onPress={() => setSelected(item)}
            >
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Procure por nome ou email</Text>}
        />
        <Input label="Valor (Kz)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <Input label="Descrição (opcional)" value={description} onChangeText={setDescription} />
        <Button title="Transferir" onPress={transfer} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, padding: 16 },
  list: { maxHeight: 180, marginBottom: 12 },
  userRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userSelected: { backgroundColor: colors.surface },
  userName: { color: colors.white, fontWeight: '600' },
  userEmail: { color: colors.muted, fontSize: 12 },
  empty: { color: colors.muted, padding: 16, textAlign: 'center' },
});
