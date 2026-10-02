import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch } from "../../../hooks/useAppDispatch";
import { useAppSelector } from "../../../hooks/useAppSelector";
import { login, clearError } from "../store/authSlice";
import {
  mergeGuestCartAsync,
  fetchAuthenticatedCart,
} from "../../cart/store/cartSlice";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [mergeWarning, setMergeWarning] = useState("");

  // Contact Support Modal State များ
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportName, setSupportName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [issueType, setIssueType] = useState("အကောင့်နှင့် ပတ်သက်၍");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSuccess, setSupportSuccess] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, error, isInitializing } = useAppSelector(
    (state) => state.auth,
  );
  const { guestItems } = useAppSelector((state) => state.cart);

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      navigate("/products", { replace: true });
    }
  }, [isInitializing, isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (formError) setFormError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (formError) setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setMergeWarning("");

    if (!email.trim() || !password) {
      setFormError("Please enter both email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    try {
      await dispatch(login({ email, password })).unwrap();

      if (guestItems && guestItems.length > 0) {
        try {
          const mergeResult = await dispatch(mergeGuestCartAsync()).unwrap();
          if (
            mergeResult.rejectedItems &&
            mergeResult.rejectedItems.length > 0
          ) {
            setMergeWarning("Some cart items could not be added.");
          }
        } catch (err) {
          setMergeWarning("Some cart items could not be added.");
        }
        dispatch(fetchAuthenticatedCart());
      }

      navigate("/products");
    } catch (err) {
      // login rejected
    }
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSupportSuccess(true);
    setTimeout(() => {
      setSupportSuccess(false);
      setShowSupportModal(false);
      setSupportName("");
      setSupportEmail("");
      setSupportMessage("");
    }, 2000);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-page">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-text-main">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-text-muted">
          Or{" "}
          <Link
            to="/register"
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            register for a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 border-t-4 border-accent">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {(formError || error) && (
              <div className="rounded-md bg-[#FEF2F2] p-4 border border-[#F87171]">
                <div className="text-sm text-[#B91C1C]">
                  {formError || error}
                </div>
              </div>
            )}

            {mergeWarning && (
              <div className="rounded-md bg-[#FEFBE8] p-4 border border-[#FDE047]">
                <div className="text-sm text-[#A16207]">{mergeWarning}</div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-main"
              >
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-secondary"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  className="block w-full appearance-none rounded-md border border-border-subtle pl-10 px-3 py-2 text-text-main placeholder-[#9CA3AF] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-main"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-secondary"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className="block w-full appearance-none rounded-md border border-border-subtle pl-10 pr-10 px-3 py-2 text-text-main placeholder-[#9CA3AF] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5 text-text-muted"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-text-muted"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Forgot your password?
              </Link>

              <button
                type="button"
                onClick={() => setShowSupportModal(true)}
                className="font-medium text-primary hover:text-primary-hover transition-colors focus:outline-none"
              >
                Need Support?
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Clean & Compact Contact Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6">
          <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                Contact Support
              </h3>
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {supportSuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm text-center font-medium my-4">
                မက်ဆေ့ချ် ပို့ဆောင်ပြီးပါပြီ။ မကြာမီ ပြန်လည်ဆက်သွယ်ပေးပါမည်။
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    သင့်အမည်
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="သင့်အမည်ကို ထည့်ပါ"
                    value={supportName}
                    onChange={(e) => setSupportName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    အီးမေးလ်
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    ပြဿနာ အမျိုးအစား
                  </label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all bg-white"
                  >
                    <option value="အကောင့်နှင့် ပတ်သက်၍">
                      အကောင့်နှင့် ပတ်သက်၍
                    </option>
                    <option value="ငွေပေးချေမှုဆိုင်ရာ">
                      ငွေပေးချေမှုဆိုင်ရာ
                    </option>
                    <option value="အခြား">အခြား</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    အသေးစိတ် ရှင်းလင်းချက်
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="သင့်ပြဿနာကို အသေးစိတ် ရေးသားပေးပါ..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2 bg-primary text-white font-medium text-xs rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all shadow-sm"
                  >
                    မက်ဆေ့ချ် ပို့မည်
                  </button>
                </div>
              </form>
            )}

            {/* Support Info Footer */}
            <div className="mt-4 pt-3 border-t border-gray-100 text-center text-[11px] text-gray-500 space-y-1">
              <p>Hotline: +95 9 123 456 789 (9:00 AM - 6:00 PM)</p>
              <p>Email: support@eshop.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
