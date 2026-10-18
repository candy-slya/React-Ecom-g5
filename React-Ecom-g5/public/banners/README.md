# 🖼️ E-Commerce Banner Images Folder (`public/banners/`)

ဒီ Folder သည် Home page တွင် ပြသမည့် Banner ပုံများကို လာရောက်သိမ်းဆည်းရန် နေရာဖြစ်ပါသည်။

---

## 📌 Banner ပုံ အသစ် ထည့်သွင်းနည်း (How to Add New Banners)

1. **မိမိထည့်သွင်းလိုသော ပုံများ** (`.png`, `.jpg`, `.jpeg`, `.webp`) ကို ဤ `public/banners/` folder ထဲသို့ ကူးထည့် (Copy & Paste) ပါ။
   * ဥပမာ - `my-new-banner.png`
   * အကြံပြုထားသော ပုံအရွယ်အစား Aspect Ratio: `16:9` သို့မဟုတ် `21:9` (ဥပမာ: `1200x480px`, `1920x800px` သို့မဟုတ် `1024x384px`)

2. **`src/features/product/data/homeBanners.ts`** ဖိုင်ကို ဖွင့်ပြီး စာရင်းထဲတွင် ပုံနာမည်ကို ထည့်ပေးပါ:
   ```ts
   {
     id: 5,
     title: 'My Custom Promotion',
     imageUrl: '/banners/my-new-banner.png',
     linkUrl: '/products',
     showText: false,        // ပုံထဲမှာ စာသားပါပြီးသားဖြစ်ပါက false ထားပါ
     objectFit: 'contain',   // ပုံအချိုးအစား မတူညီပါက ပုံအပြည့်ပေါ်စေရန် contain ထားပါ
   }
   ```

---

## 🎨 လက်ရှိ အသုံးပြုထားသော Banner ပုံများ (Current Active Banners)
- `banner-tech.png` : Flagship Phones & Laptops Mega Sale (1920x1080 Full HD PNG)
- `banner-drinks-snacks.png` : Refreshing Cold Drinks & Gourmet Snacks (1920x1080 Full HD PNG)
- `banner-fashion.png` : Trendy Fashion & Apparel Collection (1920x1080 Full HD PNG)
- `banner-luxury.png` : Luxury Chronograph Watches & Designer Perfumes (1920x1080 Full HD PNG)
- `banner-oppo.png` : OPPO 7.7 Mid Year Sale Promo (1920x1080 Full HD PNG)

> **မှတ်ချက်:** Banner ပုံအားလုံးသည် တူညီသော Full HD Resolution (`1920 x 1080`, 16:9 Aspect Ratio) နှင့် Crystal-Clear Lossless PNG Format များဖြင့် စနစ်တကျ အချိုးညီထားရှိထားသောကြောင့် ကြီးမားသော Desktop Monitor များတွင်ပါ လုံးဝ ဝါးသွားခြင်းမရှိဘဲ အလွန်ပြတ်သားစွာ ပေါ်လွင်ပါသည်။
