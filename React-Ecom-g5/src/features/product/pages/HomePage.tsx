import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { ProductCard } from '../../../components/product/ProductCard';
import type { BrandResponse } from '../api/productApi';
import type { CategoryNodeResponse, ProductListResponse } from '../types';
import heroImg from '../../../assets/hero.png';


const getCategoryStyle = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('fashion') || n.includes('cloth') || n.includes('shirt')) return { bg: 'bg-[#FFE4EC]', text: 'text-[#FF2B6D]' };
  if (n.includes('electronic') || n.includes('laptop') || n.includes('computer')) return { bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]' };
  if (n.includes('skin') || n.includes('beauty')) return { bg: 'bg-[#FFEDD5]', text: 'text-[#EA580C]' };
  if (n.includes('home') || n.includes('furni')) return { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]' };
  if (n.includes('sport') || n.includes('fit')) return { bg: 'bg-[#D1FAE5]', text: 'text-[#059669]' };
  return { bg: 'bg-[#F3E8FF]', text: 'text-[#7C3AED]' };
};

const CategoryIcon = ({ name }: { name: string }) => {
  const n = name.toLowerCase();
  const style = getCategoryStyle(name);
  let path = "M4 6a2 2 0 012-2h2.5l2 2H18a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"; // default folder
  if (n.includes('electronic') || n.includes('laptop') || n.includes('computer')) path = "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z";
  else if (n.includes('fashion') || n.includes('clothing') || n.includes('shirt')) path = "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z";
  else if (n.includes('home') || n.includes('furniture')) path = "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6";
  else if (n.includes('sport') || n.includes('fitness')) path = "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z";
  else if (n.includes('accessory') || n.includes('bag') || n.includes('jewelry')) path = "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z";
  else if (n.includes('audio') || n.includes('headphone')) path = "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a7 7 0 0114 0v10a2 2 0 01-2 2h-2a2 2 0 01-2-2v-6a2 2 0 012-2h2a2 2 0 012 2v6";
  
  return (
    <svg className={`w-8 h-8 ${style.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={path} />
    </svg>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryNodeResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [trending, setTrending] = useState<ProductListResponse[]>([]);
  const [bestSellers, setBestSellers] = useState<ProductListResponse[]>([]);

  useEffect(() => {
    productApi.getCategoryTree().then(setCategories).catch(console.error);
    productApi.getActiveBrands().then(setBrands).catch(console.error);
    productApi.getProducts({ tags: ['TRENDING'], size: 4 }).then(res => setTrending(res.content)).catch(console.error);
    productApi.getBestSellers().then(res => setBestSellers(res.content)).catch(console.error);
  }, []);

  const routeProducts = (params?: Record<string, any>) => {
    const q = new URLSearchParams(params).toString();
    navigate(`/products${q ? '?' + q : ''}`);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden h-80 mb-10 flex items-center bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] shadow-md group">
        <img src={heroImg} className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
        <div className="relative z-10 px-12 text-white max-w-2xl">
          <div className="text-accent font-black tracking-wider text-xs mb-3 bg-black/20 inline-block px-3 py-1 rounded-full backdrop-blur-xs">6SYNC COLLECTION</div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4 drop-shadow-sm">Discover Products<br/>Made for Your Day.</h1>
          <p className="text-white/95 mb-6 text-sm sm:text-base font-medium">Discover products by category and brand, then compare variants and live available stock.</p>
          <button onClick={() => routeProducts()} className="bg-primary text-white px-7 py-3 text-sm font-bold rounded-lg shadow-lg hover:bg-primary-hover transition-all transform hover:-translate-y-0.5">SHOP NOW</button>
        </div>
        
        {/* Slider Controls */}
        <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <span className="w-2 h-2 rounded-full bg-white"></span>
          <span className="w-2 h-2 rounded-full bg-white/40"></span>
          <span className="w-2 h-2 rounded-full bg-white/40"></span>
        </div>
      </div>

      {/* Categories */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-bold">Browse Categories</h2>
            <div className="text-sm text-gray-500">Choose a department and open its dedicated product page.</div>
          </div>
          <Link to="/categories" className="text-sm text-primary font-bold hover:underline">VIEW ALL CATEGORIES &rarr;</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map(c => {
            const style = getCategoryStyle(c.categoryName);
            return (
              <div key={c.categoryId} onClick={() => navigate(`/categories/${c.categoryId}`)} className="bg-white border border-border-subtle rounded-xl p-5 text-center cursor-pointer hover:-translate-y-1 hover:border-primary hover:shadow-md transition-all">
                <div className={`w-[76px] h-[76px] mx-auto ${style.bg} rounded-full flex items-center justify-center mb-3 shadow-xs`}><CategoryIcon name={c.categoryName} /></div>
                <b className="text-sm block text-text-main">{c.categoryName}</b>
              </div>
            );
          })}
        </div>
      </section>

      {/* Brands */}
      <section className="mb-12">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Shop by Brand</h2>
          <div className="text-sm text-gray-500">Explore a brand in its own storefront page.</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.map(b => (
            <div key={b.brandId} onClick={() => navigate(`/brands/${b.brandId}`)} className="bg-white border border-border-subtle rounded-xl p-5 text-center cursor-pointer hover:-translate-y-1 hover:border-primary hover:shadow-md transition-all">
              <div className="w-[76px] h-[76px] mx-auto border border-border-subtle bg-accent-soft rounded-full flex items-center justify-center font-black text-xs mb-3 overflow-hidden shadow-xs">
                {b.brandLogoUrl ? <img src={b.brandLogoUrl} className="w-full h-full object-contain" /> : b.brandName}
              </div>
              <b className="text-sm block text-text-main">{b.brandName}</b>
            </div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-1">Trending Now</h2>
        <div className="text-sm text-gray-500 mb-4">Products connected to the trending tag.</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trending.map(p => <ProductCard key={p.productId} product={p} />)}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-1">Best Seller</h2>
        <div className="text-sm text-gray-500 mb-4">Top-selling products.</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map(p => <ProductCard key={p.productId} product={p} />)}
        </div>
      </section>
    </main>
  );
};

