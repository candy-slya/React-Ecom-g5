import React from 'react';

export interface PaginationProps {
  currentPage: number; // 1-based (1 to totalPages)
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number; // default 3
  scrollToTop?: boolean; // default true
  className?: string;
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 3,
  scrollToTop = true,
  className = "mt-12",
  disabled = false,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  // Calculate sliding window of size maxVisiblePages (default 3)
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = currentPage - Math.floor(maxVisiblePages / 2);

    if (start < 1) {
      start = 1;
    }

    if (start + maxVisiblePages - 1 > totalPages) {
      start = totalPages - maxVisiblePages + 1;
    }

    return Array.from({ length: maxVisiblePages }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  const handlePageSelect = (page: number) => {
    if (disabled || page === currentPage || page < 1 || page > totalPages) {
      return;
    }
    onPageChange(page);
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <button
        type="button"
        disabled={disabled || currentPage <= 1}
        onClick={() => handlePageSelect(currentPage - 1)}
        className="px-4 py-2 rounded-lg border border-border-subtle bg-white text-sm font-semibold text-text-main hover:bg-page hover:text-primary transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer disabled:cursor-not-allowed"
      >
        Previous
      </button>

      <div className="flex space-x-1">
        {visiblePages.map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            disabled={disabled}
            onClick={() => handlePageSelect(pageNum)}
            className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
              currentPage === pageNum
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-text-main border border-border-subtle hover:bg-page hover:text-primary"
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={disabled || currentPage >= totalPages}
        onClick={() => handlePageSelect(currentPage + 1)}
        className="px-4 py-2 rounded-lg border border-border-subtle bg-white text-sm font-semibold text-text-main hover:bg-page hover:text-primary transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
