import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  disabled?: boolean;
}

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type Ellipsis = 'ellipsis-leading' | 'ellipsis-trailing';
type PageEntry = number | Ellipsis;

function isEllipsis(entry: PageEntry): entry is Ellipsis {
  return entry === 'ellipsis-leading' || entry === 'ellipsis-trailing';
}

function getPageNumbers(page: number, totalPages: number): PageEntry[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: PageEntry[] = [1];
  if (page > 3) pages.push('ellipsis-leading');
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p);
  if (page < totalPages - 2) pages.push('ellipsis-trailing');
  pages.push(totalPages);
  return pages;
}

const Pagination: React.FC<Props> = ({
  page, pageSize, total, totalPages, pageSizeOptions, onPageChange, onPageSizeChange, disabled = false,
}) => {
  const { t } = useTranslation();
  const pageNumbers = getPageNumbers(page, totalPages);

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-canvas-300 gap-3 flex-wrap">
      {/* Left: showing range */}
      <span className="text-[13px] text-navy-600 whitespace-nowrap flex-shrink-0">
        {t('pagination.showing', { start, end, count: total })}
      </span>

      {/* Right: page size selector + navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          disabled={disabled}
          className="px-2.5 py-[5px] bg-canvas-200 border border-navy-300 rounded-md text-[13px] text-navy-900 cursor-pointer outline-none disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pageSizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-[13px] text-navy-600 whitespace-nowrap">{t('pagination.rowsPerPage')}</span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={disabled || page === 1}
            className="inline-flex items-center justify-center w-8 h-8 border border-canvas-300 rounded-md bg-canvas-50 text-navy-600 transition-colors flex-shrink-0 hover:bg-canvas-100 hover:border-navy-300 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={t('pagination.previousPage')}
          >
            <ChevronLeft />
          </button>

          {pageNumbers.map((p) =>
            isEllipsis(p) ? (
              <span
                key={p}
                className="inline-flex items-center justify-center min-w-8 h-8 px-1 text-[13px] text-navy-300 cursor-default flex-shrink-0"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                disabled={disabled}
                className={`inline-flex items-center justify-center min-w-8 h-8 px-1 rounded-md text-[13px] flex-shrink-0 transition-colors border disabled:opacity-40 disabled:cursor-not-allowed ${
                  p === page
                    ? 'bg-navy-300 text-navy-900 font-semibold border-navy-300'
                    : 'bg-transparent text-navy-600 font-normal border-transparent hover:bg-canvas-200'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={disabled || page === totalPages}
            className="inline-flex items-center justify-center w-8 h-8 border border-canvas-300 rounded-md bg-canvas-50 text-navy-600 transition-colors flex-shrink-0 hover:bg-canvas-100 hover:border-navy-300 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={t('pagination.nextPage')}
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
