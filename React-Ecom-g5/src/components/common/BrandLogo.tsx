import React from 'react';

interface BrandLogoProps {
  className?: string;
  theme?: 'light' | 'dark';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', theme = 'light' }) => {
  const isDark = theme === 'dark';
  const primaryColor = isDark ? 'text-white' : 'text-primary';
  const secondaryColor = isDark ? 'text-accent' : 'text-text-main';
  const numberColor = 'text-white';
  const bagBg = 'text-primary';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center w-8 h-8 flex-shrink-0">
        <svg viewBox="0 0 24 24" className="absolute inset-0 w-full h-full" aria-hidden="true">
          <path d="M8 8V5a4 4 0 018 0v3" fill="none" stroke="currentColor" strokeWidth="2.5" className={primaryColor} strokeLinecap="round" />
          <path d="M4 8h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" fill="currentColor" className={bagBg} />
        </svg>
        <span className={`relative z-10 font-black text-[14px] mt-1 ${numberColor}`}>6</span>
      </div>
      <div className="flex flex-col leading-none justify-center">
        <span className={`text-[17px] font-black tracking-tight ${primaryColor}`}>6SYNC</span>
        <span className={`text-[9px] font-bold tracking-widest uppercase mt-[2px] ${secondaryColor}`}>Online Store</span>
      </div>
    </div>
  );
};
