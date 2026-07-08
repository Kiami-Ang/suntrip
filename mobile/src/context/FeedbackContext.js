import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { connectSocket, getSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import FeedbackOverlay from '../components/feedback/FeedbackOverlay';
import { formatKz } from '../utils/format';

const FeedbackContext = createContext(null);

const DEFAULT_BANNER_MS = 2600;

export function FeedbackProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [banner, setBanner] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  const hideTimerRef = useRef(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const hideBanner = useCallback(() => {
    clearHideTimer();
    setBanner((prev) => (prev ? { ...prev, visible: false } : prev));
  }, [clearHideTimer]);

  const showBanner = useCallback(
    (next) => {
      clearHideTimer();

      const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const durationMs = typeof next?.durationMs === 'number' ? next.durationMs : DEFAULT_BANNER_MS;

      setBanner({
        id,
        visible: true,
        kind: next.kind,
        title: next.title || '',
        message: next.message || '',
        durationMs,
      });

      if (durationMs > 0) {
        hideTimerRef.current = setTimeout(() => {
          hideBanner();
        }, durationMs);
      }

      return id;
    },
    [clearHideTimer, hideBanner]
  );

  const showSuccess = useCallback(
    (message, opts = {}) => {
      showBanner({
        kind: 'success',
        title: opts.title || 'Sucesso',
        message: message || opts.message || '',
        durationMs: opts.durationMs,
      });
    },
    [showBanner]
  );

  const showError = useCallback(
    (message, opts = {}) => {
      showBanner({
        kind: 'error',
        title: opts.title || 'Erro',
        message: message || opts.message || '',
        durationMs: opts.durationMs ?? 3200,
      });
    },
    [showBanner]
  );

  const showMoneyIn = useCallback(
    ({ amount, from, title, message, durationMs } = {}) => {
      const msg =
        message ||
        (amount !== undefined
          ? `Recebeste ${formatKz(amount)}${from ? ` de ${from}` : ''}.`
          : `Recebeste dinheiro${from ? ` de ${from}` : ''}.`);
      showBanner({
        kind: 'moneyIn',
        title: title || 'Entrada',
        message: msg,
        durationMs,
      });
    },
    [showBanner]
  );

  const showMoneyOut = useCallback(
    ({ amount, to, title, message, durationMs } = {}) => {
      const msg =
        message ||
        (amount !== undefined
          ? `Enviaste/Pagaste ${formatKz(amount)}${to ? ` a ${to}` : ''}.`
          : `Pagamento efectuado${to ? ` a ${to}` : ''}.`);
      showBanner({
        kind: 'moneyOut',
        title: title || 'Saída',
        message: msg,
        durationMs,
      });
    },
    [showBanner]
  );

  const confirm = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      setConfirmState({
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        title: opts.title || 'Confirmar',
        message: opts.message || '',
        confirmText: opts.confirmText || 'Confirmar',
        cancelText: opts.cancelText || 'Cancelar',
        variant: opts.danger ? 'danger' : 'default',
        resolve,
      });
    });
  }, []);

  const resolveConfirm = useCallback((value) => {
    setConfirmState((prev) => {
      prev?.resolve?.(value);
      return null;
    });
  }, []);

  // Socket: wallet:received → banner verde (entrada)
  const walletHandlerRef = useRef(null);
  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let mounted = true;

    const onReceived = (data) => {
      // backend manda { amount, from, via }
      const raw = data?.amount;
      const amount = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : undefined;
      const from = data?.from || data?.fromName || '';
      showMoneyIn({ amount: Number.isFinite(amount) ? amount : undefined, from });
    };
    walletHandlerRef.current = onReceived;

    (async () => {
      const socket = await connectSocket();
      if (!socket || !mounted) return;
      socket.on('wallet:received', onReceived);
    })();

    return () => {
      mounted = false;
      const s = getSocket();
      s?.off?.('wallet:received', walletHandlerRef.current);
    };
  }, [isAuthenticated, showMoneyIn]);

  useEffect(() => {
    return () => clearHideTimer();
  }, [clearHideTimer]);

  const value = useMemo(
    () => ({
      showSuccess,
      showError,
      showMoneyIn,
      showMoneyOut,
      confirm,
      hideBanner,
    }),
    [showSuccess, showError, showMoneyIn, showMoneyOut, confirm, hideBanner]
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <FeedbackOverlay
        banner={banner}
        onBannerHidden={() => setBanner(null)}
        confirmState={confirmState}
        onConfirm={(v) => resolveConfirm(!!v)}
        onRequestCloseConfirm={() => resolveConfirm(false)}
      />
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback deve ser usado dentro de FeedbackProvider');
  return ctx;
}

export default FeedbackContext;

