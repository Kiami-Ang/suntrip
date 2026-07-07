import { StyleSheet, Text, View } from 'react-native';
import { formatKz } from '../utils/format';
import { colors } from '../theme/colors';

export default function BalanceCard({ label, amount, subtitle }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.amount}>{formatKz(amount)}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.4)',
    padding: 20,
    marginBottom: 16,
  },
  label: { color: colors.muted, fontSize: 14 },
  amount: { color: colors.yellow, fontSize: 32, fontWeight: '800', marginTop: 6 },
  sub: { color: colors.success, fontSize: 13, marginTop: 8 },
});
