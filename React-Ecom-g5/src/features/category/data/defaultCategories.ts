import type { CategoryNodeResponse } from '../../product/types';

/**
 * Backoffice Default Categories (၅ ခု)
 * Database Seeder နှင့် Backoffice Inventory တွင် စနစ်တကျ သွင်းထားသော Default Categories များ
 */
export const DEFAULT_BACKOFFICE_CATEGORIES: CategoryNodeResponse[] = [
  {
    categoryId: 1,
    categoryName: 'Clothing',
    children: [],
  },
  {
    categoryId: 2,
    categoryName: 'Footwear',
    children: [],
  },
  {
    categoryId: 3,
    categoryName: 'Cosmetics',
    children: [],
  },
  {
    categoryId: 4,
    categoryName: 'Beverages',
    children: [],
  },
  {
    categoryId: 5,
    categoryName: 'Electronics',
    children: [],
  },
];
