/**
 * Home Page Banner Configuration
 * -------------------------------------------------------------
 * 🖼️ Banner ပုံများ ထည့်သွင်းသိမ်းဆည်းနည်း (How to add & manage banner images):
 * 
 * ၁။ Banner ပုံအသစ်များကို အလျား/အနံ အချိုးညီ (Aspect Ratio ~ 1920x720 သို့မဟုတ် 16:6)
 *     အရည်အသွေးမြင့် PNG/WebP ပုံများအဖြစ် `public/banners/` folder ထဲသို့ ကူးထည့်ပါ။
 *     ဥပမာ - `public/banners/my-banner.png`
 * 
 * ၂။ အောက်ပါ `defaultHeroBanners` စာရင်းထဲတွင် ပုံအသစ်အတွက် object တစ်ခုတိုးပေးရုံပါပဲ:
 *     {
 *       id: 6,
 *       badge: 'NEW ARRIVAL',
 *       title: 'Banner ခေါင်းစဉ်',
 *       subtitle: 'Banner စာသားအညွှန်း',
 *       imageUrl: '/banners/my-banner.png',
 *       linkUrl: '/products',
 *       btnText: 'SHOP NOW',
 *       showText: true, // ပုံပေါ်တွင် စာသား/Button မပြလိုပါက false ထားပါ
 *       objectFit: 'cover',
 *     }
 * 
 * ၃။ ပုံပေါ်တွင် စာသားနှင့် Button ပါပြီးသား ဒီဇိုင်းပုံဖြစ်ပါက `showText: false` ဟု သတ်မှတ်ပေးပါ။
 */

export interface BannerSlideItem {
  id: number;
  badge?: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl: string;
  btnText?: string;
  /** စာသားနှင့် Button overlay ပြလိုခြင်း ရှိ/မရှိ (ပုံထဲတွင် စာပါပြီးသားဖြစ်လျှင် false ထားပါ) */
  showText?: boolean;
  /** ပုံအချိုးအစား မတူပါက ဘောင်ကျဉ်း/ကျယ် လိုက်ဖက်အောင် ထိန်းညှိပေးခြင်း ('cover' အကြံပြုပါသည်) */
  objectFit?: 'contain' | 'cover';
}

export interface PromoBannerConfig {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  btnText: string;
}

// 🌟 ထိပ်ဆုံး Hero Banner Slider တွင် ပြသမည့် ပုံများ (၅ စက္ကန့်တစ်ခါ အလိုအလျောက် လှည့်လည်ပါမည်)
export const defaultHeroBanners: BannerSlideItem[] = [
  {
    id: 1,
    badge: 'PHONES & LAPTOPS',
    title: 'Flagship Phones & Laptops',
    subtitle: 'Mega Tech Sale | Save up to 35% on latest smartphones, ultrabooks & gear.',
    imageUrl: '/banners/banner-tech.png',
    linkUrl: '/products',
    btnText: 'SHOP NOW',
    showText: false,
    objectFit: 'cover',
  },
  {
    id: 2,
    badge: 'COLD DRINKS & SNACKS',
    title: 'Refreshing Drinks & Snacks',
    subtitle: 'Summer Treats | Up to 30% off ice-cold beverages, artisan chips & gourmet treats.',
    imageUrl: '/banners/banner-drinks-snacks.png',
    linkUrl: '/products',
    btnText: 'ORDER NOW',
    showText: false,
    objectFit: 'cover',
  },
  {
    id: 3,
    badge: 'FASHION & APPAREL',
    title: 'Trendy Fashion & Apparel',
    subtitle: 'New Season Deals | Up to 40% off premium streetwear, jackets, sneakers & apparel.',
    imageUrl: '/banners/banner-fashion.png',
    linkUrl: '/products',
    btnText: 'VIEW COLLECTION',
    showText: false,
    objectFit: 'cover',
  },
  {
    id: 4,
    badge: 'WATCHES & PERFUMES',
    title: 'Luxury Watches & Perfumes',
    subtitle: 'Exclusive Fragrances & Timepieces | Up to 35% off luxury chronographs & designer perfumes.',
    imageUrl: '/banners/banner-luxury.png',
    linkUrl: '/products',
    btnText: 'SHOP LUXURY',
    showText: false,
    objectFit: 'cover',
  },
  {
    id: 5,
    badge: 'OPPO OFFICIAL',
    title: 'OPPO 7.7 Mid Year Sale',
    subtitle: 'Get offers up to RM2,396 on OPPO Pad, Reno Series, OPPO Watch & Enco Buds.',
    imageUrl: '/banners/banner-oppo.png',
    linkUrl: '/products',
    btnText: 'SHOP NOW',
    showText: false,
    objectFit: 'cover',
  },
];

// 🎁 Category အောက်တွင် ထုတ်ကုန်များနှင့် တွဲဖက်ပြသမည့် Promo Banner (ဒုတိယမြောက် Banner)
export const defaultPromoBanner: PromoBannerConfig = {
  badge: 'FEATURED PICK',
  title: 'Special Highlight',
  subtitle: 'Handpicked Deals & Trending Items',
  description: 'Discover our specially selected items tailored for you with exclusive prices and fast nationwide delivery.',
  imageUrl: '/banners/promo-banner.svg',
  linkUrl: '/products',
  btnText: 'EXPLORE ALL PRODUCTS',
};
