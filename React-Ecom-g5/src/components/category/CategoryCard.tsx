import React from 'react';
import { CategoryIcon, getCategoryTheme } from './CategoryIcon';
import type { CategoryNodeResponse } from '../../features/product/types';

interface CategoryCardProps {
  category: CategoryNodeResponse;
  onClick: () => void;
  variant?: 'compact' | 'detailed' | 'minimal';
  parentCategoryName?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onClick,
  variant = 'compact',
  parentCategoryName,
}) => {
  const theme = getCategoryTheme(category.categoryName);
  const childCount = category.children?.length || 0;

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white border border-slate-200/90 rounded-2xl p-5 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_14px_30px_-6px_rgba(0,0,0,0.12)] ${theme.borderColor} overflow-hidden flex flex-col items-center justify-between`}
    >
      {/* Subtle top ambient accent bar on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/80 to-accent/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Parent Badge if applicable */}
      {parentCategoryName && (
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 group-hover:text-primary transition-colors">
          {parentCategoryName}
        </span>
      )}

      {/* Icon Capsule with ambient radial gradient */}
      <div
        className={`w-[78px] h-[78px] mx-auto rounded-2xl bg-gradient-to-br ${theme.bgGradient} flex items-center justify-center p-3 mb-3.5 shadow-xs border border-white/80 ring-1 ring-slate-900/5 group-hover:scale-105 group-hover:rotate-1 transition-all duration-300`}
      >
        <div className={`${theme.iconColor} transition-transform duration-300 group-hover:scale-110`}>
          <CategoryIcon name={category.categoryName} className="w-8 h-8 drop-shadow-xs" />
        </div>
      </div>

      {/* Category Name */}
      <div className="w-full">
        <h3 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors duration-200 line-clamp-1 leading-snug">
          {category.categoryName}
        </h3>

        {/* Subcategories or explore note */}
        {variant === 'detailed' && childCount > 0 ? (
          <span className="inline-block mt-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {childCount} {childCount === 1 ? 'subcategory' : 'subcategories'}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-slate-400 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
            Explore <span>&rarr;</span>
          </span>
        )}
      </div>
    </div>
  );
};
