import { useNavigate } from 'react-router-dom';
import type { ProductListResponse } from '../../features/product/types';

export const ProductCard = ({ product }: { product: ProductListResponse }) => {
  const navigate = useNavigate();
  return (
    <article className="bg-white border border-border-subtle cursor-pointer hover:-translate-y-[3px] hover:shadow-[0_9px_24px_#00000010] transition-all flex flex-col group" onClick={() => navigate(`/products/${product.productId}`)}>
      <div className="relative h-[235px] bg-[#eee] overflow-hidden flex-shrink-0">
        {product.tags?.includes('TRENDING') && <span className="absolute left-[9px] top-[9px] bg-accent text-[10px] font-black px-2 py-1 z-10">TRENDING</span>}
        {product.stockStatus === 'SOLD_OUT' && <span className="absolute right-[9px] top-[9px] bg-[#333] text-white text-[10px] font-black px-2 py-1 z-10">SOLD OUT</span>}
        {product.primaryImageUrl && <img src={product.primaryImageUrl} className="w-full h-full object-cover transition-transform duration-250 group-hover:scale-105" />}
      </div>
      <div className="p-[15px] flex-1 flex flex-col">
        <div className="text-[10px] text-text-muted uppercase">{product.brandName} &middot; {product.categoryName}</div>
        <div className="font-[800] text-[15px] my-[7px] flex-1">{product.productName}</div>
        <div className="text-primary font-[900] text-[15px]">{product.startingPrice ? `From ${product.startingPrice} MMK` : 'Price Varies'}</div>
        <div className="mt-2 flex">
          <span className={`text-[10px] font-bold px-2 py-1 rounded ${product.stockStatus === 'IN_STOCK' ? 'bg-accent-soft text-emerald-900' : 'bg-red-100 text-red-800'}`}>
            {product.stockStatus === 'IN_STOCK' ? 'In Stock' : 'Sold Out'}
          </span>
        </div>
      </div>
    </article>
  );
};
