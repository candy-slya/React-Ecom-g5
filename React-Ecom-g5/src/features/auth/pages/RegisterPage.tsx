import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch } from "../../../hooks/useAppDispatch";
import { useAppSelector } from "../../../hooks/useAppSelector";
import { register, clearError } from "../store/authSlice";
import {
  mergeGuestCartAsync,
  fetchAuthenticatedCart,
} from "../../cart/store/cartSlice";

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Checkbox & Modal State များ (Terms & Policy ကို တစ်ခုတည်း ပေါင်းထားပါသည်)
  const [agreeTermsAndPolicy, setAgreeTermsAndPolicy] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [mergeWarning, setMergeWarning] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setMergeWarning("");

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (!agreeTermsAndPolicy) {
      setFormError("You must agree to the Terms of Service & Privacy Policy.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    const registerPayload = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
    };

    try {
      await dispatch(register(registerPayload)).unwrap();

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
      // register rejected
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-page">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-text-main">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-text-muted">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
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

            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-text-main"
              >
                Full Name
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
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-border-subtle pl-10 px-3 py-2 text-text-main placeholder-[#9CA3AF] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                />
              </div>
            </div>

            {/* Email Address */}
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
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-border-subtle pl-10 px-3 py-2 text-text-main placeholder-[#9CA3AF] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-text-main"
              >
                Phone Number (Optional - Myanmar Only)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-secondary"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="959123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-border-subtle pl-10 px-3 py-2 text-text-main placeholder-[#9CA3AF] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-text-main"
                >
                  Confirm Password
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
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-border-subtle pl-10 pr-10 px-3 py-2 text-text-main placeholder-[#9CA3AF] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
            </div>

            {/* Single Combined Terms & Privacy Checkbox */}
            <div className="flex items-center">
              <input
                id="agreeTermsAndPolicy"
                type="checkbox"
                required
                checked={agreeTermsAndPolicy}
                onChange={(e) => setAgreeTermsAndPolicy(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-border-subtle rounded cursor-pointer"
              />
              <label
                htmlFor="agreeTermsAndPolicy"
                className="ml-2 block text-sm text-text-main cursor-pointer"
              >
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-primary hover:underline font-medium focus:outline-none"
                >
                  Terms of Service
                </button>{" "}
                &{" "}
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-primary hover:underline font-medium focus:outline-none"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6">
          <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all my-8 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-xl font-bold text-gray-900">
                Privacy Policy
              </h3>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-gray-700 space-y-4 overflow-y-auto pr-2 mt-4 flex-1">
              <p className="text-xs text-gray-500">
                Last updated: October 26, 2023
              </p>
              <p className="leading-relaxed">
                ကျွန်ုပ်တို့၏ E-commerce ဆိုင်မှ ဝယ်ယူသည့်အခါ
                သင့်ကိုယ်ရေးကိုယ်တာ အချက်အလက်များကို မည်သို့ စုဆောင်း၊ အသုံးပြု၊
                သိမ်းဆည်းနည်းကို ဤ Privacy Policy တွင် ရှင်းပြထားပါသည်။
              </p>
              <h4 className="font-bold text-gray-900 mt-3 text-base">
                ၁။ စုဆောင်းသော အချက်အလက်များ
              </h4>
              <ul className="list-disc pl-5 space-y-2 leading-relaxed">
                <li>
                  <strong>ကိုယ်ရေးကိုယ်တာ အချက်အလက်:</strong> အမည်၊ အီးမေးလ်၊
                  ဖုန်းနံပါတ်၊ ပို့ဆောင်ရေးလိပ်စာ။
                </li>
                <li>
                  <strong>ငွေပေးချေမှု အချက်အလက်:</strong> ကတ်နံပါတ်
                  (ကျွန်ုပ်တို့ထံတွင် သိမ်းဆည်းထားခြင်းမရှိဘဲ Payment Gateway
                  မှတဆင့် လုံခြုံစွာ ဆောင်ရွက်ပါသည်)။
                </li>
                <li>
                  <strong>အသုံးပြုမှု အချက်အလက်:</strong> သင်ကြည့်ရှုသော
                  ပစ္စည်းများ၊ ဝယ်ယူမှု မှတ်တမ်းများ။
                </li>
              </ul>
              <h4 className="font-bold text-gray-900 mt-3 text-base">
                ၂။ အချက်အလက်များကို အသုံးပြုခြင်း
              </h4>
              <p>သင့်အချက်အလက်များကို အောက်ပါအတွက် အသုံးပြုပါသည် -</p>
              <ul className="list-disc pl-5 space-y-2 leading-relaxed">
                <li>အမှာစာများ ဆောင်ရွက်ပေးရန်နှင့် ပစ္စည်းပို့ဆောင်ရန်။</li>
                <li>ဝယ်ယူမှုဆိုင်ရာ အသိပေးချက်များ ပို့ပေးရန်။</li>
              </ul>
            </div>
            <div className="mt-6 pt-3 border-t border-gray-100 text-right">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6">
          <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all my-8 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-xl font-bold text-gray-900">
                Terms of Service
              </h3>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-gray-700 space-y-4 overflow-y-auto pr-2 mt-4 flex-1">
              <p className="leading-relaxed">
                ဤစည်းကမ်းချက်များသည် ကျွန်ုပ်တို့၏ ဝဘ်ဆိုက်နှင့်
                ဝန်ဆောင်မှုများကို အသုံးပြုခြင်းအတွက် သဘောတူညီချက် ဖြစ်ပါသည်။
              </p>
              <h4 className="font-bold text-gray-900 mt-3 text-base">
                ၁။ အကောင့်ဖွင့်ခြင်း
              </h4>
              <p className="leading-relaxed">
                အကောင့်ဖွင့်ရန် အသက် ၁၈ နှစ်ပြည့်ပြီးသူဖြစ်ရမည်။ သင့်အကောင့်၏
                လုံခြုံရေးအတွက် Password ကို လုံခြုံစွာ သိမ်းဆည်းရန် သင့်တွင်
                တာဝန်ရှိပါသည်။
              </p>
              <h4 className="font-bold text-gray-900 mt-3 text-base">
                ၂။ အော်ဒါနှင့် ငွေပေးချေမှု
              </h4>
              <ul className="list-disc pl-5 space-y-2 leading-relaxed">
                <li>
                  အော်ဒါတင်ပြီးပါက ငွေပေးချေမှု အတည်ပြုချက်ရရှိမှသာ အော်ဒါကို
                  စတင်ဆောင်ရွက်မည် ဖြစ်သည်။
                </li>
                <li>
                  စျေးနှုန်းများနှင့် ပစ္စည်းလက်ကျန်များကို
                  ကြိုတင်အသိပေးခြင်းမရှိဘဲ ပြောင်းလဲနိုင်ပါသည်။
                </li>
              </ul>
              <h4 className="font-bold text-gray-900 mt-3 text-base">
                ၃။ ပစ္စည်းပို့ဆောင်ခြင်းနှင့် ပြန်အပ်ခြင်း
              </h4>
              <ul className="list-disc pl-5 space-y-2 leading-relaxed">
                <li>
                  ပစ္စည်းများကို သတ်မှတ်ထားသော လိပ်စာသို့သာ ပို့ဆောင်ပါသည်။
                </li>
                <li>
                  ပစ္စည်းလက်ခံရရှိပြီး ၇ ရက်အတွင်း ချို့ယွင်းချက်ရှိပါက
                  ပြန်လည်အဆန်းနိုင်ပါသည်။
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-3 border-t border-gray-100 text-right">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
