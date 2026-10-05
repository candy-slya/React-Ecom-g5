import React, { useState } from "react";
import { profileApi } from "../api/profileApi";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (message: string, type: "success" | "error") => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }

    try {
      setLoading(true);
      await profileApi.changePassword({ currentPassword, newPassword });
      showToast("Password changed successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to change password.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
        <div className="relative z-10 w-full max-w-md rounded-xl bg-surface p-6 shadow-2xl border border-border-subtle animate-drop-down">
          <h3 className="text-xl font-bold text-text-main mb-4">
            Change Password
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-md border border-border-subtle p-2 text-text-main bg-page focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-md border border-border-subtle p-2 text-text-main bg-page focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border border-border-subtle p-2 text-text-main bg-page focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md border border-border-subtle text-text-main hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-md bg-primary text-white font-bold hover:bg-primary-hover disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
