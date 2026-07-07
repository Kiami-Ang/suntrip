import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors, { spacing, font } from '../theme/colors';

export default function EmptyState({ icon = '📭', title, subtitle }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl },
  icon: { fontSize: 44, marginBottom: spacing.md },
  title: { color: colors.white, fontSize: font.size.md, fontWeight: font.weight.semibold },
  subtitle: {
    color: colors.muted,
    fontSize: font.size.sm,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
