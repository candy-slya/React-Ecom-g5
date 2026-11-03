export interface PendingCartOrder {
  orderId: number;
  orderNo?: string;
  checkoutType: 'CART';
  createdAt: number;
}

const STORAGE_KEY = 'g5_pending_cart_order';
export const PENDING_CART_ORDER_EVENT = 'g5_pending_cart_order_change';

export const pendingCartOrderStorage = {
  get(): PendingCartOrder | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === 'object' &&
        typeof parsed.orderId === 'number' &&
        parsed.checkoutType === 'CART'
      ) {
        return parsed as PendingCartOrder;
      }
      return null;
    } catch {
      return null;
    }
  },

  set(order: { orderId: number; orderNo?: string; checkoutType: 'CART' }): void {
    try {
      const data: PendingCartOrder = {
        orderId: order.orderId,
        orderNo: order.orderNo,
        checkoutType: 'CART',
        createdAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new Event(PENDING_CART_ORDER_EVENT));
    } catch (e) {
      console.error('Failed to save pending cart order marker', e);
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event(PENDING_CART_ORDER_EVENT));
    } catch (e) {
      console.error('Failed to clear pending cart order marker', e);
    }
  },
};
