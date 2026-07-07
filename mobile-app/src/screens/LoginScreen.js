import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/api';
import { validateEmail } from '../utils/validation';
import { colors } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const emailV = validateEmail(email);
    if (!emailV.ok) {
      setEmailError(emailV.message);
      return;
    }
    setEmailError('');
    setLoading(true);
    try {
      await login(emailV.email, password);
    } catch (err) {
      Alert.alert('Erro', getApiErrorMessage(err, 'Erro ao entrar'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.logo}>
        <Text style={styles.sun}>Sun</Text>Trip
      </Text>
      <Text style={styles.sub}>Pagamentos de transporte em Angola</Text>

      <Input
        label="Email"
        value={email}
        onChangeText={(t) => setEmail(t.toLowerCase().replace(/\s/g, ''))}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="seuemail@gmail.com"
        error={emailError}
        hint="gmail, outlook, yahoo ou hotmail"
      />
      <Input
        label="Palavra-passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
      />

      <Button title="Entrar" onPress={handleLogin} loading={loading} />

      <TouchableOpacity onPress={() => navigation.navigate('RegisterChoose')} style={styles.link}>
        <Text style={styles.linkText}>
          Não tem conta? <Text style={styles.linkBold}>Criar conta</Text>
        </Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { fontSize: 36, fontWeight: '800', color: colors.white, marginBottom: 8 },
  sun: { color: colors.yellow },
  sub: { color: colors.muted, marginBottom: 28, fontSize: 15 },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { color: colors.muted },
  linkBold: { color: colors.yellow, fontWeight: '700' },
});
