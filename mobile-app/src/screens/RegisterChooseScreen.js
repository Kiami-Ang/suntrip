import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors } from '../theme/colors';

export default function RegisterChooseScreen({ navigation }) {
  return (
    <Screen>
      <Text style={styles.title}>Escolha o tipo de registo</Text>

      <TouchableOpacity onPress={() => navigation.navigate('RegisterClient')}>
        <Card>
          <Text style={styles.cardTitle}>Sou Cliente</Text>
          <Text style={styles.cardSub}>Pagar corridas e usar a carteira</Text>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('RegisterDriver')}>
        <Card>
          <Text style={styles.cardTitle}>Sou Taxista / Motorista</Text>
          <Text style={styles.cardSub}>Receber pagamentos via QR Code</Text>
        </Card>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.muted, fontSize: 16, marginBottom: 16 },
  cardTitle: { color: colors.white, fontSize: 18, fontWeight: '700' },
  cardSub: { color: colors.muted, marginTop: 6, fontSize: 14 },
});
