import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { pendingCartOrderStorage, PENDING_CART_ORDER_EVENT } from '../utils/pendingCartOrderStorage';
import type { PendingCartOrder } from '../utils/pendingCartOrderStorage';
import { orderApi } from '../../order/api/orderApi';
import { fetchAuthenticatedCart } from '../store/cartSlice';

export interface UsePendingCartPaymentResult {
  isPending: boolean;
  pendingOrder: PendingCartOrder | null;
  refreshStatus: () => Promise<void>;
}

export const usePendingCartPayment = (): UsePendingCartPaymentResult => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [pendingOrder, setPendingOrder] = useState<PendingCartOrder | null>(() => {
    return pendingCartOrderStorage.get();
  });

  const [isPending, setIsPending] = useState<boolean>(() => {
    return Boolean(pendingOrder);
  });

  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // Sync state whenever storage changes (same tab or cross-tab)
  const syncMarker = useCallback(() => {
    const current = pendingCartOrderStorage.get();
    setPendingOrder(current);
    if (!current) {
      setIsPending(false);
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    } else {
      setIsPending(true);
    }
  }, []);

  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'g5_pending_cart_order' || e.key === null) {
        syncMarker();
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener(PENDING_CART_ORDER_EVENT, syncMarker);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener(PENDING_CART_ORDER_EVENT, syncMarker);
    };
  }, [syncMarker]);

  const checkStatus = useCallback(async () => {
    if (!isAuthenticated) {
      setIsPending(false);
      return;
    }

    const currentMarker = pendingCartOrderStorage.get();
    if (!currentMarker) {
      setIsPending(false);
      return;
    }

    try {
      const order = await orderApi.getOrderById(currentMarker.orderId);

      if (!isMountedRef.current) return;

      const pStatus = (order.paymentStatus || '').toUpperCase();
      const oStatus = (order.orderStatus || '').toUpperCase();

      // Terminal Success
      if (pStatus === 'SUCCESS' || oStatus === 'PAID') {
        pendingCartOrderStorage.clear();
        setIsPending(false);
        setPendingOrder(null);
        dispatch(fetchAuthenticatedCart());
        return;
      }

      // Terminal Failure / Cancel
      if (
        pStatus === 'FAILED' ||
        pStatus === 'CANCELLED' ||
        pStatus === 'REFUNDED' ||
        oStatus === 'CANCELLED'
      ) {
        pendingCartOrderStorage.clear();
        setIsPending(false);
        setPendingOrder(null);
        return;
      }

      // Still unresolved (PENDING / PROCESSING)
      setIsPending(true);
      pollingTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          checkStatus();
        }
      }, 3000);
    } catch (err) {
      // Fail-closed on error: keep locked and retry in 5s
      console.warn('Unable to verify pending payment status, retrying in 5s', err);
      if (!isMountedRef.current) return;
      setIsPending(true);
      pollingTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          checkStatus();
        }
      }, 5000);
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    isMountedRef.current = true;

    if (isAuthenticated && pendingOrder) {
      checkStatus();
    } else {
      setIsPending(false);
    }

    return () => {
      isMountedRef.current = false;
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [isAuthenticated, pendingOrder, checkStatus]);

  return {
    isPending: isAuthenticated && isPending,
    pendingOrder,
    refreshStatus: checkStatus,
  };
};
