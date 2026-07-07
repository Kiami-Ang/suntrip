import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

export default function Loading() {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={colors.yellow} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
});
