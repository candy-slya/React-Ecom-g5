import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProductListResponse } from '../../features/product/types';
import { getAssetUrl } from '../../utils/assetUtils';

export const ProductCard = ({ product }: { product: ProductListResponse }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const imageUrl = getAssetUrl(product.primaryImageUrl);
  const hasImage = Boolean(imageUrl) && !imageError;

  // ငွေကြေးပမာဏကို ကော်မာ (Comma) ပါအောင် ပြင်ဆင်ခြင်း
  const formattedPrice = product.startingPrice?.toLocaleString();

  return (
    <article 
      className="group bg-white p-3 sm:p-4 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 flex flex-col" 
      onClick={() => navigate(`/products/${product.productId}`)}
    >
      {/* Image Container (ဘောင်အဝိုင်းပုံစံ) */}
      <div className="relative aspect-square w-full rounded-[24px] bg-slate-50 overflow-hidden flex-shrink-0">
        
        {/* Badges Container */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
          {product.tags?.includes('TRENDING') ? (
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wide">
              TRENDING
            </span>
          ) : <div />}
          
          {product.stockStatus === 'SOLD_OUT' && (
            <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wide">
              SOLD OUT
            </span>
          )}
        </div>

        {hasImage ? (
          <img
            src={imageUrl}
            alt={product.productName}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
            <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">No Image</span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>

      {/* Content Container (မူလ စာသား Layout အတိုင်း) */}
      <div className="pt-4 px-1 pb-1 flex-1 flex flex-col">
        {/* Brand & Category */}
        <div className="flex items-center gap-1.5 mb-2 text-[11px] uppercase tracking-wider">
          <span className="font-semibold text-slate-500">{product.brandName}</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span className="font-medium text-slate-400">{product.categoryName}</span>
        </div>
        
        {/* Product Name */}
        <h3 className="font-semibold text-[16px] leading-snug mb-3 flex-1 text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {product.productName}
        </h3>
        
        {/* Price & Stock Status (Bottom Layout) */}
        <div className="flex items-end justify-between mt-auto">
  <div>
    <div className="text-[11px] text-slate-400 mb-0.5 font-medium">Price</div>
    <div className="text-red-600 font-bold text-[17px]">
      {product.startingPrice ? `${formattedPrice} MMK` : 'Price Varies'}
    </div>
  </div>
  
  <span className={`text-[10px] text-white font-bold px-2.5 py-1 rounded-full transition-colors ${
    product.stockStatus === 'IN_STOCK' 
      ? 'bg-emerald-500' 
      : 'bg-rose-500'
  }`}>
    {product.stockStatus === 'IN_STOCK' ? 'In Stock' : 'Sold Out'}
  </span>
</div>
      </div>
    </article>
  );
};