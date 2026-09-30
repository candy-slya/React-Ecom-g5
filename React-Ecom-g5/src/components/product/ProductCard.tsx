import { useNavigate } from 'react-router-dom';
import type { ProductListResponse } from '../../features/product/types';

export const ProductCard = ({ product }: { product: ProductListResponse }) => {
  const navigate = useNavigate();
  return (
    <article className="bg-white border border-border-subtle rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:border-primary hover:shadow-md transition-all flex flex-col group" onClick={() => navigate(`/products/${product.productId}`)}>
      <div className="relative h-[235px] bg-slate-50 overflow-hidden flex-shrink-0">
        {product.tags?.includes('TRENDING') && <span className="absolute left-[9px] top-[9px] bg-accent text-slate-950 text-[10px] font-black px-2.5 py-1 z-10 rounded shadow-xs">TRENDING</span>}
        {product.stockStatus === 'SOLD_OUT' && <span className="absolute right-[9px] top-[9px] bg-slate-800 text-white text-[10px] font-black px-2.5 py-1 z-10 rounded">SOLD OUT</span>}
        {product.primaryImageUrl && <img src={product.primaryImageUrl} className="w-full h-full object-cover transition-transform duration-250 group-hover:scale-105" />}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{product.brandName} &middot; {product.categoryName}</div>
        <div className="font-bold text-[15px] my-1.5 flex-1 text-text-main line-clamp-2">{product.productName}</div>
        <div className="text-primary font-black text-[16px]">{product.startingPrice ? `From ${product.startingPrice} MMK` : 'Price Varies'}</div>
        <div className="mt-2.5 flex">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${product.stockStatus === 'IN_STOCK' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
            {product.stockStatus === 'IN_STOCK' ? 'In Stock' : 'Sold Out'}
          </span>
        </div>
      </div>
    </article>
  );
};
