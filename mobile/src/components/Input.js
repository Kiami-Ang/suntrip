import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable } from 'react-native';
import colors, { radius, spacing, font } from '../theme/colors';

export default function Input({
  label,
  error,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  maxLength,
  hint,
  rightText,
  onRightPress,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          focused && styles.focused,
          error && styles.errorField,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedDark}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {rightText ? (
          <Pressable onPress={onRightPress} hitSlop={10}>
            <Text style={styles.rightText}>{rightText}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: {
    color: colors.muted,
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
    marginBottom: spacing.sm,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  focused: { borderColor: colors.ocean },
  errorField: { borderColor: colors.danger },
  input: {
    flex: 1,
    height: 52,
    color: colors.white,
    fontSize: font.size.md,
  },
  rightText: { color: colors.ocean, fontWeight: font.weight.semibold, fontSize: font.size.sm },
  error: { color: colors.danger, fontSize: font.size.xs, marginTop: spacing.xs },
  hint: { color: colors.mutedDark, fontSize: font.size.xs, marginTop: spacing.xs },
});
