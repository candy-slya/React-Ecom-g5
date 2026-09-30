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

// 🌟 လုံးဝ Server မကျနိုင်သော၊ အပိတ်မခံရသော Cloudflare CDN မှ ချစ်စရာ ကာတွန်းတိရစ္ဆာန် (၂၀) မျိုး 🌟
const AVATAR_OPTIONS = [
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f98a.svg", // Fox
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f43c.svg", // Panda
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f428.svg", // Koala
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f43b.svg", // Bear
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f981.svg", // Lion
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f42f.svg", // Tiger
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f438.svg", // Frog
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f435.svg", // Monkey
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f427.svg", // Penguin
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f989.svg", // Owl
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f423.svg", // Chick
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f419.svg", // Octopus
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f984.svg", // Unicorn
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f437.svg", // Pig
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f430.svg", // Rabbit
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f439.svg", // Hamster
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f43a.svg", // Wolf
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f99d.svg", // Raccoon
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f9a5.svg", // Sloth
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f9a6.svg"  // Otter
];

// ပုံမတက်လာခဲ့ရင် အရန်အနေနဲ့ ပြသမယ့် နာမည်အတိုကောက် Avatar
const getFallbackAvatar = (name: string) => {
  const cleanName = name ? name.trim().replace(/\s+/g, '+') : 'User';
  return `https://ui-avatars.com/api/?name=${cleanName}&background=0D8ABC&color=fff&size=200&font-size=0.4&bold=true`;
};

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, customer, isInitializing } = useAppSelector((state) => state.auth);

  const [addresses, setAddresses] = useState<CustomerAddressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddressResponse | null>(null);

  // Page Refresh လုပ်လည်း မပျောက်အောင် LocalStorage ကို သုံးထားပေးပါတယ်
  const [selectedAvatar, setSelectedAvatar] = useState<string>(() => {
    return localStorage.getItem('user_avatar') || AVATAR_OPTIONS[0];
  });
  
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // ရွေးချယ်ထားသော ပုံရဲ့ Background အရောင်ကို သတ်မှတ်ရန်
  const selectedIndex = AVATAR_OPTIONS.indexOf(selectedAvatar);
  const currentBgColor = selectedIndex >= 0 ? `hsl(${selectedIndex * 18}, 85%, 85%)` : '#E2E8F0';

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileApi.getCustomerAddresses();
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
    dispatch(initializeAuth());
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

  // ရွေးလိုက်တဲ့ပုံကို သိမ်းဆည်းခြင်း
  const handleSaveAvatar = async (avatarUrl: string) => {
    try {
      setSelectedAvatar(avatarUrl);
      localStorage.setItem('user_avatar', avatarUrl);
      setIsAvatarModalOpen(false);
    } catch (err) {
      console.error("Failed to update avatar");
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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        <h1 className="text-3xl font-bold tracking-tight text-text-main sm:text-4xl">My Profile</h1>

        <div className="flex flex-col md:flex-row gap-8 items-stretch">
          
          {/* ဘယ်ဘက် - Profile Picture (Avatar) */}
          <div className="md:w-1/3 flex flex-col">
            <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm w-full h-full flex flex-col items-center justify-center">
              <div className="relative group mb-4">
                <div 
                  className="w-40 h-40 rounded-full ring-4 ring-border-subtle ring-offset-2 overflow-hidden shadow-md transition-colors duration-300 p-4"
                  style={{ backgroundColor: currentBgColor }}
                >
                  <img 
                    src={selectedAvatar} 
                    alt="Profile Avatar" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const fallback = getFallbackAvatar(customer.fullName || 'User');
                      if (target.src !== fallback) target.src = fallback;
                    }}
                  />
                </div>
                <button 
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="absolute bottom-1 right-1 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary-hover transition-transform hover:scale-110"
                  aria-label="Change Avatar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
              <h2 className="text-xl font-bold text-text-main text-center mt-2">{customer.fullName || 'User'}</h2>
              <p className="text-sm text-text-muted text-center mt-1">{customer.email}</p>
            </div>
          </div>

          {/* ညာဘက် - Profile Details */}
          <div className="md:w-2/3 flex flex-col">
            <div className="h-full">
              <ProfileDetails
                initialFullName={customer.fullName || ''}
                initialPhone={customer.phone || ''}
                email={customer.email}
                onUpdate={handleProfileUpdate}
              />
            </div>
          </div>
          
        </div>

        {/* အောက်ပိုင်း - Saved Addresses */}
        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm w-full">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Avatar ရွေးချယ်ရန် Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="avatar-modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsAvatarModalOpen(false)}></div>

            <div className="relative z-10 inline-block transform overflow-hidden rounded-lg bg-surface text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
              <div className="bg-surface px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-border-subtle">
                <h3 className="text-lg font-bold leading-6 text-text-main" id="avatar-modal-title">
                  Choose a Cartoon Animal
                </h3>
              </div>
              
              <div className="p-6 bg-page">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto p-2">
                  {AVATAR_OPTIONS.map((avatarUrl, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSaveAvatar(avatarUrl)}
                      className={`cursor-pointer rounded-full p-2 transition-all duration-300 aspect-square flex items-center justify-center ${
                        selectedAvatar === avatarUrl 
                          ? 'ring-4 ring-primary ring-offset-2 scale-110 shadow-lg' 
                          : 'border border-transparent hover:ring-4 hover:ring-border-subtle hover:scale-105 shadow-sm'
                      }`}
                      style={{ backgroundColor: `hsl(${index * 18}, 85%, 85%)` }}
                    >
                      <img 
                        src={avatarUrl} 
                        alt={`Animal ${index + 1}`} 
                        className="w-3/4 h-3/4 object-contain drop-shadow-md"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const fallback = getFallbackAvatar(customer.fullName || 'User');
                          if (target.src !== fallback) target.src = fallback;
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-border-subtle">
                <button 
                  type="button" 
                  onClick={() => setIsAvatarModalOpen(false)} 
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-border-subtle bg-surface px-4 py-2 text-base font-medium text-text-main shadow-sm hover:bg-page focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};