import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { mockCallbackApi } from '../api/mockCallbackApi';
import { isAxiosError } from 'axios';

export const MockG3Page: React.FC = () => {
  const { transactionRef } = useParams<{ transactionRef: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async (status: 'SUCCESS' | 'FAILED') => {
    if (!transactionRef) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await mockCallbackApi.submitCallback({
        externalEventId: crypto.randomUUID(),
        transactionRef,
        status,
      });
      window.location.href = `/payment/${response.orderId}`;
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (isAxiosError(err) && typeof err.response?.data === 'string') {
        setError(err.response.data);
      } else {
        setError('Failed to process callback. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  if (!transactionRef || transactionRef.trim() === '') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Development Error</h1>
          <p className="text-gray-700">Invalid transaction reference.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-300 rounded-lg shadow-xl p-8 max-w-lg w-full">
        <div className="mb-8 text-center border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Mock G3 Payment Simulator</h1>
          <span className="inline-block mt-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold uppercase tracking-wide">
            Development Only
          </span>
        </div>

        <div className="mb-8">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Transaction Reference</p>
          <div className="bg-gray-50 p-4 rounded border border-gray-200 font-mono text-sm text-gray-800 break-all">
            {transactionRef}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-[#FEF3F2] p-4 border border-[#FEE4E2]">
            <p className="text-sm font-medium text-[#B42318]">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => handleSimulate('SUCCESS')}
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Processing...' : 'Simulate Success'}
          </button>
          
          <button
            type="button"
            onClick={() => handleSimulate('FAILED')}
            disabled={isSubmitting}
            className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Processing...' : 'Simulate Failure'}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 italic">
            Payment result simulation will be enabled in the next integration phase.
          </p>
        </div>
      </div>
    </div>
  );
};
