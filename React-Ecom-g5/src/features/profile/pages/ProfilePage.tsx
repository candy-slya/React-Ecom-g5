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

const AVATAR_OPTIONS = [
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f98a.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f43c.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f428.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f43b.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f981.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f42f.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f438.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f435.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f427.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f989.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f423.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f419.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f984.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f437.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f430.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f439.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f43a.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f99d.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f9a5.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f9a6.svg"
];

const getFallbackAvatar = (name: string) => {
  const cleanName = name ? name.trim().replace(/\s+/g, '+') : 'User';
  return `https://ui-avatars.com/api/?name=${cleanName}&background=0D8ABC&color=fff&size=200&font-size=0.4&bold=true`;
};

const ToastItem = ({ message, type }: { message: string, type: 'success' | 'error' }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(0), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="animate-drop-down relative overflow-hidden rounded-xl shadow-2xl px-6 py-5 min-w-[380px] max-w-lg flex items-center gap-4 bg-surface border border-border-subtle bg-opacity-100">
      {type === 'success' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#10B981] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#EF4444] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      <span className="text-text-main text-base font-semibold">{message}</span>
      <div 
        className={`absolute bottom-0 left-0 h-1.5 transition-all ease-linear ${type === 'success' ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}
        style={{ width: `${progress}%`, transitionDuration: '2.95s' }}
      />
    </div>
  );
};

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, customer, isInitializing } = useAppSelector((state) => state.auth);

  const [addresses, setAddresses] = useState<CustomerAddressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddressResponse | null>(null);

  const [selectedAvatar, setSelectedAvatar] = useState<string>(() => {
    return localStorage.getItem('user_avatar') || AVATAR_OPTIONS[0];
  });
  
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: number, message: string, type: 'success'|'error' }[]>([]);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

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
      showToast("Address updated successfully.", "success");
    } else {
      await profileApi.createAddress(data);
      showToast("New address added successfully.", "success");
    }
    await fetchAddresses();
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await profileApi.deleteAddress(id);
      showToast("Address deleted successfully.", "success");
      await fetchAddresses();
    } catch (err: any) {
      showToast("Failed to delete address.", "error");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await profileApi.setDefaultAddress(id);
      showToast("Default address set successfully.", "success");
      await fetchAddresses();
    } catch (err: any) {
      showToast("Failed to set default address.", "error");
    }
  };

  const handleSaveAvatar = async (avatarUrl: string) => {
    try {
      setSelectedAvatar(avatarUrl);
      localStorage.setItem('user_avatar', avatarUrl);
      setIsAvatarModalOpen(false);
      showToast("Profile picture updated successfully.", "success");
    } catch (err) {
      showToast("Failed to update profile picture.", "error");
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
    <div className="bg-page min-h-screen py-12 relative overflow-hidden">
      
      <style>
        {`
          @keyframes dropDown {
            0% { transform: translateY(-30px) scale(0.95); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }
          .animate-drop-down {
            animation: dropDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}
      </style>

      {/* Global Toast Container */}
      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-4 pointer-events-none items-center w-full px-4">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        <h1 className="text-3xl font-bold tracking-tight text-text-main sm:text-4xl">My Profile</h1>

        <div className="flex flex-col md:flex-row gap-8 items-stretch">
          
          {/* Avatar Section */}
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
                    className="w-full h-full object-contain drop-shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const fallback = getFallbackAvatar(customer.fullName || 'User');
                      if (target.src !== fallback) target.src = fallback;
                    }}
                  />
                </div>
                <button 
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="absolute bottom-1 right-1 bg-[#FFFF00] text-[#000000] p-3 rounded-full shadow-lg hover:bg-[#F0EE00] transition-transform hover:scale-110"
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

          {/* Personal Information Section */}
          <div className="md:w-2/3 flex flex-col">
            <div className="h-full">
              <ProfileDetails
                initialFullName={customer.fullName || ''}
                initialPhone={customer.phone || ''}
                email={customer.email}
                onUpdate={handleProfileUpdate}
                showToast={showToast}
              />
            </div>
          </div>
          
        </div>

        {/* Saved Addresses Section */}
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
                className="inline-flex items-center justify-center rounded-md bg-[#FFFF00] text-[#000000] px-4 py-2 text-sm font-bold shadow-sm hover:bg-[#F0EE00] transition-colors"
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
        showToast={showToast}
      />

      {/* Avatar Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[150] overflow-y-auto" aria-labelledby="avatar-modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity" 
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} 
              aria-hidden="true" 
              onClick={() => setIsAvatarModalOpen(false)}
            ></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
            <div className="animate-drop-down relative z-10 inline-block transform overflow-hidden rounded-lg bg-surface text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
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
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-[#F70D1A] text-[#000000] font-bold px-4 py-2 text-base shadow-sm hover:bg-[#D60B16] focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors"
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