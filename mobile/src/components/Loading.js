import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import colors, { spacing, font } from '../theme/colors';

export default function Loading({ label = 'A carregar...' }) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={colors.ocean} />
      {label ? <Text style={styles.text}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy },
  text: { color: colors.muted, marginTop: spacing.md, fontSize: font.size.sm },
});
