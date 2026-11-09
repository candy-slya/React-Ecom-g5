import React from 'react';
import { Pagination } from '../../../components/common/Pagination';

export interface ProductPaginationProps {
  currentPage: number; // 0-based
  totalPages: number;
  first?: boolean;
  last?: boolean;
  onPageChange: (page: number) => void;
}

export const ProductPagination: React.FC<ProductPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <Pagination
      currentPage={currentPage + 1}
      totalPages={totalPages}
      onPageChange={(page) => onPageChange(page - 1)}
    />
  );
};

export default ProductPagination;
