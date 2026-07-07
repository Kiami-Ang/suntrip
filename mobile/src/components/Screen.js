import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import colors, { spacing } from '../theme/colors';

export default function Screen({
  children,
  scroll = false,
  refreshing = false,
  onRefresh,
  contentStyle,
  padded = true,
  edges = ['top', 'bottom'],
}) {
  const Content = scroll ? ScrollView : View;
  const contentProps = scroll
    ? {
        contentContainerStyle: [padded && styles.padded, contentStyle],
        showsVerticalScrollIndicator: false,
        keyboardShouldPersistTaps: 'handled',
        refreshControl: onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ocean} />
        ) : undefined,
      }
    : { style: [styles.flex, padded && styles.padded, contentStyle] };

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Content {...contentProps}>{children}</Content>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  flex: { flex: 1 },
  padded: { padding: spacing.lg },
});
