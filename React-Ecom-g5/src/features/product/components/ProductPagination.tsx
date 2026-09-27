import React from 'react';

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  onPageChange: (page: number) => void;
}

export const ProductPagination: React.FC<ProductPaginationProps> = ({
  currentPage,
  totalPages,
  first,
  last,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (!first && currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!last && currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="mt-6 flex items-center justify-between border-t border-border-subtle bg-transparent py-3">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={first}
          className="relative inline-flex items-center rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-text-main transition-colors hover:bg-page focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-page disabled:text-text-muted"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={last}
          className="relative ml-3 inline-flex items-center rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-text-main transition-colors hover:bg-page focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-page disabled:text-text-muted"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-text-main">
            Page <span className="font-medium text-primary">{currentPage + 1}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={first}
              className="relative inline-flex items-center rounded-l-md px-4 py-2 text-sm font-semibold text-text-main ring-1 ring-inset ring-border-subtle transition-colors hover:bg-page focus:z-20 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-page disabled:text-text-muted"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={last}
              className="relative inline-flex items-center rounded-r-md px-4 py-2 text-sm font-semibold text-text-main ring-1 ring-inset ring-border-subtle transition-colors hover:bg-page focus:z-20 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-page disabled:text-text-muted"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
