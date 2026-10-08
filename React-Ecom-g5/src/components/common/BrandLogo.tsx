import React from 'react';

interface BrandLogoProps {
  className?: string;
  theme?: 'light' | 'dark';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', theme = 'light' }) => {
  const isDark = theme === 'dark';
  
  // Theme အလိုက် အရောင်များသတ်မှတ်ခြင်း
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const subTextColor = isDark ? 'text-purple-400' : 'text-gray-600'; // Light mode တွင် ပိုထင်ရှားစေရန် gray-600 ပြောင်းထားပါသည်
  const innerBg = isDark ? 'bg-gray-950' : 'bg-white';

  return (
    /* Outer Gradient Border (အပြင်ဘောင် အဝိုင်း) */
    <div className={`inline-flex p-[2px] rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-md hover:shadow-lg transition-shadow duration-300 ${className}`}>
      
      {/* Inner Container (အဝိုင်းဘောင်ထဲက Logo နှင့် စာသား အားလုံးပါဝင်သည့်အပိုင်း) */}
      <div className={`flex items-center gap-3 px-5 py-2.5 rounded-full ${innerBg}`}>
        
        {/* Custom 6 + Cart SVG */}
        <svg 
          viewBox="0 0 28 28" 
          fill="none" 
          className="w-9 h-9 drop-shadow-md flex-shrink-0" /* Size ကို w-9 h-9 သို့ ကြီးပေးထားပါသည် */
        >
          <defs>
            <linearGradient id="cartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" /> {/* Pink */}
              <stop offset="100%" stopColor="#8b5cf6" /> {/* Purple */}
            </linearGradient>
          </defs>
          
          {/* Number 6 Curve */}
          <path 
            d="M17 5 C 10 5, 6 10, 6 17 C 6 20.5, 8.5 23, 12 23 C 15.5 23, 18 20.5, 18 17 C 18 13.5, 15.5 11, 12 11 C 9.5 11, 7.5 12.5, 6.5 15" 
            stroke="url(#cartGradient)" 
            strokeWidth="3" /* လိုင်းပိုထူစေရန် 3 သို့ပြောင်းထားပါသည် */
            strokeLinecap="round" 
          />
          
          {/* Cart Basket */}
          <path 
            d="M16 11 L 24 11 L 21.5 18 L 13.5 18" 
            stroke="url(#cartGradient)" 
            strokeWidth="3" /* လိုင်းပိုထူစေရန် 3 သို့ပြောင်းထားပါသည် */
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          
          {/* Wheels */}
          <circle cx="12" cy="25" r="2" fill="#ec4899" /> {/* ဘီးအရွယ်အစား ပိုကြီးထားပါသည် */}
          <circle cx="20" cy="25" r="2" fill="#ec4899" />
        </svg>

        {/* Text Area */}
        <div className="flex flex-col justify-center pr-2">
          <span className={`text-[21px] font-black tracking-tight leading-none ${textColor}`}>
            6SYNC
          </span>
          {/* Online Store စာသားကို font-extrabold ဖြင့် ပိုထင်းစေရန် ပြင်ထားပါသည် */}
          <span className={`text-[10px] font-extrabold tracking-[0.25em] uppercase mt-1.5 leading-none ${subTextColor}`}>
            Online Store
          </span>
        </div>
        
      </div>
    </div>
  );
};