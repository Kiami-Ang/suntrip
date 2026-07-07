import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import colors, { radius, spacing, font } from '../../theme/colors';

function Option({ icon, title, subtitle, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.option, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={28} color={colors.ocean} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.optTitle}>{title}</Text>
        <Text style={styles.optSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.muted} />
    </Pressable>
  );
}

export default function RegisterChooseScreen({ navigation }) {
  return (
    <Screen scroll>
      <Text style={styles.title}>Que tipo de conta queres criar?</Text>
      <Text style={styles.subtitle}>Escolhe o perfil que melhor te descreve.</Text>

      <Option
        icon="person"
        title="Cliente"
        subtitle="Paga corridas e transfere dinheiro"
        onPress={() => navigation.navigate('RegisterClient')}
      />
      <Option
        icon="car"
        title="Motorista / Taxista"
        subtitle="Recebe pagamentos das corridas"
        onPress={() => navigation.navigate('RegisterDriver')}
      />
      <Option
        icon="storefront"
        title="Negócio / Loja"
        subtitle="Recebe pagamentos comerciais na carteira"
        onPress={() => navigation.navigate('RegisterBusiness')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: font.size.xl, fontWeight: font.weight.bold, marginTop: spacing.md },
  subtitle: { color: colors.muted, marginTop: spacing.sm, marginBottom: spacing.xl },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  optTitle: { color: colors.white, fontSize: font.size.lg, fontWeight: font.weight.semibold },
  optSub: { color: colors.muted, fontSize: font.size.sm, marginTop: 2 },
});
