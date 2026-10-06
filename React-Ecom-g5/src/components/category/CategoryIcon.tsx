import React from 'react';

export interface CategoryTheme {
  bgGradient: string;
  iconColor: string;
  badgeBg: string;
  borderColor: string;
  glowColor: string;
}

export const getCategoryTheme = (name: string): CategoryTheme => {
  const n = name.toLowerCase();

  // Men's Clothing
  if (n.includes('men') && (n.includes('cloth') || n.includes('fashion') || n.includes('wear') || n.includes('shirt'))) {
    return {
      bgGradient: 'from-slate-100 via-indigo-50/70 to-blue-50',
      iconColor: 'text-indigo-600',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      borderColor: 'group-hover:border-indigo-400',
      glowColor: 'group-hover:shadow-indigo-500/15',
    };
  }

  // Women's Clothing
  if (n.includes('women') && (n.includes('cloth') || n.includes('fashion') || n.includes('wear'))) {
    return {
      bgGradient: 'from-pink-50 via-rose-50/70 to-red-50',
      iconColor: 'text-pink-600',
      badgeBg: 'bg-pink-50 text-pink-700 border-pink-200',
      borderColor: 'group-hover:border-pink-400',
      glowColor: 'group-hover:shadow-pink-500/15',
    };
  }

  // Kids Clothing
  if (n.includes('kid') || n.includes('baby') || n.includes('children')) {
    return {
      bgGradient: 'from-amber-50 via-orange-50/60 to-yellow-50',
      iconColor: 'text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      borderColor: 'group-hover:border-amber-400',
      glowColor: 'group-hover:shadow-amber-500/15',
    };
  }

  // Shoes & Footwear
  if (n.includes('shoe') || n.includes('sneaker') || n.includes('footwear')) {
    return {
      bgGradient: 'from-orange-50 via-red-50/50 to-amber-50',
      iconColor: 'text-orange-600',
      badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
      borderColor: 'group-hover:border-orange-400',
      glowColor: 'group-hover:shadow-orange-500/15',
    };
  }

  // Accessories & Jewelry
  if (n.includes('accessor') || n.includes('jewel') || n.includes('bag') || n.includes('watch')) {
    return {
      bgGradient: 'from-purple-50 via-violet-50/60 to-fuchsia-50',
      iconColor: 'text-purple-600',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      borderColor: 'group-hover:border-purple-400',
      glowColor: 'group-hover:shadow-purple-500/15',
    };
  }

  // Fashion General
  if (n.includes('fashion') || n.includes('cloth') || n.includes('apparel')) {
    return {
      bgGradient: 'from-fuchsia-50 via-pink-50/60 to-purple-50',
      iconColor: 'text-fuchsia-600',
      badgeBg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
      borderColor: 'group-hover:border-fuchsia-400',
      glowColor: 'group-hover:shadow-fuchsia-500/15',
    };
  }

  // Smartphones & Mobile
  if (n.includes('smart') || n.includes('phone') || n.includes('mobile')) {
    return {
      bgGradient: 'from-cyan-50 via-sky-50/60 to-blue-50',
      iconColor: 'text-cyan-600',
      badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      borderColor: 'group-hover:border-cyan-400',
      glowColor: 'group-hover:shadow-cyan-500/15',
    };
  }

  // Laptops & Computers
  if (n.includes('laptop') || n.includes('computer') || n.includes('pc') || n.includes('mac')) {
    return {
      bgGradient: 'from-blue-50 via-indigo-50/60 to-sky-50',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      borderColor: 'group-hover:border-blue-400',
      glowColor: 'group-hover:shadow-blue-500/15',
    };
  }

  // Tablets
  if (n.includes('tablet') || n.includes('ipad')) {
    return {
      bgGradient: 'from-sky-50 via-indigo-50/50 to-blue-50',
      iconColor: 'text-sky-600',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
      borderColor: 'group-hover:border-sky-400',
      glowColor: 'group-hover:shadow-sky-500/15',
    };
  }

  // Audio & Headphones
  if (n.includes('audio') || n.includes('headphone') || n.includes('speaker') || n.includes('earphone')) {
    return {
      bgGradient: 'from-rose-50 via-red-50/50 to-pink-50',
      iconColor: 'text-rose-600',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      borderColor: 'group-hover:border-rose-400',
      glowColor: 'group-hover:shadow-rose-500/15',
    };
  }

  // Cameras & Photography
  if (n.includes('camera') || n.includes('photo') || n.includes('lens')) {
    return {
      bgGradient: 'from-amber-50 via-yellow-50/50 to-orange-50',
      iconColor: 'text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      borderColor: 'group-hover:border-amber-400',
      glowColor: 'group-hover:shadow-amber-500/15',
    };
  }

  // Wearables & Smartwatches
  if (n.includes('wearable')) {
    return {
      bgGradient: 'from-emerald-50 via-teal-50/50 to-cyan-50',
      iconColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      borderColor: 'group-hover:border-emerald-400',
      glowColor: 'group-hover:shadow-emerald-500/15',
    };
  }

  // Electronics General
  if (n.includes('electronic') || n.includes('gadget') || n.includes('tech')) {
    return {
      bgGradient: 'from-blue-50 via-cyan-50/60 to-indigo-50',
      iconColor: 'text-[#0284C7]',
      badgeBg: 'bg-blue-50 text-[#0284C7] border-blue-200',
      borderColor: 'group-hover:border-[#0284C7]',
      glowColor: 'group-hover:shadow-blue-500/15',
    };
  }

  // Furniture & Sofa
  if (n.includes('furni') || n.includes('sofa') || n.includes('chair') || n.includes('table')) {
    return {
      bgGradient: 'from-amber-50 via-yellow-50/50 to-stone-100',
      iconColor: 'text-amber-800',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      borderColor: 'group-hover:border-amber-500',
      glowColor: 'group-hover:shadow-amber-500/15',
    };
  }

  // Kitchen Appliances
  if (n.includes('kitchen') || n.includes('cook') || n.includes('appliance')) {
    return {
      bgGradient: 'from-teal-50 via-emerald-50/50 to-cyan-50',
      iconColor: 'text-teal-700',
      badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
      borderColor: 'group-hover:border-teal-400',
      glowColor: 'group-hover:shadow-teal-500/15',
    };
  }

  // Bedding
  if (n.includes('bed') || n.includes('pillow') || n.includes('quilt')) {
    return {
      bgGradient: 'from-indigo-50 via-blue-50/50 to-slate-50',
      iconColor: 'text-indigo-600',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      borderColor: 'group-hover:border-indigo-400',
      glowColor: 'group-hover:shadow-indigo-500/15',
    };
  }

  // Lighting
  if (n.includes('light') || n.includes('lamp')) {
    return {
      bgGradient: 'from-yellow-50 via-amber-50/60 to-orange-50',
      iconColor: 'text-amber-500',
      badgeBg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      borderColor: 'group-hover:border-yellow-400',
      glowColor: 'group-hover:shadow-yellow-500/15',
    };
  }

  // Home & Living General
  if (n.includes('home') || n.includes('living')) {
    return {
      bgGradient: 'from-amber-50 via-orange-50/50 to-stone-100',
      iconColor: 'text-amber-700',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      borderColor: 'group-hover:border-amber-400',
      glowColor: 'group-hover:shadow-amber-500/15',
    };
  }

  // Beauty, Skincare & Fragrances
  if (n.includes('skin') || n.includes('beauty') || n.includes('cosmetic') || n.includes('fragrance') || n.includes('makeup') || n.includes('hair')) {
    return {
      bgGradient: 'from-pink-50 via-rose-50/60 to-purple-50',
      iconColor: 'text-pink-600',
      badgeBg: 'bg-pink-50 text-pink-700 border-pink-200',
      borderColor: 'group-hover:border-pink-400',
      glowColor: 'group-hover:shadow-pink-500/15',
    };
  }

  // Sports, Fitness, Cycling, Camping
  if (n.includes('sport') || n.includes('fit') || n.includes('cycl') || n.includes('camp') || n.includes('outdoor')) {
    return {
      bgGradient: 'from-emerald-50 via-teal-50/60 to-green-50',
      iconColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      borderColor: 'group-hover:border-emerald-400',
      glowColor: 'group-hover:shadow-emerald-500/15',
    };
  }

  // Toys & Games
  if (n.includes('toy') || n.includes('game') || n.includes('figure') || n.includes('action')) {
    return {
      bgGradient: 'from-violet-50 via-purple-50/60 to-indigo-50',
      iconColor: 'text-violet-600',
      badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
      borderColor: 'group-hover:border-violet-400',
      glowColor: 'group-hover:shadow-violet-500/15',
    };
  }

  // Default
  return {
    bgGradient: 'from-slate-50 via-blue-50/40 to-slate-100',
    iconColor: 'text-slate-600',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    borderColor: 'group-hover:border-primary',
    glowColor: 'group-hover:shadow-primary/10',
  };
};

export const CategoryIcon: React.FC<{ name: string; className?: string }> = ({ name, className = 'w-7 h-7' }) => {
  const n = name.toLowerCase();

  // 1. Mens Clothing (Clean, premium polo shirt / folded dress shirt with collar)
  if (n.includes('men') && (n.includes('cloth') || n.includes('fashion') || n.includes('wear') || n.includes('shirt'))) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Collar & Polo Shirt Design */}
        <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a2 2 0 0 0 1.5 1.62l2.64.6V20a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-8.62l2.64-.6a2 2 0 0 0 1.5-1.62l.58-3.47a2 2 0 0 0-1.34-2.23z" />
        <path d="M12 6.5v6" />
        <path d="M8 2l4 4.5 4-4.5" />
      </svg>
    );
  }

  // 2. Womens Clothing (Elegant dress / feminine garment)
  if (n.includes('women') && (n.includes('cloth') || n.includes('fashion') || n.includes('wear'))) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6l1 4-2 3 5 11H5l5-11-2-3 1-4z" />
        <path d="M9 3a3 3 0 0 0 6 0" />
        <path d="M7.5 14h9" />
      </svg>
    );
  }

  // 3. Kids Clothing (Cute kid outfit / romper with star)
  if (n.includes('kid') || n.includes('baby') || n.includes('children')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6l2 3-1 3-2 1v11a1 1 0 0 1-1 1h-2v-4h-2v4H7a1 1 0 0 1-1-1V10L4 9l2-3 3-3z" />
        <path d="M10 3a2 2 0 0 0 4 0" />
        <circle cx="12" cy="11" r="1" fill="currentColor" />
      </svg>
    );
  }

  // 4. Shoes (Athletic sneaker / shoe profile)
  if (n.includes('shoe') || n.includes('sneaker') || n.includes('footwear')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 17h19a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-19a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" />
        <path d="M3.5 17c.5-4 2-7 5.5-8l4.5 3h6.5c1 0 2 1.5 2 4v1H3.5z" />
        <path d="M9 9l3 3" />
        <path d="M12 9l2 3" />
      </svg>
    );
  }

  // 5. Accessories (Luxury wristwatch / handbag)
  if (n.includes('accessor') || n.includes('jewel') || n.includes('bag') || n.includes('watch')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="7" width="12" height="10" rx="3" />
        <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
        <path d="M9 17v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M12 11v1l.8.5" />
      </svg>
    );
  }

  // 6. Fashion General (Designer clothes hanger with tag)
  if (n.includes('fashion') || n.includes('cloth') || n.includes('apparel')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4a2 2 0 0 1 2 2c0 1.5-1.5 2-2 3l-8.5 7.5a1.5 1.5 0 0 0 1 2.5h15a1.5 1.5 0 0 0 1-2.5L12 9" />
        <path d="M4 19h16" />
      </svg>
    );
  }

  // 7. Smartphones (Modern edge-to-edge smartphone)
  if (n.includes('smart') || n.includes('phone') || n.includes('mobile')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="2" width="12" height="20" rx="3" />
        <path d="M11 5h2" />
        <circle cx="12" cy="18" r="1" fill="currentColor" />
      </svg>
    );
  }

  // 8. Laptops (Sleek open laptop)
  if (n.includes('laptop') || n.includes('computer') || n.includes('pc') || n.includes('mac')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="11" rx="2" />
        <path d="M2 19h20a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1z" />
        <path d="M10 16h4" />
      </svg>
    );
  }

  // 9. Tablets (Modern tablet)
  if (n.includes('tablet') || n.includes('ipad')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="3" />
        <circle cx="12" cy="18" r="1" fill="currentColor" />
      </svg>
    );
  }

  // 10. Audio & Headphones (High-fidelity over-ear headphones)
  if (n.includes('audio') || n.includes('headphone') || n.includes('speaker') || n.includes('earphone')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 14v4a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H4a1 1 0 0 0-1 1z" />
        <path d="M21 14v4a3 3 0 0 1-3 3h-1a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h3a1 1 0 0 1 1 1z" />
        <path d="M3 14v-3a9 9 0 0 1 18 0v3" />
      </svg>
    );
  }

  // 11. Cameras (DSLR camera with lens)
  if (n.includes('camera') || n.includes('photo') || n.includes('lens')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z" />
        <circle cx="12" cy="14" r="4" />
        <circle cx="12" cy="14" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  // 12. Wearables (Smartwatch with strap)
  if (n.includes('wearable')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="7" y="6" width="10" height="12" rx="3" />
        <path d="M9 6V2h6v4" />
        <path d="M9 18v4h6v-4" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  }

  // 13. Electronics General (Chip / monitor / hardware)
  if (n.includes('electronic') || n.includes('gadget') || n.includes('tech')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="14" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 8h2" />
        <path d="M7 11h5" />
      </svg>
    );
  }

  // 14. Furniture (Comfortable modern armchair)
  if (n.includes('furni') || n.includes('sofa') || n.includes('chair') || n.includes('table')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 11V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4" />
        <path d="M3 13a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4z" />
        <path d="M6 19v3" />
        <path d="M18 19v3" />
      </svg>
    );
  }

  // 15. Kitchen Appliances (Coffee maker / blender)
  if (n.includes('kitchen') || n.includes('cook') || n.includes('appliance')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h12l-1.5 10H7.5L6 4z" />
        <path d="M10 2h4" />
        <path d="M7 18h10a1 1 0 0 1 1 1v2H6v-2a1 1 0 0 1 1-1z" />
        <circle cx="12" cy="19.5" r="0.8" fill="currentColor" />
        <path d="M16.5 6H19a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1.5" />
      </svg>
    );
  }

  // 16. Bedding (Cozy bed with pillows)
  if (n.includes('bed') || n.includes('pillow') || n.includes('quilt')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7v13" />
        <path d="M21 7v13" />
        <path d="M3 14h18" />
        <path d="M3 11a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v3H3v-3z" />
        <rect x="6" y="9" width="4" height="3" rx="1" />
        <rect x="14" y="9" width="4" height="3" rx="1" />
      </svg>
    );
  }

  // 17. Lighting (Designer pendant ceiling lamp)
  if (n.includes('light') || n.includes('lamp')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v5" />
        <path d="M7 12a5 5 0 0 1 10 0H7z" />
        <path d="M10 15h4" />
        <path d="M11 17h2" />
        <path d="M4 18l2-2" />
        <path d="M20 18l-2-2" />
      </svg>
    );
  }

  // 18. Home & Living General (Modern home living)
  if (n.includes('home') || n.includes('living')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5L12 3l9 7.5" />
        <path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
        <path d="M9 21v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6" />
      </svg>
    );
  }

  // 19. Skincare & Beauty (Serum dropper bottle with sparkles)
  if (n.includes('skin') || n.includes('beauty') || n.includes('cosmetic')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 7h4v13a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2V7z" />
        <path d="M9 4h6v3H9V4z" />
        <path d="M11 2h2v2h-2V2z" />
        <path d="M19 6l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
      </svg>
    );
  }

  // 20. Makeup & Cosmetics (Lipstick and palette)
  if (n.includes('makeup')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="7" y="11" width="6" height="10" rx="1" />
        <path d="M8 11V7l4-3v7H8z" />
        <path d="M16 9v12" />
        <circle cx="16.5" cy="7" r="1.5" />
      </svg>
    );
  }

  // 21. Haircare (Hair dryer & comb)
  if (n.includes('hair')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6a4 4 0 0 0-4-4H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h8a4 4 0 0 0 4-4z" />
        <path d="M10 10v7a2 2 0 0 0 2 2h1" />
        <path d="M21 5v2" />
      </svg>
    );
  }

  // 22. Fragrances (Luxury perfume spray bottle)
  if (n.includes('fragrance') || n.includes('perfume')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="8" width="12" height="13" rx="2" />
        <path d="M10 5h4v3h-4V5z" />
        <path d="M12 2v3" />
        <circle cx="12" cy="14" r="2.5" />
        <path d="M17 3l2-1" />
      </svg>
    );
  }

  // 23. Fitness & Gym Equipment (Dumbbell weights)
  if (n.includes('fit') || n.includes('equipment') || n.includes('gym')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 5v14" />
        <path d="M3 8v8" />
        <path d="M18 5v14" />
        <path d="M21 8v8" />
        <path d="M6 12h12" />
      </svg>
    );
  }

  // 24. Cycling (Road bicycle)
  if (n.includes('cycl') || n.includes('bike')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5.5" cy="16.5" r="3.5" />
        <circle cx="18.5" cy="16.5" r="3.5" />
        <path d="M12 16.5l-3.5-7h4l3.5 7" />
        <path d="M5.5 16.5l5-7 6 7" />
        <path d="M17 9.5h2" />
      </svg>
    );
  }

  // 25. Camping & Outdoors (Camping tent under night sky)
  if (n.includes('camp') || n.includes('outdoor')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3L2 20h20L12 3z" />
        <path d="M12 3v17" />
        <path d="M8.5 20l3.5-7 3.5 7" />
      </svg>
    );
  }

  // 26. Sports General (Athletic trophy / sports ball)
  if (n.includes('sport')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
        <path d="M7 6H4a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4h1" />
        <path d="M17 6h3a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4h-1" />
      </svg>
    );
  }

  // 27. Toys & Games (Console gamepad)
  if (n.includes('toy') || n.includes('game')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="4" />
        <path d="M6 12h4" />
        <path d="M8 10v4" />
        <circle cx="15.5" cy="10.5" r="1" fill="currentColor" />
        <circle cx="17.5" cy="13.5" r="1" fill="currentColor" />
      </svg>
    );
  }

  // 28. Action Figures (Heroic robot / figurine)
  if (n.includes('figure') || n.includes('action')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2.5" />
        <path d="M8 9h8l1 6-2 1v6h-2v-5h-2v5H9v-6L7 15l1-6z" />
      </svg>
    );
  }

  // 29. Default fallback (Modern shopping collection badge)
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
};
