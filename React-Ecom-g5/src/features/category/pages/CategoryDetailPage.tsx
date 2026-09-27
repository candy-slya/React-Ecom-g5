import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { productApi } from '../../product/api/productApi';
import { ProductCard } from '../../../components/product/ProductCard';
import type { CategoryNodeResponse, ProductListResponse, PageResponse } from '../../product/types';

export const CategoryDetailPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState<CategoryNodeResponse | null>(null);
  const [productsPage, setProductsPage] = useState<PageResponse<ProductListResponse> | null>(null);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  const activeSort = searchParams.get('sort') || 'newest';
  const activePage = searchParams.get('page') ? Number(searchParams.get('page')) : 0;

  // Helper to recursively find category
  const findCategory = (nodes: CategoryNodeResponse[], id: number): CategoryNodeResponse | null => {
    for (const node of nodes) {
      if (node.categoryId === id) return node;
      if (node.children && node.children.length > 0) {
        const found = findCategory(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    if (!categoryId) return;
    setLoadingCategory(true);
    productApi.getCategoryTree().then(res => {
      const found = findCategory(res, Number(categoryId));
      setCategory(found);
      setLoadingCategory(false);
    }).catch((e: any) => {
      console.error(e);
      setLoadingCategory(false);
    });
  }, [categoryId]);

  useEffect(() => {
    if (!categoryId) return;
    setLoadingProducts(true);
    
    const params: Record<string, any> = { categoryId: Number(categoryId) };
    if (activeSort) params.sort = activeSort;
    if (activePage !== undefined) params.page = activePage;
    
    productApi.getProducts(params).then(res => {
      setProductsPage(res);
      setLoadingProducts(false);
    }).catch((e: any) => {
      console.error(e);
      setLoadingProducts(false);
    });
  }, [categoryId, activeSort, activePage]);

  const updateFilters = (newParams: Record<string, any>) => {
    const nextParams = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(newParams)) {
      if (v === null || v === undefined || v === '') {
        nextParams.delete(k);
      } else {
        nextParams.set(k, v.toString());
      }
    }
    if (!newParams.page) {
      nextParams.set('page', '0');
    }
    setSearchParams(nextParams);
  };

  if (loadingCategory) {
    return <div className="text-center py-20 text-gray-500">Loading category...</div>;
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-page pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-gray-500">
          <h2 className="text-2xl font-bold mb-4">Category not found</h2>
          <Link to="/categories" className="text-primary hover:underline">Return to Categories</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="py-6 text-sm text-gray-500">
          <Link to="/" className="hover:underline">Home</Link> / <Link to="/categories" className="hover:underline">Categories</Link> / {category.categoryName}
        </div>

        <div className="bg-white border border-border-subtle p-8 rounded shadow-sm mb-8">
          <h1 className="text-[34px] font-bold m-0">{category.categoryName}</h1>
        </div>
        
        {/* Subcategories */}
        {category.children && category.children.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Subcategories</h2>
            <div className="flex flex-wrap gap-3">
              {category.children.map(child => (
                <button 
                  key={child.categoryId} 
                  onClick={() => navigate(`/categories/${child.categoryId}`)}
                  className="bg-white border border-border-subtle px-4 py-2 text-sm hover:border-primary hover:text-primary transition-colors rounded"
                >
                  {child.categoryName}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-[18px]">
          <div className="text-xs text-gray-500">
            {loadingProducts ? 'Loading products...' : `Showing ${productsPage?.totalElements || 0} products`}
          </div>
          <select value={activeSort} onChange={e => updateFilters({ sort: e.target.value, page: 0 })} className="p-2 border text-sm bg-white">
            <option value="newest">Newest</option>
            <option value="priceAsc">Price Low &rarr; High</option>
            <option value="priceDesc">Price High &rarr; Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {loadingProducts ? (
          <div className="text-center py-12 text-gray-500">Loading products...</div>
        ) : productsPage?.content.length === 0 ? (
          <div className="bg-white border p-12 text-center text-gray-500 rounded">
            No products available for this category.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[18px]">
              {productsPage?.content.map(p => (
                <ProductCard key={p.productId} product={p} />
              ))}
            </div>
            
            {/* Pagination */}
            {productsPage && productsPage.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button disabled={productsPage.first} onClick={() => updateFilters({ page: activePage - 1 })} className="px-3 py-1 border bg-white disabled:opacity-50">&larr;</button>
                <span className="px-3 py-1 text-sm">{activePage + 1} of {productsPage.totalPages}</span>
                <button disabled={productsPage.last} onClick={() => updateFilters({ page: activePage + 1 })} className="px-3 py-1 border bg-white disabled:opacity-50">&rarr;</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
