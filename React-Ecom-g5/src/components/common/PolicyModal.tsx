import React, { useEffect } from 'react';

export type PolicyType = 'privacy' | 'terms' | null;

interface PolicyModalProps {
  type: PolicyType;
  isOpen: boolean;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ type, isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !type) return null;

  const isPrivacy = type === 'privacy';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 z-10 animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20">
              {isPrivacy ? (
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full">
                  Read Only
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isPrivacy ? 'ကိုယ်ရေးကိုယ်တာ အချက်အလက် ထိန်းသိမ်းရေး မူဝါဒ' : 'ဝန်ဆောင်မှု အသုံးပြုခြင်းဆိုင်ရာ စည်းမျဉ်းစည်းကမ်းများ'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors text-lg"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Read-Only Notice Ribbon */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-6 py-2 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>ဤစာမျက်နှာသည် တရားဝင် အသိပေးဖတ်ရှုရန်အတွက်သာ ဖြစ်ပါသည် (Read-Only Document).</span>
          </div>
          <span className="text-[11px] text-amber-700 font-mono">Last Updated: 2026</span>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed select-text">
          {isPrivacy ? (
            <>
              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 border-b pb-1">၁။ မိတ်ဆက် (Introduction)</h3>
                <p>
                  6SYNC Online Store သည် အသုံးပြုသူများ၏ ကိုယ်ရေးအချက်အလက် လုံခြုံမှုကို အလေးထား ကာကွယ်စောင့်ရှောက်ပါသည်။ ဤ Privacy Policy တွင် ကျွန်ုပ်တို့၏ ဝန်ဆောင်မှုများကို အသုံးပြုချိန်၌ အချက်အလက်များ မည်သို့ စုဆောင်း၊ အသုံးပြု၊ ထိန်းသိမ်းထားရှိသည်ကို အသေးစိတ် ဖော်ပြထားပါသည်။
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 border-b pb-1">၂။ စုဆောင်းသော အချက်အလက်များ (Information We Collect)</h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>အကောင့်ဖွင့်လှစ်ခြင်းဆိုင်ရာ အချက်အလက်များ (အမည်၊ ဖုန်းနံပါတ်၊ အီးမေးလ်)။</li>
                  <li>ပို့ဆောင်ရေးလိပ်စာ (တိုင်း/ပြည်နယ်၊ ခရိုင်၊ မြို့နယ်၊ အသေးစိတ်လိပ်စာ)။</li>
                  <li>အော်ဒါမှတ်တမ်းများနှင့် ငွေပေးချေမှုမှတ်တမ်း အထောက်အထားများ။</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 border-b pb-1">၃။ အချက်အလက် အသုံးပြုပုံ (Use of Information)</h3>
                <p>
                  စုဆောင်းရရှိသော အချက်အလက်များကို အော်ဒါများ တိကျမှန်ကန်စွာ ပို့ဆောင်ပေးနိုင်ရန်၊ ဝယ်ယူသူထံသို့ အော်ဒါအခြေအနေ အကြောင်းကြားရန်နှင့် ဝန်ဆောင်မှု အဆင့်အတန်း မြှင့်တင်ရန်အတွက်သာ သီးသန့် အသုံးပြုပါသည်။
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 border-b pb-1">၄။ အချက်အလက် လုံခြုံရေး (Data Security)</h3>
                <p>
                  သင့်ကိုယ်ရေးအချက်အလက်များကို ခွင့်ပြုချက်မရှိဘဲ ပြင်ပသို့ ပေါက်ကြားခြင်း၊ ပြင်ဆင်ခြင်း မရှိစေရန် ခေတ်မီ နည်းပညာနှင့် လုံခြုံရေးအဆင့်အတန်းများဖြင့် အကာအကွယ်ပေးထားပါသည်။
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 border-b pb-1">၁။ စည်းမျဉ်းများကို သဘောတူလက်ခံခြင်း (Acceptance of Terms)</h3>
                <p>
                  6SYNC Online Store ၏ ဝက်ဘ်ဆိုဒ်နှင့် ဝန်ဆောင်မှုများကို အသုံးပြုခြင်း၊ အော်ဒါတင်ခြင်းသည် ဤစည်းမျဉ်းစည်းကမ်းများအားလုံးကို အပြည့်အဝ နားလည် သဘောတူပြီးဖြစ်ကြောင်း အသိအမှတ်ပြုပါသည်။
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 border-b pb-1">၂။ ကုန်ပစ္စည်းနှင့် ဈေးနှုန်းသတ်မှတ်ချက် (Products & Pricing)</h3>
                <p>
                  ရောင်းချနေသော ကုန်ပစ္စည်းအားလုံး၏ ဈေးနှုန်းနှင့် စတော့ခ်လက်ကျန် အချက်အလက်များကို အချိန်နှင့်တစ်ပြေးညီ ဖော်ပြထားပါသည်။ ငွေကြေးနှုန်းထားအားလုံးသည် မြန်မာကျပ်ငွေ (MMK) ဖြင့်သာ ဖော်ပြပါသည်။
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 border-b pb-1">၃။ ပို့ဆောင်ခနှင့် ပို့ဆောင်ရေးဆိုင်ရာ မူဝါဒ (Shipping & Delivery)</h3>
                <p>
                  ပို့ဆောင်ခနှုန်းထားများကို မိမိရွေးချယ်သော တိုင်း/ပြည်နယ်၊ ခရိုင်၊ မြို့နယ်အလိုက် သတ်မှတ်ထားသော ပို့ဆောင်ခစာရင်းအတိုင်း ကောက်ခံမည်ဖြစ်ပြီး သတ်မှတ်ထားသော ခန့်မှန်းရက်အတွင်း အရောက်ပို့ဆောင်ပေးပါမည်။
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 border-b pb-1">၄။ ငွေပေးချေမှုနှင့် ကုန်ပစ္စည်းပြန်လည်လဲလှယ်ခြင်း (Payment & Returns)</h3>
                <p>
                  ငွေပေးချေမှုများကို Mini Banking နှင့် Mobile Wallet များမှတစ်ဆင့် လုံခြုံစွာ ပေးချေနိုင်ပါသည်။ ကုန်ပစ္စည်းချို့ယွင်းချက် သို့မဟုတ် မှားယွင်းမှုများရှိပါက သတ်မှတ်ကာလအတွင်း Return & Refund မူဝါဒအတိုင်း တင်ပြဆောင်ရွက်နိုင်ပါသည်။
                </p>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>&copy; 2026 6SYNC Online Store. Official Document (Read-Only).</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
          >
            Close / ပိတ်မည်
          </button>
        </div>

      </div>
    </div>
  );
};
