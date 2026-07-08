import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import api, { errorMessage } from '../services/api';
import { validatePin } from '../utils/validation';
import colors, { spacing, font } from '../theme/colors';

export default function SetPinScreen({ navigation }) {
  const { user, refreshUser } = useAuth();
  const feedback = useFeedback();
  const hasPin = !!user?.hasPin;

  const [currentPin, setCurrentPin] = useState('');
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const v = validatePin(pin);
    if (!v.ok) return setError(v.message);
    if (pin !== confirm) return setError('Os PINs não coincidem');
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/pin', { pin, currentPin: hasPin ? currentPin : undefined });
      await refreshUser();
      feedback.showSuccess('O teu PIN de pagamento foi guardado.', { title: 'PIN definido' });
      navigation.goBack();
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível guardar o PIN'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.info}>
        O PIN de 4 a 6 dígitos protege os teus pagamentos e transferências.
      </Text>

      {hasPin ? (
        <Input label="PIN actual" placeholder="••••" value={currentPin} onChangeText={(t) => setCurrentPin(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" secureTextEntry maxLength={6} />
      ) : null}

      <Input label="Novo PIN" placeholder="••••" value={pin} onChangeText={(t) => setPin(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" secureTextEntry maxLength={6} />
      <Input label="Confirmar novo PIN" placeholder="••••" value={confirm} onChangeText={(t) => setConfirm(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" secureTextEntry maxLength={6} error={error} />

      <Button title={hasPin ? 'Alterar PIN' : 'Definir PIN'} onPress={onSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  info: { color: colors.muted, fontSize: font.size.sm, marginBottom: spacing.xl },
});
