import React, { useEffect, useState, useRef } from 'react';
import { profileApi } from '../api/profileApi';
import { ProfileDetails } from '../components/ProfileDetails';
import { AddressCard } from '../components/AddressCard';
import { AddressFormModal } from '../components/AddressFormModal';
import type { CustomerAddressResponse } from '../../checkout/types';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { initializeAuth, updateProfileImage } from '../../auth/store/authSlice';
import { Navigate } from 'react-router-dom';
import { getAssetUrl } from '../../../utils/assetUtils';

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
  const [toasts, setToasts] = useState<{ id: number, message: string, type: 'success'|'error' }[]>([]);

  // Profile Image Upload / Update / Delete states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState<'upload' | 'update' | 'delete' | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

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

  // Image Selection Handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Please select a valid image file (JPG, PNG, GIF, WEBP).", "error");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must not exceed 5MB.", "error");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const preview = URL.createObjectURL(file);
    setPendingFile(file);
    setPendingPreview(preview);

    // If customer already has an image, this is an update; otherwise upload
    if (customer?.profileImageUrl) {
      setConfirmModalType('update');
    } else {
      setConfirmModalType('upload');
    }
    setIsConfirmModalOpen(true);
  };

  // Open Delete Confirmation
  const handleOpenDeleteConfirm = () => {
    setConfirmModalType('delete');
    setIsConfirmModalOpen(true);
  };

  // Cancel Confirmation Modal
  const handleCancelConfirm = () => {
    if (pendingPreview) {
      URL.revokeObjectURL(pendingPreview);
    }
    setPendingFile(null);
    setPendingPreview(null);
    setConfirmModalType(null);
    setIsConfirmModalOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Execute Confirmation Action (Upload, Update, or Delete)
  const handleExecuteConfirm = async () => {
    if (!confirmModalType) return;
    setIsActionLoading(true);

    try {
      if (confirmModalType === 'upload' && pendingFile) {
        const response = await profileApi.uploadProfileImage(pendingFile);
        dispatch(updateProfileImage(response.profileImageUrl));
        dispatch(initializeAuth());
        showToast("Profile picture uploaded successfully.", "success");
      } else if (confirmModalType === 'update' && pendingFile) {
        const response = await profileApi.updateProfileImage(pendingFile);
        dispatch(updateProfileImage(response.profileImageUrl));
        dispatch(initializeAuth());
        showToast("Profile picture updated successfully.", "success");
      } else if (confirmModalType === 'delete') {
        await profileApi.deleteProfileImage();
        dispatch(updateProfileImage(null));
        dispatch(initializeAuth());
        showToast("Profile picture removed successfully.", "success");
      }
      handleCancelConfirm();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "Failed to process profile image.";
      showToast(errMsg, "error");
    } finally {
      setIsActionLoading(false);
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

  // Determine current active profile image (actual photo or default fallback)
  const displayAvatar = customer.profileImageUrl
    ? getAssetUrl(customer.profileImageUrl)
    : getFallbackAvatar(customer.fullName || 'User');

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
          
          {/* Profile Photo Section */}
          <div className="md:w-1/3 flex flex-col">
            <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm w-full h-full flex flex-col items-center justify-center">
              
              {/* Hidden File Input for Image Selection */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="image/jpeg,image/png,image/gif,image/webp" 
                className="hidden" 
              />

              {/* Clean Profile Picture without floating overlay icons */}
              <div className="relative mb-4">
                <div className="w-40 h-40 rounded-full ring-4 ring-border-subtle ring-offset-2 overflow-hidden shadow-md flex items-center justify-center bg-surface p-1">
                  <img 
                    src={displayAvatar} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover drop-shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const fallback = getFallbackAvatar(customer.fullName || 'User');
                      if (target.src !== fallback) target.src = fallback;
                    }}
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold text-text-main text-center mt-2">{customer.fullName || 'User'}</h2>
              <p className="text-sm text-text-muted text-center mt-1">{customer.email}</p>

              {/* Profile Image Action Controls: Upload / Change and Remove */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold px-3.5 py-2 rounded-md border border-border-subtle bg-surface text-text-main hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {customer.profileImageUrl ? 'Change Photo' : 'Upload Photo'}
                </button>

                {customer.profileImageUrl && (
                  <button 
                    type="button"
                    onClick={handleOpenDeleteConfirm}
                    className="text-xs font-semibold px-3.5 py-2 rounded-md border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                )}
              </div>

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
                className="inline-flex items-center justify-center rounded-md bg-primary text-white px-4 py-2 text-sm font-bold shadow-sm hover:bg-primary-hover transition-colors"
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

      {/* Confirmation Modal for Upload / Update / Delete */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[200] overflow-y-auto" aria-labelledby="confirm-modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-black/50 backdrop-blur-xs" 
              aria-hidden="true" 
              onClick={!isActionLoading ? handleCancelConfirm : undefined}
            ></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
            <div className="animate-drop-down relative z-10 inline-block transform overflow-hidden rounded-xl bg-surface text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle border border-border-subtle">
              
              {/* Modal Header */}
              <div className="bg-surface px-6 pt-6 pb-4 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  {confirmModalType === 'delete' ? (
                    <div className="p-2 rounded-full bg-red-100 text-red-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                  ) : (
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold leading-6 text-text-main" id="confirm-modal-title">
                      {confirmModalType === 'upload' && "Upload Profile Picture"}
                      {confirmModalType === 'update' && "Update Profile Picture"}
                      {confirmModalType === 'delete' && "Delete Profile Picture"}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {confirmModalType === 'upload' && "Upload New Profile Picture"}
                      {confirmModalType === 'update' && "Change Profile Picture"}
                      {confirmModalType === 'delete' && "Delete Profile Picture"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 bg-page space-y-4">
                {confirmModalType === 'delete' ? (
                  <div className="text-center space-y-3">
                    <div className="w-24 h-24 rounded-full overflow-hidden mx-auto ring-4 ring-red-100 shadow-sm">
                      <img 
                        src={displayAvatar} 
                        alt="Profile to remove" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <p className="text-sm font-medium text-text-main">
                      Are you sure you want to remove your profile picture?
                    </p>
                    <p className="text-xs text-text-muted">
                      Your profile picture will be removed. This action cannot be undone.
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    {pendingPreview && (
                      <div className="w-32 h-32 rounded-full overflow-hidden mx-auto ring-4 ring-primary/20 shadow-md">
                        <img 
                          src={pendingPreview} 
                          alt="New profile preview" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-text-main">
                        {confirmModalType === 'update'
                          ? "Are you sure you want to update your profile picture with this photo?"
                          : "Are you sure you want to upload this photo as your profile picture?"
                        }
                      </p>
                      {pendingFile && (
                        <p className="text-xs text-text-muted mt-1">
                          File: <span className="font-semibold text-text-main">{pendingFile.name}</span> ({(pendingFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer with Confirm & Cancel Buttons */}
              <div className="bg-surface px-6 py-4 flex flex-row-reverse gap-3 border-t border-border-subtle">
                <button 
                  type="button" 
                  disabled={isActionLoading}
                  onClick={handleExecuteConfirm}
                  className={`inline-flex justify-center items-center rounded-md font-bold px-4 py-2 text-sm shadow-sm transition-colors disabled:opacity-50 ${
                    confirmModalType === 'delete'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-primary text-white hover:bg-primary-hover'
                  }`}
                >
                  {isActionLoading && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  {confirmModalType === 'delete' && (isActionLoading ? 'Deleting...' : 'Yes, Delete')}
                  {confirmModalType === 'update' && (isActionLoading ? 'Updating...' : 'Yes, Update')}
                  {confirmModalType === 'upload' && (isActionLoading ? 'Uploading...' : 'Yes, Upload')}
                </button>

                <button 
                  type="button" 
                  disabled={isActionLoading}
                  onClick={handleCancelConfirm} 
                  className="inline-flex justify-center rounded-md border border-border-subtle bg-surface text-text-main font-semibold px-4 py-2 text-sm shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};