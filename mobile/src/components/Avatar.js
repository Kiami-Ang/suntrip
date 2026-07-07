import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { initials } from '../utils/format';
import colors, { radius, font } from '../theme/colors';

/**
 * Mostra a foto de perfil (se existir) ou as iniciais do nome.
 */
export default function Avatar({ uri, name, size = 48, style }) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.base, dimension, style]} />;
  }

  return (
    <View style={[styles.base, styles.fallback, dimension, style]}>
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials(name) || '?'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.oceanDeep },
  fallback: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  text: { color: '#fff', fontWeight: font.weight.bold },
});
