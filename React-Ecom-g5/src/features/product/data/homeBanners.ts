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
// 📸 Backoffice Default Categories (Clothing, Footwear, Cosmetics, Beverages, Electronics) နှင့် သက်ဆိုင်သော Authentic Real Product Photography Banners
export const defaultHeroBanners: BannerSlideItem[] = [
  {
    id: 1,
    badge: 'FASHION & DENIM',
    title: 'Clothing & Denim Essentials',
    subtitle: 'Curated modern tops, stylish denim jeans and trousers',
    imageUrl: '/banners/fashion-banner.jpg.jpg',
    linkUrl: '/products',
    btnText: 'SHOP NOW',
    showText: true,
    objectFit: 'cover',
  },
  {
    id: 2,
    badge: 'PREMIUM FOOTWEAR',
    title: 'Athletic & Sneakers',
    subtitle: 'High-performance running shoes and sneaker.',
    imageUrl: '/banners/banner-footwear-real.jpg',
    linkUrl: '/products',
    btnText: 'SHOP NOW',
    showText: true,
    objectFit: 'cover',
  },
  {
    id: 3,
    badge: 'BEAUTY & SKINCARE',
    title: 'Cosmetics',
    subtitle: 'Pure active serums, makeup palettes, and personal beauty care.',
    imageUrl: '/banners/banner-skincare-3products.jpg',
    linkUrl: '/products',
    btnText: 'SHOP NOW',
    showText: true,
    objectFit: 'cover',
  },
  {
    id: 4,
    badge: 'CHILLED & REFRESHING',
    title: 'Beverages & Cold Drinks',
    subtitle: 'Refreshing chilled fruit blends and sparkling beverages.',
    imageUrl: '/banners/Beverages-banner.jpg.jpg',
    linkUrl: '/products',
    btnText: 'SHOP NOW',
    showText: true,
    objectFit: 'cover',
  },
  {
    id: 5,
    badge: 'SMART ELECTRONICS',
    title: 'Premium & Smart Tech',
    subtitle: 'High-fidelity audio, modern devices and hardware essentials.',
    imageUrl: '/banners/banner-gaming-3products.jpg',
    linkUrl: '/products',
    btnText: 'SHOP NOW',
    showText: true,
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
