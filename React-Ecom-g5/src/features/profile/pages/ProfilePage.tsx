import React, { useEffect, useState } from 'react';
import { profileApi } from '../api/profileApi';
import { ProfileDetails } from '../components/ProfileDetails';
import { AddressCard } from '../components/AddressCard';
import { AddressFormModal } from '../components/AddressFormModal';
import type { CustomerAddressResponse } from '../../checkout/types';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { initializeAuth } from '../../auth/store/authSlice';

import { Navigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, customer, isInitializing } = useAppSelector((state) => state.auth);

  const [addresses, setAddresses] = useState<CustomerAddressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddressResponse | null>(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileApi.getCustomerAddresses();
      // Sort default address first
      data.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
      setAddresses(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && customer) {
      fetchAddresses();
    }
  }, [isAuthenticated, customer]);

  const handleProfileUpdate = () => {
    dispatch(initializeAuth()); // Refresh auth state to sync header
  };

  const handleAddressSubmit = async (data: any) => {
    if (editingAddress) {
      await profileApi.updateAddress(editingAddress.addressId, data);
    } else {
      await profileApi.createAddress(data);
    }
    await fetchAddresses();
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await profileApi.deleteAddress(id);
      await fetchAddresses();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to delete address.");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await profileApi.setDefaultAddress(id);
      await fetchAddresses();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to set default address.");
    }
  };

  if (isInitializing) {
    return (
      <div className="flex h-64 items-center justify-center bg-page">
        <div className="text-center text-text-muted">
          <div className="mb-4 mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border-subtle border-t-primary"></div>
          <p>Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !customer) {
    return <Navigate to="/login?redirect=/profile" replace />;
  }

  const hasMaxAddresses = addresses.length >= 5;

  return (
    <div className="bg-page min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-text-main sm:text-4xl">My Profile</h1>

        <ProfileDetails
          initialFullName={customer.fullName || ''}
          initialPhone={customer.phone || ''}
          email={customer.email}
          onUpdate={handleProfileUpdate}
        />

        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-main">Saved Addresses</h2>
              <p className="text-sm text-text-muted mt-1">Manage up to 5 delivery addresses.</p>
            </div>
            
            {hasMaxAddresses ? (
              <div className="text-sm font-medium text-accent bg-accent/10 px-3 py-1.5 rounded-md">
                You can save up to 5 addresses.
              </div>
            ) : (
              <button
                onClick={() => { setEditingAddress(null); setIsModalOpen(true); }}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition-colors"
              >
                + Add New Address
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-text-muted">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-border-subtle border-t-primary"></div>
              Loading addresses...
            </div>
          ) : error ? (
            <div className="rounded-md bg-[#B42318]/10 p-4 text-[#B42318]">
              <p>{error}</p>
              <button onClick={fetchAddresses} className="mt-2 font-medium underline">Try again</button>
            </div>
          ) : addresses.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-border-subtle rounded-lg">
              <p className="text-text-muted mb-4">You haven't saved any addresses yet.</p>
              <button
                onClick={() => { setEditingAddress(null); setIsModalOpen(true); }}
                className="text-primary font-medium hover:underline"
              >
                Add your first address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((addr) => (
                <AddressCard
                  key={addr.addressId}
                  address={addr}
                  onEdit={(a) => { setEditingAddress(a); setIsModalOpen(true); }}
                  onDelete={handleDeleteAddress}
                  onSetDefault={handleSetDefault}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddressFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddressSubmit}
        initialData={editingAddress}
        title={editingAddress ? "Edit Address" : "Add New Address"}
      />
    </div>
  );
};
