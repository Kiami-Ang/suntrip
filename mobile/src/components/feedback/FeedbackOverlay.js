import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors, { spacing, radius, font } from '../../theme/colors';

const BANNER_HEIGHT = 64;
const ENTER_MS = 260;
const EXIT_MS = 220;

function kindStyles(kind) {
  switch (kind) {
    case 'success':
      return {
        bg: colors.successBg,
        border: colors.success,
        title: colors.white,
        message: colors.muted,
        dot: colors.success,
        icon: '✓',
      };
    case 'error':
      return {
        bg: colors.dangerBg,
        border: colors.danger,
        title: colors.white,
        message: colors.muted,
        dot: colors.danger,
        icon: '!',
      };
    case 'moneyIn':
      return {
        bg: colors.successBg,
        border: colors.success,
        title: colors.white,
        message: colors.muted,
        dot: colors.success,
        icon: '+',
      };
    case 'moneyOut':
      return {
        bg: colors.dangerBg,
        border: colors.danger,
        title: colors.white,
        message: colors.muted,
        dot: colors.danger,
        icon: '-',
      };
    case 'warning':
      return {
        bg: colors.warningBg,
        border: colors.warning,
        title: colors.white,
        message: colors.muted,
        dot: colors.warning,
        icon: '!',
      };
    default:
      return {
        bg: colors.cardElevated,
        border: colors.border,
        title: colors.white,
        message: colors.muted,
        dot: colors.ocean,
        icon: '•',
      };
  }
}

export default function FeedbackOverlay({
  banner,
  onBannerHidden,
  confirmState,
  onConfirm,
  onRequestCloseConfirm,
}) {
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(-BANNER_HEIGHT - 24)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const [renderBanner, setRenderBanner] = useState(null);
  const lastIdRef = useRef(null);

  const bannerTheme = useMemo(() => kindStyles(renderBanner?.kind), [renderBanner?.kind]);

  useEffect(() => {
    if (banner?.id && banner.id !== lastIdRef.current) {
      lastIdRef.current = banner.id;
      setRenderBanner(banner);
    }
  }, [banner]);

  useEffect(() => {
    if (!renderBanner) return;

    if (renderBanner.visible) {
      translateY.setValue(-BANNER_HEIGHT - 24);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: ENTER_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: ENTER_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -BANNER_HEIGHT - 24,
        duration: EXIT_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: EXIT_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setRenderBanner(null);
        onBannerHidden?.();
      }
    });
  }, [renderBanner, onBannerHidden, opacity, translateY]);

  const bannerTop = insets.top + spacing.sm;

  return (
    <>
      {!!renderBanner && (
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <Animated.View
            pointerEvents="none"
            style={[styles.bannerWrap, { top: bannerTop, opacity, transform: [{ translateY }] }]}
          >
            <View style={[styles.banner, { backgroundColor: bannerTheme.bg, borderColor: bannerTheme.border }]}>
              <View style={[styles.badge, { backgroundColor: bannerTheme.dot }]}>
                <Text style={styles.badgeText}>{bannerTheme.icon}</Text>
              </View>

              <View style={styles.bannerText}>
                {!!renderBanner.title ? (
                  <Text numberOfLines={1} style={[styles.bannerTitle, { color: bannerTheme.title }]}>
                    {renderBanner.title}
                  </Text>
                ) : null}
                {!!renderBanner.message ? (
                  <Text numberOfLines={2} style={[styles.bannerMessage, { color: bannerTheme.message }]}>
                    {renderBanner.message}
                  </Text>
                ) : null}
              </View>
            </View>
          </Animated.View>
        </View>
      )}

      <Modal
        visible={!!confirmState}
        transparent
        animationType="fade"
        onRequestClose={onRequestCloseConfirm}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={onRequestCloseConfirm} />

          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{confirmState?.title}</Text>

            {!!confirmState?.message ? <Text style={styles.modalMessage}>{confirmState.message}</Text> : null}

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => onConfirm?.(false)}
                style={({ pressed }) => [styles.btn, styles.btnGhost, pressed && styles.btnPressed]}
              >
                <Text style={styles.btnGhostText}>{confirmState?.cancelText || 'Cancelar'}</Text>
              </Pressable>

              <Pressable
                onPress={() => onConfirm?.(true)}
                style={({ pressed }) => [
                  styles.btn,
                  confirmState?.variant === 'danger' ? styles.btnDanger : styles.btnPrimary,
                  pressed && styles.btnPressed,
                ]}
              >
                <Text style={styles.btnPrimaryText}>{confirmState?.confirmText || 'Confirmar'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bannerWrap: { position: 'absolute', left: spacing.lg, right: spacing.lg },
  banner: {
    minHeight: BANNER_HEIGHT,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  badgeText: { color: colors.navy, fontSize: font.size.lg, fontWeight: font.weight.bold },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: font.size.md, fontWeight: font.weight.semibold, marginBottom: 2 },
  bannerMessage: { fontSize: font.size.sm, fontWeight: font.weight.regular },

  modalRoot: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10, 18, 32, 0.65)' },
  modalCard: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  modalTitle: { color: colors.white, fontSize: font.size.lg, fontWeight: font.weight.bold, marginBottom: spacing.sm },
  modalMessage: {
    color: colors.muted,
    fontSize: font.size.md,
    marginBottom: spacing.lg,
    lineHeight: Math.round(font.size.md * 1.35),
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
  btn: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: { opacity: 0.85 },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  btnGhostText: { color: colors.white, fontSize: font.size.md, fontWeight: font.weight.semibold },
  btnPrimary: { backgroundColor: colors.oceanDeep },
  btnDanger: { backgroundColor: colors.danger },
  btnPrimaryText: { color: colors.white, fontSize: font.size.md, fontWeight: font.weight.semibold },
});

