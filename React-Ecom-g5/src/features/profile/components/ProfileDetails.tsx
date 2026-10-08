import React, { useState, useEffect } from 'react';
import { profileApi } from '../api/profileApi';

interface ProfileDetailsProps {
  initialFullName: string;
  initialPhone: string;
  email: string;
  onUpdate: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export const ProfileDetails: React.FC<ProfileDetailsProps> = ({ 
  initialFullName, 
  initialPhone, 
  email, 
  onUpdate,
  showToast
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone || '');

  useEffect(() => {
    setFullName(initialFullName);
    setPhone(initialPhone || '');
  }, [initialFullName, initialPhone]);

  // ဂဏန်းသီးသန့်သာ လက်ခံမည့် Function
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
    setPhone(onlyNums);
  };

  const handleStartEdit = () => {
    setFullName(initialFullName);
    setPhone(initialPhone || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFullName(initialFullName);
    setPhone(initialPhone || '');
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{11}$/.test(phone)) {
      showToast("Phone number must be exactly 11 digits.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await profileApi.updateProfile({ fullName, phone }); 
      showToast("Personal information updated successfully.", "success");
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update personal information.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-main">Personal Information</h2>
          <button onClick={handleStartEdit} className="text-primary text-sm font-medium hover:underline">
            Edit Profile
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-text-muted">Full Name</p>
            <p className="font-medium text-text-main">{initialFullName}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Email</p>
            <p className="font-medium text-text-main">{email}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Phone Number</p>
            <p className="font-medium text-text-main">{initialPhone || '-'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm">
      <h2 className="text-xl font-bold text-text-main mb-6">Edit Personal Information</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-main">Full Name</label>
          <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-main">Email</label>
          <input disabled type="email" value={email} className="mt-1 block w-full rounded-md border border-border-subtle bg-gray-100 px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-main">Phone Number</label>
          <input 
            required 
            type="text" 
            value={phone} 
            onChange={handlePhoneChange} 
            className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none" 
            placeholder="e.g. 09*********" 
          />
        </div>
        
        <div className="pt-4 flex justify-end gap-3 border-t border-border-subtle mt-6 pt-6">
          <button type="button" onClick={handleCancel} disabled={isSubmitting} className="px-4 py-2 border border-border-subtle bg-surface text-text-main font-semibold rounded-md text-sm hover:bg-slate-50 transition-colors disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white font-bold rounded-md text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 shadow-sm">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};