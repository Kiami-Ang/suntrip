import React from 'react';
import { Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import colors, { radius, spacing, font } from '../theme/colors';

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.navy : colors.white} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
  text: { fontSize: font.size.md, fontWeight: font.weight.bold },

  primary: { backgroundColor: colors.yellow },
  primaryText: { color: colors.navy },

  secondary: { backgroundColor: colors.oceanDeep },
  secondaryText: { color: colors.white },

  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border },
  outlineText: { color: colors.white },

  ghost: { backgroundColor: 'transparent' },
  ghostText: { color: colors.ocean },

  danger: { backgroundColor: colors.dangerBg, borderWidth: 1, borderColor: colors.danger },
  dangerText: { color: colors.danger },
});
