import React from 'react';
import type { ShipmentTracking } from '../types';

interface ShipmentInformationProps {
  shipments: ShipmentTracking[];
}

export const ShipmentInformation: React.FC<ShipmentInformationProps> = ({ shipments }) => {
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getShipmentStatusBadge = (status: string) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';

    switch (status) {
      case 'PENDING':
        bgColor = 'bg-[#B7791F]/10';
        textColor = 'text-[#B7791F]';
        break;
      case 'SHIPPED':
        bgColor = 'bg-primary/10';
        textColor = 'text-primary';
        break;
      case 'DELIVERED':
        bgColor = 'bg-[#2E7D32]/10';
        textColor = 'text-[#2E7D32]';
        break;
      case 'FAILED':
        bgColor = 'bg-[#B42318]/10';
        textColor = 'text-[#B42318]';
        break;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${bgColor} ${textColor}`}>
        {status}
      </span>
    );
  };

  if (!shipments || shipments.length === 0) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface shadow-sm overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-border-subtle">
          <h3 className="text-lg font-bold text-text-main">Shipment Information</h3>
        </div>
        <div className="px-4 py-8 sm:p-10 text-center">
          <svg className="mx-auto h-12 w-12 text-text-muted opacity-50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <p className="text-text-muted italic text-base">Shipment information is not available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-6">
      {shipments.map((shipment, index) => (
        <div key={index} className="rounded-lg border border-border-subtle bg-surface shadow-sm overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-border-subtle flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <h3 className="text-lg font-bold text-text-main">
              {shipments.length > 1 ? `Shipment ${index + 1}` : 'Shipment Information'}
            </h3>
            <div className="mt-2 sm:mt-0">
              {getShipmentStatusBadge(shipment.shipmentStatus)}
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6 text-sm text-text-main">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {shipment.courierName && (
                <div className="flex flex-col">
                  <span className="text-text-muted mb-1">Courier</span>
                  <span className="font-bold text-base">{shipment.courierName}</span>
                </div>
              )}
              
              {shipment.trackingNumber && (
                <div className="flex flex-col">
                  <span className="text-text-muted mb-1">Tracking Number</span>
                  <span className="font-mono text-base break-all">{shipment.trackingNumber}</span>
                </div>
              )}

              {shipment.shippedAt && (
                <div className="flex flex-col">
                  <span className="text-text-muted mb-1">Shipped At</span>
                  <span className="font-medium">{formatDateTime(shipment.shippedAt)}</span>
                </div>
              )}

              {shipment.deliveredAt && (
                <div className="flex flex-col">
                  <span className="text-text-muted mb-1">Delivered At</span>
                  <span className="font-medium">{formatDateTime(shipment.deliveredAt)}</span>
                </div>
              )}
              
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
