import React, { useState, useEffect } from 'react';
import type { CustomerAddressResponse } from '../../checkout/types';

export interface CustomerAddressRequest {
  label: string;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  township: string;
  city: string;
  regionOrState?: string;
  postalCode?: string;
  isDefault: boolean;
}
import { useDeliveryLocations } from '../../../hooks/useDeliveryLocations';

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerAddressRequest) => Promise<void>;
  initialData?: CustomerAddressResponse | null;
  title: string;
}

export const AddressFormModal: React.FC<AddressFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, title }) => {
  const { cities, getTownshipsForCity, getZoneForLocation, loading: zonesLoading, error: zonesError } = useDeliveryLocations();

  const [formData, setFormData] = useState({
    label: '',
    recipientName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    township: '',
    city: '',
    regionOrState: '',
    postalCode: '',
    isDefault: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        label: initialData.label || '',
        recipientName: initialData.recipientName || '',
        phoneNumber: initialData.phoneNumber || '',
        addressLine1: initialData.addressLine1 || '',
        addressLine2: initialData.addressLine2 || '',
        township: initialData.township || '',
        city: initialData.city || '',
        regionOrState: initialData.regionOrState || '',
        postalCode: initialData.postalCode || '',
        isDefault: initialData.isDefault || false
      });
    } else if (isOpen) {
      setFormData({
        label: '', recipientName: '', phoneNumber: '', addressLine1: '', addressLine2: '',
        township: '', city: '', regionOrState: '', postalCode: '', isDefault: false
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    setFormData(prev => ({
      ...prev,
      city,
      township: '',
      regionOrState: ''
    }));
  };

  const handleTownshipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const township = e.target.value;
    const zone = getZoneForLocation(formData.city, township);
    setFormData(prev => ({
      ...prev,
      township,
      regionOrState: zone?.regionOrState || prev.regionOrState
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    if (!getZoneForLocation(formData.city, formData.township)) {
      setError("Please select a currently supported City and Township.");
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableCities = [...cities];
  if (initialData?.city && !cities.some(c => c.trim().toLowerCase() === initialData.city.trim().toLowerCase())) {
    if (!availableCities.includes(initialData.city)) {
      availableCities.unshift(initialData.city);
    }
  }

  const baseTownships = getTownshipsForCity(formData.city);
  const availableTownships = [...baseTownships];
  if (initialData?.township && formData.city.trim().toLowerCase() === (initialData?.city || '').trim().toLowerCase() && !baseTownships.some(t => t.trim().toLowerCase() === initialData.township.trim().toLowerCase())) {
    if (!availableTownships.includes(initialData.township)) {
      availableTownships.unshift(initialData.township);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

        <div className="relative z-10 inline-block transform overflow-hidden rounded-lg bg-surface text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-surface px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-border-subtle">
            <h3 className="text-lg font-bold leading-6 text-text-main" id="modal-title">
              {title}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="bg-surface px-4 pt-5 pb-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {(error || zonesError) && (
                <div className="rounded-md bg-[#B42318]/10 p-3 text-sm text-[#B42318]">
                  {error || zonesError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-text-main">Label (e.g. Home)*</label>
                  <input required type="text" name="label" value={formData.label} onChange={handleChange} className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-text-main">Recipient Name*</label>
                  <input required type="text" name="recipientName" value={formData.recipientName} onChange={handleChange} className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main">Phone Number*</label>
                <input required type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main">Address Line 1*</label>
                <input required type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main">Address Line 2</label>
                <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleChange} className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-text-main">City*</label>
                  <select 
                    required 
                    name="city" 
                    value={formData.city} 
                    onChange={handleCityChange} 
                    disabled={zonesLoading || availableCities.length === 0}
                    className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
                  >
                    <option value="" disabled>Select City</option>
                    {availableCities.map(city => (
                      <option key={city} value={city}>
                        {city} {initialData?.city === city && !cities.some(c => c.trim().toLowerCase() === city.trim().toLowerCase()) ? '(Unavailable)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-text-main">Township*</label>
                  <select 
                    required 
                    name="township" 
                    value={formData.township} 
                    onChange={handleTownshipChange} 
                    disabled={zonesLoading || !formData.city || availableTownships.length === 0}
                    className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
                  >
                    <option value="" disabled>Select Township</option>
                    {availableTownships.map(township => (
                      <option key={township} value={township}>
                        {township} {initialData?.township === township && !baseTownships.some(t => t.trim().toLowerCase() === township.trim().toLowerCase()) ? '(Unavailable)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main">Region/State</label>
                <input type="text" name="regionOrState" value={formData.regionOrState} onChange={handleChange} className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>

              <div className="flex items-center mt-4">
                <input type="checkbox" name="isDefault" id="isDefault" checked={formData.isDefault} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-text-main">Set as default address</label>
              </div>
            </div>
            
            <div className="bg-page px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-border-subtle">
              <button type="submit" disabled={isSubmitting || zonesLoading} className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-hover focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={onClose} disabled={isSubmitting} className="mt-3 inline-flex w-full justify-center rounded-md border border-border-subtle bg-surface px-4 py-2 text-base font-medium text-text-main shadow-sm hover:bg-page focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
