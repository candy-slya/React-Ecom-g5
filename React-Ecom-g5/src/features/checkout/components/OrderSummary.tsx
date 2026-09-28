import React from 'react';

interface OrderSummaryProps {
  cartItems: any[]; // Using any[] to allow passing either CartItem interface dynamically depending on what slice exports
  shippingFee: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ cartItems, shippingFee }) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' MMK';
  };

  const calculateItemPrice = (item: any) => {
    return item.effectivePrice || 0;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const sub = item.subtotal || (calculateItemPrice(item) * item.quantity) || 0;
      return acc + sub;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const total = subtotal + shippingFee;

  return (
    <div className="rounded-lg border border-border-subtle bg-surface px-4 py-6 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-text-main mb-6">Order Summary</h2>

      <div className="flow-root">
        <ul role="list" className="-my-4 divide-y divide-border-subtle text-sm mb-6">
          {cartItems.map((item, index) => {
            const price = calculateItemPrice(item);
            const itemSubtotal = item.subtotal || (price * item.quantity);
            return (
              <li key={index} className="flex items-center justify-between py-4">
                <div className="flex flex-col">
                  <span className="font-medium text-text-main">{item.productName || 'Product'}</span>
                  <span className="text-text-muted mt-1">Qty: {item.quantity} x {formatPrice(price)}</span>
                </div>
                <div className="font-medium text-text-main">
                  {formatPrice(itemSubtotal)}
                </div>
              </li>
            );
          })}
        </ul>

        <dl className="space-y-4 border-t border-border-subtle pt-4 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-text-muted">Subtotal</dt>
            <dd className="font-medium text-text-main">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-text-muted">Shipping Fee</dt>
            <dd className="font-medium text-text-main">{formatPrice(shippingFee)}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-border-subtle pt-4">
            <dt className="text-base font-bold text-text-main">Total</dt>
            <dd className="text-xl font-bold text-text-main">{formatPrice(total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
