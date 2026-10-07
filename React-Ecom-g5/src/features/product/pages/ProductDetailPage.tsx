import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import type { ProductDetailResponse, ProductListResponse, ProductVariantResponse } from '../types';
import { useDispatch } from 'react-redux';
import { addGuestItem, addAuthenticatedCartItem, fetchAuthenticatedCart } from '../../cart/store/cartSlice';
import { useAppSelector } from '../../../hooks/useAppSelector';
import type { AppDispatch } from '../../../app/store';
import { getAssetUrl } from '../../../utils/assetUtils';

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);

  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [related, setRelated] = useState<ProductListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantResponse | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [toastMsg, setToastMsg] = useState('');
  const [isAddingCart, setIsAddingCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    productApi.getProductDetail(Number(productId)).then(res => {
      setProduct(res);
      setSelectedVariant(res.variants[0] || null);
      const rawImg = res.images.find(img => img.isPrimary)?.imageUrl || res.images[0]?.imageUrl || null;
      setActiveImage(rawImg ? getAssetUrl(rawImg) : null);
      setQuantity(1);
      setLoading(false);
    }).catch((e) => {
      console.error(e);
      setLoading(false);
    });
    
    productApi.getRelatedProducts(Number(productId)).then(setRelated).catch(console.error);
  }, [productId]);

  if (loading) return <div className="p-12 text-center">Loading...</div>;
  if (!product) return <div className="p-12 text-center text-red-500">Product not found.</div>;

  const handleQty = (delta: number) => {
    if (!selectedVariant) return;
    const max = selectedVariant.availableQuantity;
    if (max <= 0) return;
    setQuantity(prev => Math.max(1, Math.min(max, prev + delta)));
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || selectedVariant.availableQuantity <= 0 || isAddingCart) return;
    
    const req = { variantId: selectedVariant.variantId, quantity };
    try {
      setIsAddingCart(true);
      if (isAuthenticated) {
        await dispatch(addAuthenticatedCartItem(req)).unwrap();
        await dispatch(fetchAuthenticatedCart());
      } else {
        dispatch(addGuestItem(req));
      }
      setToastMsg(`${quantity} x ${product.productName} added to cart!`);
      setTimeout(() => setToastMsg(''), 3000);
    } catch {
      alert('Failed to add to cart.');
    } finally {
      setIsAddingCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant || selectedVariant.availableQuantity <= 0 || isBuyingNow) return;

    const req = { variantId: selectedVariant.variantId, quantity };
    try {
      setIsBuyingNow(true);
      if (isAuthenticated) {
        await dispatch(addAuthenticatedCartItem(req)).unwrap();
        await dispatch(fetchAuthenticatedCart());
        navigate('/checkout');
      } else {
        dispatch(addGuestItem(req));
        navigate('/login?redirect=/checkout');
      }
    } catch {
      alert('Failed to process order checkout. Please try again.');
    } finally {
      setIsBuyingNow(false);
    }
  };

  const effectivePrice = selectedVariant ? (selectedVariant.discountPrice ?? selectedVariant.sellingPrice) : null;
  const inStock = selectedVariant ? selectedVariant.availableQuantity > 0 : false;

  return (
    <div className="bg-page min-h-screen pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/products" className="hover:underline">Products</Link> / {product.productName}
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 bg-white border p-6 rounded mb-8">
          {/* Gallery */}
          <div className="flex flex-col sm:flex-row gap-4 lg:w-1/2">
            <div className="flex sm:flex-col gap-2 overflow-auto sm:w-20">
              {product.images.map(img => {
                const fullUrl = getAssetUrl(img.imageUrl);
                return (
                  <div
                    key={img.imageId}
                    onClick={() => setActiveImage(fullUrl)}
                    className={`w-16 h-16 border cursor-pointer overflow-hidden flex items-center justify-center bg-gray-50 ${activeImage === fullUrl ? 'border-primary border-2' : ''}`}
                  >
                    <img
                      src={fullUrl}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-250 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex-1 bg-gray-100 aspect-square flex items-center justify-center overflow-hidden">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.productName}
                  className="w-full h-full object-contain"
                  onError={() => setActiveImage(null)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 opacity-60">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs mt-2 font-bold uppercase tracking-wider">No Image</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Details */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="text-[10px] text-text-muted uppercase">{product.brand?.brandName} &middot; {product.categoryName}</div>
            <h1 className="text-3xl font-bold my-2">{product.productName}</h1>
            <h2 className="text-2xl text-primary font-black mb-4">{effectivePrice ? `${effectivePrice} MMK` : 'N/A'}</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-page p-3 text-sm">SKU<br/><b>{selectedVariant?.sku}</b></div>
              <div className="bg-page p-3 text-sm">Available Stock<br/><b className={inStock ? 'text-emerald-900 bg-accent-soft px-2 py-0.5 rounded' : 'text-red-800 bg-red-100 px-2 py-0.5 rounded'}>{selectedVariant ? (inStock ? `${selectedVariant.availableQuantity} available` : 'Sold Out') : 'N/A'}</b></div>
            </div>
            
            <b className="mb-2 block text-sm">Select Variant</b>
            <div className="flex flex-wrap gap-2 mb-6">
              {product.variants.map(v => (
                <button key={v.variantId} onClick={() => { setSelectedVariant(v); setQuantity(1); }} className={`border px-3 py-2 text-sm ${selectedVariant?.variantId === v.variantId ? 'border-green-600 bg-green-50 font-bold border-2' : 'bg-white'}`}>
                  {v.options.slice(0,2).map(o => o.value).join(' / ') || 'Default'}
                </button>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-auto pt-4 border-t border-slate-100">
              {/* Quantity Selector */}
              <div className="flex border border-slate-200 bg-slate-50 h-12 rounded-xl overflow-hidden self-start sm:self-auto shadow-xs">
                <button
                  onClick={() => handleQty(-1)}
                  disabled={!inStock || quantity <= 1}
                  className="w-11 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40 transition-colors"
                >
                  &minus;
                </button>
                <div className="w-12 flex items-center justify-center font-bold text-slate-800 bg-white border-x border-slate-200 text-sm">
                  {quantity}
                </div>
                <button
                  onClick={() => handleQty(1)}
                  disabled={!inStock || (selectedVariant ? quantity >= selectedVariant.availableQuantity : false)}
                  className="w-11 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40 transition-colors"
                >
                  +
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                {/* ADD TO CART */}
                <button
                  disabled={!inStock || isAddingCart}
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary text-white h-12 font-bold rounded-xl shadow-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide active:scale-[0.99] cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {inStock ? (isAddingCart ? 'ADDING...' : 'ADD TO CART') : 'SOLD OUT'}
                </button>

                {/* BUY NOW */}
                <button
                  disabled={!inStock || isBuyingNow}
                  onClick={handleBuyNow}
                  className="flex-1 bg-[#0F172A] hover:bg-[#1E293B] text-white h-12 font-bold rounded-xl shadow-md hover:shadow-lg border border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide active:scale-[0.99] cursor-pointer group"
                >
                  {isBuyingNow ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      BUY NOW
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Specs and Tags */}
        <section className="bg-white border rounded p-8 mb-8">
          <h2 className="text-xl font-bold mb-4">Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm mb-8">
            <div className="flex justify-between border-b py-2"><b>Brand</b><span>{product.brand?.brandName}</span></div>
            <div className="flex justify-between border-b py-2"><b>Category</b><span>{product.categoryName}</span></div>
            <div className="flex justify-between border-b py-2"><b>SKU</b><span>{selectedVariant?.sku}</span></div>
            {selectedVariant?.options.map(opt => (
              <div key={opt.optionId} className="flex justify-between border-b py-2"><b>{opt.variationName}</b><span>{opt.value}</span></div>
            ))}
          </div>
          
        
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-1">You May Also Like</h2>
            <div className="text-sm text-gray-500 mb-4">Other products sharing tags with this product.</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
              {related.map(p => <ProductCard key={p.productId} product={p} />)}
            </div>
          </section>
        )}
      </main>
      
      {toastMsg && (
        <div className="fixed bottom-4 right-4 bg-text-main text-white px-6 py-3 rounded shadow-lg z-50">
          {toastMsg}
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ product }: { product: ProductListResponse }) => {
  const navigate = useNavigate();
  return (
    <article className="bg-white border border-border-subtle cursor-pointer hover:-translate-y-[3px] hover:shadow-[0_9px_24px_#00000010] transition-all flex flex-col group" onClick={() => { navigate(`/products/${product.productId}`); window.scrollTo(0,0); }}>
      <div className="relative h-[235px] bg-[#eee] overflow-hidden flex-shrink-0">
        {product.tags?.includes('TRENDING') && <span className="absolute left-[9px] top-[9px] bg-accent text-[10px] font-black px-2 py-1 z-10">TRENDING</span>}
        {product.stockStatus === 'SOLD_OUT' && <span className="absolute right-[9px] top-[9px] bg-[#333] text-white text-[10px] font-black px-2 py-1 z-10">SOLD OUT</span>}
        {product.primaryImageUrl && <img src={product.primaryImageUrl} className="w-full h-full object-cover transition-transform duration-250 group-hover:scale-105" />}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-[10px] text-text-muted uppercase">{product.brandName} &middot; {product.categoryName}</div>
        <div className="font-bold text-sm my-1 flex-1">{product.productName}</div>
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
