import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export const PolicyPage: React.FC = () => {
  const location = useLocation();
  const isPrivacy = location.pathname.includes('privacy');

  return (
    <div className="min-h-screen bg-page py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:underline">Home</Link> / {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
        </div>

        {/* Read-Only Document Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Header */}
          <div className="bg-slate-900 text-white p-8 sm:p-10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                  Official Legal Document &bull; Read-Only
                </span>
              </div>
              <h1 className="text-3xl font-black">
                {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
              </h1>
              <p className="text-slate-300 text-sm mt-1">
                {isPrivacy ? 'ကိုယ်ရေးကိုယ်တာ အချက်အလက် ထိန်းသိမ်းရေး မူဝါဒ' : 'ဝန်ဆောင်မှု အသုံးပြုခြင်းဆိုင်ရာ စည်းမျဉ်းစည်းကမ်းများ'}
              </p>
            </div>

            <Link
              to="/"
              className="self-start sm:self-auto px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors border border-white/20"
            >
              &larr; Back to Shop
            </Link>
          </div>

          {/* Read Only Notice */}
          <div className="bg-amber-50 border-b border-amber-200 px-8 py-3 text-xs text-amber-800 flex items-center justify-between">
            <span>ဤစာမျက်နှာသည် တရားဝင် အသိပေးဖတ်ရှုရန်အတွက်သာ ဖြစ်ပါသည် (Read-Only Document).</span>
            <span className="font-mono text-[11px]">Last Updated: 2026</span>
          </div>

          {/* Body Content */}
          <div className="p-8 sm:p-10 space-y-8 text-slate-700 leading-relaxed text-sm select-text">
            {isPrivacy ? (
              <>
                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900 border-b pb-2">၁။ မိတ်ဆက် (Introduction)</h2>
                  <p>
                    6SYNC Online Store သည် အသုံးပြုသူများ၏ ကိုယ်ရေးအချက်အလက် လုံခြုံမှုကို အလေးထား ကာကွယ်စောင့်ရှောက်ပါသည်။ ဤ Privacy Policy တွင် ကျွန်ုပ်တို့၏ ဝန်ဆောင်မှုများကို အသုံးပြုချိန်၌ အချက်အလက်များ မည်သို့ စုဆောင်း၊ အသုံးပြု၊ ထိန်းသိမ်းထားရှိသည်ကို အသေးစိတ် ဖော်ပြထားပါသည်။
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900 border-b pb-2">၂။ စုဆောင်းသော အချက်အလက်များ (Information We Collect)</h2>
                  <ul className="list-disc pl-6 space-y-2 text-slate-600">
                    <li>အကောင့်ဖွင့်လှစ်ခြင်းဆိုင်ရာ အချက်အလက်များ (အမည်၊ ဖုန်းနံပါတ်၊ အီးမေးလ်)။</li>
                    <li>ပို့ဆောင်ရေးလိပ်စာ (တိုင်း/ပြည်နယ်၊ ခရိုင်၊ မြို့နယ်၊ အသေးစိတ်လိပ်စာ)။</li>
                    <li>အော်ဒါမှတ်တမ်းများနှင့် ငွေပေးချေမှုမှတ်တမ်း အထောက်အထားများ။</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900 border-b pb-2">၃။ အချက်အလက် အသုံးပြုပုံ (Use of Information)</h2>
                  <p>
                    စုဆောင်းရရှိသော အချက်အလက်များကို အော်ဒါများ တိကျမှန်ကန်စွာ ပို့ဆောင်ပေးနိုင်ရန်၊ ဝယ်ယူသူထံသို့ အော်ဒါအခြေအနေ အကြောင်းကြားရန်နှင့် ဝန်ဆောင်မှု အဆင့်အတန်း မြှင့်တင်ရန်အတွက်သာ သီးသန့် အသုံးပြုပါသည်။
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900 border-b pb-2">၄။ အချက်အလက် လုံခြုံရေး (Data Security)</h2>
                  <p>
                    သင့်ကိုယ်ရေးအချက်အလက်များကို ခွင့်ပြုချက်မရှိဘဲ ပြင်ပသို့ ပေါက်ကြားခြင်း၊ ပြင်ဆင်ခြင်း မရှိစေရန် ခေတ်မီ နည်းပညာနှင့် လုံခြုံရေးအဆင့်အတန်းများဖြင့် အကာအကွယ်ပေးထားပါသည်။
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900 border-b pb-2">၁။ စည်းမျဉ်းများကို သဘောတူလက်ခံခြင်း (Acceptance of Terms)</h2>
                  <p>
                    6SYNC Online Store ၏ ဝက်ဘ်ဆိုဒ်နှင့် ဝန်ဆောင်မှုများကို အသုံးပြုခြင်း၊ အော်ဒါတင်ခြင်းသည် ဤစည်းမျဉ်းစည်းကမ်းများအားလုံးကို အပြည့်အဝ နားလည် သဘောတူပြီးဖြစ်ကြောင်း အသိအမှတ်ပြုပါသည်။
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900 border-b pb-2">၂။ ကုန်ပစ္စည်းနှင့် ဈေးနှုန်းသတ်မှတ်ချက် (Products & Pricing)</h2>
                  <p>
                    ရောင်းချနေသော ကုန်ပစ္စည်းအားလုံး၏ ဈေးနှုန်းနှင့် စတော့ခ်လက်ကျန် အချက်အလက်များကို အချိန်နှင့်တစ်ပြေးညီ ဖော်ပြထားပါသည်။ ငွေကြေးနှုန်းထားအားလုံးသည် မြန်မာကျပ်ငွေ (MMK) ဖြင့်သာ ဖော်ပြပါသည်။
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900 border-b pb-2">၃။ ပို့ဆောင်ခနှင့် ပို့ဆောင်ရေးဆိုင်ရာ မူဝါဒ (Shipping & Delivery)</h2>
                  <p>
                    ပို့ဆောင်ခနှုန်းထားများကို မိမိရွေးချယ်သော တိုင်း/ပြည်နယ်၊ ခရိုင်၊ မြို့နယ်အလိုက် သတ်မှတ်ထားသော ပို့ဆောင်ခစာရင်းအတိုင်း ကောက်ခံမည်ဖြစ်ပြီး သတ်မှတ်ထားသော ခန့်မှန်းရက်အတွင်း အရောက်ပို့ဆောင်ပေးပါမည်။
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900 border-b pb-2">၄။ ငွေပေးချေမှုနှင့် ကုန်ပစ္စည်းပြန်လည်လဲလှယ်ခြင်း (Payment & Returns)</h2>
                  <p>
                    ငွေပေးချေမှုများကို Mini Banking နှင့် Mobile Wallet များမှတစ်ဆင့် လုံခြုံစွာ ပေးချေနိုင်ပါသည်။ ကုန်ပစ္စည်းချို့ယွင်းချက် သို့မဟုတ် မှားယွင်းမှုများရှိပါက သတ်မှတ်ကာလအတွင်း Return & Refund မူဝါဒအတိုင်း တင်ပြဆောင်ရွက်နိုင်ပါသည်။
                  </p>
                </section>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-8 py-4 text-xs text-slate-500 flex justify-between items-center">
            <span>&copy; {new Date().getFullYear()} 6SYNC Online Store. All rights reserved.</span>
            <span className="font-semibold text-slate-700">Official Policy (Read-Only)</span>
          </div>

        </div>

      </div>
    </div>
  );
};
