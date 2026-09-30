import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productApi } from '../../product/api/productApi';
import type { CategoryNodeResponse } from '../../product/types';

const CategoryIcon = ({ name }: { name: string }) => {
  const n = name.toLowerCase();
  let path = "M4 6a2 2 0 012-2h2.5l2 2H18a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"; // default folder
  if (n.includes('electronic') || n.includes('laptop') || n.includes('computer')) path = "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z";
  else if (n.includes('fashion') || n.includes('clothing') || n.includes('shirt')) path = "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z";
  else if (n.includes('home') || n.includes('furniture')) path = "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6";
  else if (n.includes('sport') || n.includes('fitness')) path = "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z";
  else if (n.includes('accessory') || n.includes('bag') || n.includes('jewelry')) path = "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z";
  else if (n.includes('audio') || n.includes('headphone')) path = "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a7 7 0 0114 0v10a2 2 0 01-2 2h-2a2 2 0 01-2-2v-6a2 2 0 012-2h2a2 2 0 012 2v6";
  
  return (
    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
    </svg>
  );
};

export const CategoryListPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryNodeResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi.getCategoryTree().then(res => {
      setCategories(res);
      setLoading(false);
    }).catch((e: any) => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  const renderCategoryCard = (c: CategoryNodeResponse, depth = 0) => {
    return (
      <React.Fragment key={c.categoryId}>
        <div 
          onClick={() => navigate(`/categories/${c.categoryId}`)} 
          className={`bg-white border border-border-subtle p-5 text-center cursor-pointer hover:-translate-y-[3px] hover:border-primary hover:shadow-[0_8px_20px_#0000000d] transition-all ${depth > 0 ? 'ml-8 bg-gray-50' : ''}`}
        >
          <div className="w-[76px] h-[76px] mx-auto bg-page rounded-full flex items-center justify-center mb-3">
            <CategoryIcon name={c.categoryName} />
          </div>
          <b className="text-sm block">{c.categoryName}</b>
        </div>
        {c.children && c.children.length > 0 && c.children.map(child => renderCategoryCard(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="min-h-screen bg-page pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="py-6 text-sm text-gray-500">
          <Link to="/" className="hover:underline">Home</Link> / Categories
        </div>

        <div className="bg-gradient-to-r from-secondary to-primary text-white p-8 rounded shadow-sm mb-8">
          <div className="text-accent font-bold text-[13px] tracking-wider">SHOP BY CATEGORY</div>
          <h1 className="text-[34px] font-bold my-1.5">Browse Categories</h1>
          <p className="text-zinc-200 text-[13px] m-0">Explore products by category.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="bg-white border p-12 text-center text-gray-500 rounded">
            No categories available.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map(c => renderCategoryCard(c, 0))}
          </div>
        )}
      </div>
    </div>
  );
};
