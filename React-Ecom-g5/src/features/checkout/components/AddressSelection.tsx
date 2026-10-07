import React from 'react';
import type { CustomerAddressResponse } from '../types';

interface AddressSelectionProps {
  addresses: CustomerAddressResponse[];
  selectedAddressId: number | null;
  onSelect: (addressId: number) => void;
}

export const AddressSelection: React.FC<AddressSelectionProps> = ({
  addresses,
  selectedAddressId,
  onSelect,
}) => {
  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <label
          key={address.addressId}
          className={`block cursor-pointer rounded-md border p-4 ${
            selectedAddressId === address.addressId
              ? 'border-primary bg-primary/5'
              : 'border-border-subtle hover:border-primary/50'
          }`}
        >
          <div className="flex items-center">
            <input
              type="radio"
              name="saved_shipping_address"
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              checked={selectedAddressId === address.addressId}
              onChange={() => onSelect(address.addressId)}
            />
            <div className="ml-3 flex flex-col">
              <span className="block text-sm font-medium text-text-main">
                {address.label && <span className="font-bold mr-2">[{address.label}]</span>}
                {address.recipientName}
              </span>
              <span className="block text-sm text-text-secondary mt-1">
                {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}, {address.township}, {address.city}
              </span>
              <span className="block text-sm text-text-secondary mt-1">
                Phone: {address.phoneNumber}
              </span>
            </div>
          </div>
        </label>
      ))}
    </div>
  );
};
