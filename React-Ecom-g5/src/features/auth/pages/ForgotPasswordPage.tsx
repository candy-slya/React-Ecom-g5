import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

/* ------------------------------------------------------------------ */
/*  Logo Animation Styles                                              */
/* ------------------------------------------------------------------ */
const logoAnimationStyles = `
  @keyframes draw-six {
    0%   { stroke-dashoffset: var(--len); opacity: 0; }
    5%   { opacity: 1; }
    45%  { stroke-dashoffset: 0; opacity: 1; }
    75%  { stroke-dashoffset: 0; opacity: 1; }
    95%  { stroke-dashoffset: calc(var(--len) * -1); opacity: 0; }
    100% { stroke-dashoffset: calc(var(--len) * -1); opacity: 0; }
  }
  @keyframes draw-cart {
    0%, 25%  { stroke-dashoffset: var(--len); opacity: 0; }
    30%      { opacity: 1; }
    55%      { stroke-dashoffset: 0; opacity: 1; }
    75%      { stroke-dashoffset: 0; opacity: 1; }
    95%      { stroke-dashoffset: calc(var(--len) * -1); opacity: 0; }
    100%     { stroke-dashoffset: calc(var(--len) * -1); opacity: 0; }
  }
  @keyframes pop-wheel {
    0%, 50% { transform: scale(0); opacity: 0; }
    60%     { transform: scale(1.3); opacity: 1; }
    68%     { transform: scale(1); opacity: 1; }
    85%     { transform: scale(1); opacity: 1; }
    95%,100%{ transform: scale(0); opacity: 0; }
  }
  @keyframes glow-pulse {
    0%, 100% { opacity: 0.3; transform: scale(0.95); }
    50%      { opacity: 0.6; transform: scale(1.05); }
  }
  .path-six {
    stroke-dasharray: var(--len);
    stroke-dashoffset: var(--len);
    animation: draw-six 6s cubic-bezier(0.65, 0, 0.35, 1) infinite;
  }
  .path-cart {
    stroke-dasharray: var(--len);
    stroke-dashoffset: var(--len);
    animation: draw-cart 6s cubic-bezier(0.65, 0, 0.35, 1) infinite;
  }
  .wheel {
    transform-origin: center;
    transform-box: fill-box;
    animation: pop-wheel 6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
  }
  .glow { animation: glow-pulse 3s ease-in-out infinite; }
  .logo-hover:hover .path-six,
  .logo-hover:hover .path-cart,
  .logo-hover:hover .wheel {
    animation-play-state: paused;
  }
`;

/* ------------------------------------------------------------------ */
/*  Animated 6SYNC Logo                                                */
/* ------------------------------------------------------------------ */
const AnimatedLogo: React.FC = () => (
  <div className="flex justify-center">
    <div
      className="logo-hover inline-flex p-[2px] rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-md hover:shadow-lg transition-shadow duration-300"
      style={{
        boxShadow:
          "0 0 40px rgba(139, 92, 246, 0.35), 0 8px 30px rgba(0,0,0,0.12)",
      }}
    >
      <div className="relative flex items-center gap-3 px-5 py-2.5 rounded-full bg-white">
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full pointer-events-none glow"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)",
          }}
        />

        <svg
          viewBox="0 0 28 28"
          fill="none"
          className="relative w-9 h-9 drop-shadow-md flex-shrink-0"
        >
          <defs>
            <linearGradient
              id="cartGradientAnim"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          <path
            className="path-six"
            style={{ "--len": 60 } as React.CSSProperties}
            d="M17 5 C 10 5, 6 10, 6 17 C 6 20.5, 8.5 23, 12 23 C 15.5 23, 18 20.5, 18 17 C 18 13.5, 15.5 11, 12 11 C 9.5 11, 7.5 12.5, 6.5 15"
            stroke="url(#cartGradientAnim)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <path
            className="path-cart"
            style={{ "--len": 20 } as React.CSSProperties}
            d="M16 11 L 24 11 L 21.5 18 L 13.5 18"
            stroke="url(#cartGradientAnim)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle
            className="wheel"
            style={{ animationDelay: "0s" }}
            cx="12"
            cy="25"
            r="2"
            fill="#ec4899"
          />
          <circle
            className="wheel"
            style={{ animationDelay: "0.08s" }}
            cx="20"
            cy="25"
            r="2"
            fill="#ec4899"
          />
        </svg>

        <div className="relative flex flex-col justify-center pr-2">
          <span className="text-[21px] font-black tracking-tight leading-none text-gray-900">
            6SYNC
          </span>
          <span className="text-[10px] font-extrabold tracking-[0.25em] uppercase mt-1.5 leading-none text-gray-600">
            Online Store
          </span>
        </div>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Forgot Password Page                                               */
/* ------------------------------------------------------------------ */
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
      setStep(3);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Invalid or expired verification code.",
      );
    } finally {
      setLoading(false);
    }
  };

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
    <>
      <style>{logoAnimationStyles}</style>

      <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-page">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* ✅ Animated Logo */}
          <AnimatedLogo />

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
          <div
            className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 border-t-4"
            style={{
              borderImage:
                "linear-gradient(to right, #ec4899 0%, #8b5cf6 50%, #6366f1 100%) 1",
            }}
          >
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

            {/* STEP 1 */}
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

            {/* STEP 2 */}
            {step === 2 && (
              <form
                className="space-y-6"
                onSubmit={handleVerifyCode}
                noValidate
              >
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

            {/* STEP 3 */}
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

          {/* ✅ Back to shop — card အောက်မှာ */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary transition-colors"
            >
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to shop
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
