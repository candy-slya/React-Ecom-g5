import React, { useState } from 'react';
import { profileApi } from '../api/profileApi';
import { isAxiosError } from 'axios';

interface ProfileDetailsProps {
  initialFullName: string;
  initialPhone: string;
  email: string;
  onUpdate: (name: string, phone: string) => void;
}

export const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  initialFullName,
  initialPhone,
  email,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!fullName.trim() || !phone.trim()) {
      setError("Full name and phone are required.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await profileApi.updateProfile({ fullName, phone });
      onUpdate(fullName, phone);
      setIsEditing(false);
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to update profile.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(initialFullName);
    setPhone(initialPhone);
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-text-main">Personal Information</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-[#B42318]/10 p-3 text-sm text-[#B42318]">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-muted">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          ) : (
            <div className="mt-1 text-base text-text-main font-medium">{initialFullName}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted">Email</label>
          <div className="mt-1 text-base text-text-main">{email}</div>
          {isEditing && <p className="mt-1 text-xs text-text-muted">Email cannot be changed.</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted">Phone</label>
          {isEditing ? (
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          ) : (
            <div className="mt-1 text-base text-text-main">{initialPhone || 'Not provided'}</div>
          )}
        </div>

        {isEditing && (
          <div className="mt-6 flex space-x-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-text-main hover:bg-page disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
