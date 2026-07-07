import React, { useCallback, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import EmptyState from '../components/EmptyState';
import { useNotifications } from '../context/NotificationsContext';
import { formatDateTime } from '../utils/format';
import colors, { radius, spacing, font } from '../theme/colors';

const ICONS = {
  money_received: { name: 'arrow-down-circle', color: colors.success },
  payment_received: { name: 'qr-code', color: colors.success },
  recharge: { name: 'add-circle', color: colors.ocean },
  security: { name: 'shield-checkmark', color: colors.warning },
  info: { name: 'notifications', color: colors.ocean },
};

function NotificationRow({ item, onPress }) {
  const meta = ICONS[item.type] || ICONS.info;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, !item.read && styles.rowUnread, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.icon, { backgroundColor: `${meta.color}22` }]}>
        <Ionicons name={meta.name} size={20} color={meta.color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        {item.body ? <Text style={styles.text} numberOfLines={2}>{item.body}</Text> : null}
        <Text style={styles.time}>{formatDateTime(item.createdAt)}</Text>
      </View>
      {!item.read ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

export default function NotificationsScreen({ navigation }) {
  const { notifications, unread, loading, refresh, markAllRead, markRead } = useNotifications();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        unread > 0 ? (
          <Pressable onPress={markAllRead} hitSlop={10}>
            <Text style={styles.headerAction}>Ler todas</Text>
          </Pressable>
        ) : null,
    });
  }, [navigation, unread, markAllRead]);

  const onPressItem = useCallback(
    (item) => {
      if (!item.read) markRead(item.id);
    },
    [markRead]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar style="light" />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={notifications.length ? styles.list : styles.emptyList}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.ocean} />}
        renderItem={({ item }) => <NotificationRow item={item} onPress={() => onPressItem(item)} />}
        ListEmptyComponent={
          <EmptyState icon="🔔" title="Sem notificações" subtitle="Vais ver aqui pagamentos e alertas da tua conta." />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  list: { padding: spacing.lg, gap: spacing.sm },
  emptyList: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  headerAction: { color: colors.ocean, fontSize: font.size.sm, fontWeight: font.weight.semibold },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowUnread: { backgroundColor: colors.cardElevated, borderColor: colors.ocean },
  icon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  body: { flex: 1 },
  title: { color: colors.white, fontSize: font.size.md, fontWeight: font.weight.semibold },
  text: { color: colors.muted, fontSize: font.size.sm, marginTop: 2 },
  time: { color: colors.mutedDark, fontSize: font.size.xs, marginTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.ocean, marginLeft: spacing.sm },
});
