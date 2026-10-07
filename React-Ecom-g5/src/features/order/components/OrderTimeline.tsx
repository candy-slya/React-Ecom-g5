import React from 'react';
import type { OrderStatusHistory } from '../types';

interface OrderTimelineProps {
  statusHistory: OrderStatusHistory[];
}

const TIMELINE_STEPS = [
  { status: 'PENDING', label: 'Order Placed' },
  { status: 'PAID', label: 'Payment Confirmed' },
  { status: 'PROCESSING', label: 'Processing' },
  { status: 'SHIPPED', label: 'Shipped' },
  { status: 'DELIVERED', label: 'Delivered' },
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ statusHistory }) => {
  const isCancelled = statusHistory.some(history => history.newStatus === 'CANCELLED');
  const cancelledHistory = isCancelled ? statusHistory.find(h => h.newStatus === 'CANCELLED') : null;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="rounded-lg border border-border-subtle bg-surface shadow-sm overflow-hidden mb-6">
      <div className="px-4 py-5 sm:px-6 border-b border-border-subtle">
        <h3 className="text-lg font-bold text-text-main">Order Timeline</h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        {isCancelled ? (
          <div className="flex items-center text-[#B42318] p-4 bg-[#B42318]/10 rounded-md">
            <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <div>
              <p className="font-bold text-lg">Cancelled</p>
              {cancelledHistory && (
                <p className="text-sm mt-1">{formatDateTime(cancelledHistory.changedAt)}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 sm:left-6 top-0 h-full w-0.5 bg-[#E6E2D8] z-0" aria-hidden="true" />
            <ul className="space-y-6 relative z-10">
              {TIMELINE_STEPS.map((step) => {
                const historyRecord = statusHistory.find(h => h.newStatus === step.status);
                const isCompleted = !!historyRecord;

                return (
                  <li key={step.status} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                          isCompleted
                            ? 'bg-primary border-primary text-white'
                            : 'bg-white border-border-subtle text-border-subtle'
                        } sm:w-12 sm:h-12 z-10 relative`}
                      >
                        {isCompleted ? (
                          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#E6E2D8]" />
                        )}
                      </div>
                    </div>
                    <div className={`flex flex-col justify-center min-h-[2rem] sm:min-h-[3rem] ${isCompleted ? 'text-text-main' : 'text-text-muted'}`}>
                      <p className={`text-base font-bold ${isCompleted ? 'text-text-main' : 'text-text-muted opacity-70'}`}>
                        {step.label}
                      </p>
                      {isCompleted && historyRecord && (
                        <p className="text-sm text-text-muted mt-0.5">
                          {formatDateTime(historyRecord.changedAt)}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
