import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Screen from '../components/Screen';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function QrHubScreen() {
  const navigation = useNavigation();
  const { isDriver } = useAuth();

  return (
    <Screen>
      <Text style={styles.title}>Pagamentos QR Code</Text>
      <Text style={styles.sub}>
        {isDriver
          ? 'Gere um QR para o passageiro pagar a corrida.'
          : 'Leia o QR do motorista para pagar instantaneamente.'}
      </Text>

      {isDriver ? (
        <Button title="Gerar QR Code" onPress={() => navigation.navigate('QrGenerate')} />
      ) : (
        <Button title="Ler QR Code" onPress={() => navigation.navigate('QrScan')} />
      )}

      <View style={styles.hint}>
        <Text style={styles.hintText}>O QR expira em 15 minutos após ser gerado.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  sub: { color: colors.muted, marginBottom: 28, lineHeight: 22 },
  hint: { marginTop: 32, padding: 16, backgroundColor: colors.surface, borderRadius: 12 },
  hintText: { color: colors.muted, fontSize: 13 },
});
