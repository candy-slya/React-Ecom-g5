import React, { useState } from 'react';
import type { RefundReason } from '../types';
import { refundApi } from '../api/refundApi';

interface RequestRefundModalProps {
  orderItemId: number;
  productName: string;
  orderedQuantity: number;
  remainingRefundableQuantity: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REASON_LABELS: Record<RefundReason, string> = {
  DAMAGED_ITEM: 'Damaged Item',
  DEFECTIVE_PRODUCT: 'Defective Product',
  MISSING_PARTS: 'Missing Parts',
  ORDERED_BY_MISTAKE: 'Ordered by Mistake',
  WRONG_ITEM_SENT: 'Wrong Item Sent',
  OTHER: 'Other',
};

export const RequestRefundModal: React.FC<RequestRefundModalProps> = ({
  orderItemId,
  productName,
  orderedQuantity,
  remainingRefundableQuantity,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<RefundReason>('DAMAGED_ITEM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity < 1 || quantity > remainingRefundableQuantity) {
      setError('Invalid quantity.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await refundApi.createRefundRequest({
        orderItemId,
        refundQuantity: quantity,
        requestReason: reason,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit refund request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B2B2B]/50">
      <div className="bg-surface rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-page">
          <h3 className="text-lg font-bold text-text-main">Request Refund</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#B42318]/10 text-[#B42318] rounded-md text-sm border border-[#B42318]/20">
              {error}
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-text-muted mb-1">Product</p>
            <p className="text-text-main font-medium">{productName}</p>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-text-muted mb-1">Ordered</p>
              <p className="text-text-main">{orderedQuantity}</p>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-muted mb-1">Refundable</p>
              <p className="text-text-main">{remainingRefundableQuantity}</p>
            </div>
          </div>

          <div>
            <label htmlFor="refundQty" className="block text-sm font-medium text-text-main mb-1">
              Refund Quantity
            </label>
            <input
              id="refundQty"
              type="number"
              min="1"
              max={remainingRefundableQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="refundReason" className="block text-sm font-medium text-text-main mb-1">
              Reason
            </label>
            <select
              id="refundReason"
              value={reason}
              onChange={(e) => setReason(e.target.value as RefundReason)}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              {(Object.keys(REASON_LABELS) as RefundReason[]).map((r) => (
                <option key={r} value={r}>
                  {REASON_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-[#F70D1A] text-[#000000] font-bold rounded-md hover:bg-[#D60B16] transition-colors disabled:opacity-50 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#FFFF00] text-[#000000] font-bold rounded-md hover:bg-[#F0EE00] transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
