import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

export default function FilterChips({ options, value, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(opt.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  chipActive: {
    borderColor: colors.yellow,
    backgroundColor: 'rgba(250,204,21,0.12)',
  },
  text: { color: colors.muted, fontSize: 13, fontWeight: '500' },
  textActive: { color: colors.yellow },
});
