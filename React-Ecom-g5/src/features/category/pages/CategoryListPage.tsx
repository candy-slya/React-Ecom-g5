import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productApi } from '../../product/api/productApi';
import type { CategoryNodeResponse } from '../../product/types';
import { CategoryCard } from '../../../components/category/CategoryCard';

export const CategoryListPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryNodeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<number | 'ALL'>('ALL');

  useEffect(() => {
    productApi.getCategoryTree().then(res => {
      setCategories(res);
      setLoading(false);
    }).catch((e: any) => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  // Flatten categories into an organized list with parent information
  const flattenedCategories = useMemo(() => {
    const list: Array<{ category: CategoryNodeResponse; parentName?: string; parentId?: number }> = [];

    categories.forEach(parent => {
      // Add the parent category
      list.push({ category: parent, parentId: parent.categoryId });

      // Add child subcategories
      if (parent.children && parent.children.length > 0) {
        parent.children.forEach(child => {
          list.push({
            category: child,
            parentName: parent.categoryName,
            parentId: parent.categoryId,
          });
        });
      }
    });

    return list;
  }, [categories]);

  // Filter based on search query and selected parent department
  const filteredCategories = useMemo(() => {
    return flattenedCategories.filter(item => {
      const matchesSearch = item.category.categoryName.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesParent = selectedParentId === 'ALL' || item.parentId === selectedParentId;
      return matchesSearch && matchesParent;
    });
  }, [flattenedCategories, searchQuery, selectedParentId]);

  return (
    <div className="min-h-screen bg-page pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="py-6 text-sm text-gray-500">
          <Link to="/" className="hover:underline">Home</Link> / Categories
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white p-8 sm:p-10 rounded-2xl shadow-md mb-8">
          <div className="relative z-10">
            <div className="text-amber-300 font-black text-xs tracking-widest uppercase mb-1">
              SHOP BY CATEGORY
            </div>
            <h1 className="text-3xl sm:text-4xl font-black my-2">Browse Categories</h1>
            <p className="text-sky-100 text-sm sm:text-base max-w-xl m-0 font-medium">
              Explore our curated selection of premium products across all categories and departments.
            </p>
          </div>
          {/* Subtle decorative circles */}
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-40 -top-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Department Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedParentId('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedParentId === 'ALL'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              All Categories ({flattenedCategories.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.categoryId}
                onClick={() => setSelectedParentId(cat.categoryId)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedParentId === cat.categoryId
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat.categoryName}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all pl-9"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <div className="text-slate-500 text-sm font-medium">Loading categories...</div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-semibold text-slate-700">No categories found</p>
            <p className="text-xs text-slate-400 mt-1">Try searching with a different keyword or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredCategories.map(({ category, parentName }) => (
              <CategoryCard
                key={category.categoryId}
                category={category}
                parentCategoryName={parentName}
                onClick={() => navigate(`/categories/${category.categoryId}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
