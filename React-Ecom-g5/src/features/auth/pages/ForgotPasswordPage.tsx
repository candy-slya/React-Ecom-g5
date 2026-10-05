import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // STEP 1: Send Email
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/storefront/v1/auth/customer/forgot-password", {
        email,
      });
      setStep(2);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setError("This email address is not registered.");
      } else {
        setError(
          err?.response?.data?.message ||
            "Failed to send reset code. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify Code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code || code.trim().length !== 6) {
      setError("Please enter the valid 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/storefront/v1/auth/customer/verify-code", {
        email,
        code,
      });
      setStep(3); // Proceed to Step 3 (New Password) if code is valid
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Invalid or expired verification code.",
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/storefront/v1/auth/customer/reset-password", {
        email,
        code,
        newPassword,
      });

      setSuccessMsg("Password reset successfully! Redirecting to Sign In...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-page">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-text-main">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-text-muted">
          {step === 1 &&
            "Enter your email address to receive a 6-digit reset code."}
          {step === 2 && `Enter the 6-digit code sent to ${email}`}
          {step === 3 && "Create a new password for your account."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 border-t-4 border-accent">
          {error && (
            <div className="mb-4 rounded-md bg-[#FEF2F2] p-4 border border-[#F87171]">
              <div className="text-sm text-[#B91C1C]">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 rounded-md bg-green-50 p-4 border border-green-200">
              <div className="text-sm text-green-700 text-center font-medium">
                {successMsg}
              </div>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleSendCode} noValidate>
              <div>
                <label className="block text-sm font-medium text-text-main">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="you@example.com"
                    className="block w-full appearance-none rounded-md border border-border-subtle px-3 py-2 text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Sending Code..." : "Send Reset Code"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Enter 6-Digit Code */}
          {step === 2 && (
            <form className="space-y-6" onSubmit={handleVerifyCode} noValidate>
              <div>
                <label className="block text-sm font-medium text-text-main">
                  6-Digit Verification Code
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="123456"
                    className="block w-full text-center tracking-widest font-bold text-lg rounded-md border border-border-subtle px-3 py-2 text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                  />
                </div>
                <p className="mt-2 text-xs text-text-muted text-center">
                  Code will expire in 5 minutes.
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Enter New Password */}
          {step === 3 && (
            <form
              className="space-y-4"
              onSubmit={handleResetPassword}
              noValidate
            >
              <div>
                <label className="block text-sm font-medium text-text-main">
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-md border border-border-subtle px-3 py-2 text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main">
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-md border border-border-subtle px-3 py-2 text-text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Resetting Password..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary-hover"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
