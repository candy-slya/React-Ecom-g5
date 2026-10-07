import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import type { ProductDetailResponse, ProductListResponse, ProductVariantResponse } from '../types';
import { useDispatch } from 'react-redux';
import { addGuestItem, addAuthenticatedCartItem, fetchAuthenticatedCart } from '../../cart/store/cartSlice';
import { useAppSelector } from '../../../hooks/useAppSelector';
import type { AppDispatch } from '../../../app/store';

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);

  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [related, setRelated] = useState<ProductListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantResponse | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    productApi.getProductDetail(Number(productId)).then(res => {
      setProduct(res);
      setSelectedVariant(res.variants[0] || null);
      setActiveImage(res.images.find(img => img.isPrimary)?.imageUrl || res.images[0]?.imageUrl || null);
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

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.availableQuantity <= 0) return;
    
    const req = { variantId: selectedVariant.variantId, quantity };
    if (isAuthenticated) {
      dispatch(addAuthenticatedCartItem(req)).unwrap().then(() => {
        dispatch(fetchAuthenticatedCart());
        setToastMsg(`${quantity} x ${product.productName} added to cart!`);
        setTimeout(() => setToastMsg(''), 3000);
      }).catch(() => {
        alert('Failed to add to cart.');
      });
    } else {
      dispatch(addGuestItem(req));
      setToastMsg(`${quantity} x ${product.productName} added to cart!`);
      setTimeout(() => setToastMsg(''), 3000);
    }

      setToastMsg(`${quantity} x ${product.productName} added to cart!`);
      setTimeout(() => setToastMsg(''), 3000);

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
              {product.images.map(img => (
                <div key={img.imageId} onClick={() => setActiveImage(img.imageUrl)} className={`w-16 h-16 border cursor-pointer ${activeImage === img.imageUrl ? 'border-green-600 border-2' : ''}`}>
                  <img src={img.imageUrl} className="w-full h-full object-cover transition-transform duration-250 group-hover:scale-105" />
                </div>
              ))}
            </div>
            <div className="flex-1 bg-gray-100 aspect-square">
              {activeImage && <img src={activeImage} className="w-full h-full object-contain" />}
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
            
            <div className="flex items-center gap-4 mt-auto">
              <div className="flex border bg-white h-12 rounded">
                <button onClick={() => handleQty(-1)} className="w-12 flex items-center justify-center font-bold hover:bg-page">&minus;</button>
                <div className="w-12 flex items-center justify-center border-l border-r">{quantity}</div>
                <button onClick={() => handleQty(1)} className="w-12 flex items-center justify-center font-bold hover:bg-page">+</button>
              </div>
              <button disabled={!inStock} onClick={handleAddToCart} className="flex-1 bg-primary text-white h-12 font-bold rounded shadow hover:bg-primary-hover disabled:opacity-50">
                {inStock ? 'ADD TO CART' : 'SOLD OUT'}
              </button>
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
