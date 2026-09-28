import React from 'react';
import type { CustomerAddressResponse } from '../../checkout/types';

interface AddressCardProps {
  address: CustomerAddressResponse;
  onEdit: (address: CustomerAddressResponse) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
}

export const AddressCard: React.FC<AddressCardProps> = ({ address, onEdit, onDelete, onSetDefault }) => {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {address.label && <span className="font-bold text-text-main">[{address.label}]</span>}
            {address.isDefault && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Default
              </span>
            )}
          </div>
        </div>

        <div className="text-sm text-text-main mb-1 font-medium">{address.recipientName}</div>
        <div className="text-sm text-text-muted mb-2">Phone: {address.phoneNumber}</div>
        
        <div className="text-sm text-text-secondary">
          {address.addressLine1}
          {address.addressLine2 && <><br />{address.addressLine2}</>}
          <br />
          {address.township}, {address.city}
          {address.regionOrState && <>, {address.regionOrState}</>}
          {address.postalCode && <><br />{address.postalCode}</>}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border-subtle flex flex-wrap items-center gap-4">
        <button
          onClick={() => onEdit(address)}
          className="text-sm font-medium text-text-main hover:text-primary transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this address?')) {
              onDelete(address.addressId);
            }
          }}
          className="text-sm font-medium text-[#B42318] hover:underline"
        >
          Delete
        </button>
        {!address.isDefault && (
          <button
            onClick={() => onSetDefault(address.addressId)}
            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors ml-auto"
          >
            Set as Default
          </button>
        )}
      </div>
    </div>
  );
};
