import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import api, { getApiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { sanitizeAngolanPhoneInput } from '../utils/validation';
import { formatKz } from '../utils/format';
import { colors } from '../theme/colors';

export default function ProfileScreen() {
  const { user, updateUser, logout, isDriver } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', form);
      await updateUser(data.user);
      Alert.alert('Sucesso', 'Perfil actualizado');
    } catch (err) {
      Alert.alert('Erro', getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Terminar sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  const typeLabel = isDriver ? 'Motorista' : 'Cliente';

  return (
    <Screen>
      <Card>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.badge}>{typeLabel}</Text>
        <Text style={styles.balance}>{formatKz(user?.balance)}</Text>
      </Card>

      <Input label="Nome" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
      <Input
        label="Telefone"
        value={form.phone}
        onChangeText={(t) => setForm({ ...form, phone: sanitizeAngolanPhoneInput(t) })}
        keyboardType="number-pad"
        maxLength={9}
      />
      <Input label="Email" value={user?.email || ''} editable={false} />

      {isDriver && user?.vehiclePlate ? (
        <Card>
          <Text style={styles.meta}>Matrícula: {user.vehiclePlate}</Text>
          <Text style={styles.meta}>Carta: {user.driverLicense}</Text>
        </Card>
      ) : null}

      <Button title="Guardar alterações" onPress={save} loading={loading} />
      <Button title="Sair da conta" variant="secondary" onPress={handleLogout} style={{ marginTop: 16 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.white, fontSize: 22, fontWeight: '800' },
  email: { color: colors.muted, marginTop: 4 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    color: colors.yellow,
    backgroundColor: 'rgba(250,204,21,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '600',
  },
  balance: { color: colors.ocean, fontSize: 20, fontWeight: '700', marginTop: 12 },
  meta: { color: colors.muted, marginBottom: 4 },
});
