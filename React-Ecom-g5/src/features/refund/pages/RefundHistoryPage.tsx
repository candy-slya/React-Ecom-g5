import React, { useEffect, useState } from 'react';
import { refundApi } from '../api/refundApi';
import type { RefundResponseDto, RefundReason, RefundStatus } from '../types';
import { formatPrice, formatDateTime } from '../../../utils/formatters';

const REASON_LABELS: Record<RefundReason, string> = {
  DAMAGED_ITEM: 'Damaged Item',
  DEFECTIVE_PRODUCT: 'Defective Product',
  MISSING_PARTS: 'Missing Parts',
  ORDERED_BY_MISTAKE: 'Ordered by Mistake',
  WRONG_ITEM_SENT: 'Wrong Item Sent',
  OTHER: 'Other',
};

export const RefundHistoryPage: React.FC = () => {
  const [refunds, setRefunds] = useState<RefundResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        const data = await refundApi.getMyRefunds();
        setRefunds(data);
      } catch (err: any) {
        setError('Failed to load refund history.');
      } finally {
        setLoading(false);
      }
    };
    fetchRefunds();
  }, []);

  const getStatusBadge = (status: RefundStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#B7791F]/10 text-[#B7791F]">Awaiting review</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2E7D32]/10 text-[#2E7D32]">Approved</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#B42318]/10 text-[#B42318]">Rejected</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-[#B42318]">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-[#F8F6F1] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight text-text-main mb-8">
          My Refunds
        </h1>
        
        {refunds.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-lg border border-border-subtle shadow-sm">
            <svg className="mx-auto h-12 w-12 text-border-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-text-main">No refund requests</h3>
            <p className="mt-2 text-text-muted">You haven't requested any refunds yet.</p>
          </div>
        ) : (
          <div className="bg-surface shadow-sm rounded-lg border border-border-subtle overflow-hidden">
            <ul className="divide-y divide-[#E6E2D8]">
              {refunds.map((refund) => (
                <li key={refund.refundId} className="p-6 hover:bg-[#F8F6F1]/50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-text-main">{refund.productName}</h4>
                        {getStatusBadge(refund.status)}
                      </div>
                      
                      {refund.variantAttributes && refund.variantAttributes !== '{}' && (
                        <p className="text-sm text-text-muted mb-3">
                          {Object.entries(JSON.parse(refund.variantAttributes)).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
                        <div>
                          <p className="text-text-muted mb-1">Requested Date</p>
                          <p className="font-medium text-text-main">{formatDateTime(refund.requestedAt)}</p>
                        </div>
                        <div>
                          <p className="text-text-muted mb-1">Reason</p>
                          <p className="font-medium text-text-main">{REASON_LABELS[refund.requestReason]}</p>
                        </div>
                        <div>
                          <p className="text-text-muted mb-1">Refund Quantity</p>
                          <p className="font-medium text-text-main">{refund.requestedRefundQuantity} item(s)</p>
                        </div>
                        {refund.refundAmount != null && (
                          <div>
                            <p className="text-text-muted mb-1">Refund Amount</p>
                            <p className="font-medium text-text-main">{formatPrice(refund.refundAmount)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
