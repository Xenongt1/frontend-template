import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

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
    <path d="M10 12L6 8L10 4" stroke="#395362" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4L10 8L6 12" stroke="#395362" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type Ellipsis = 'ellipsis-leading' | 'ellipsis-trailing';
type PageEntry = number | Ellipsis;

const isEllipsis = (e: PageEntry): e is Ellipsis => e === 'ellipsis-leading' || e === 'ellipsis-trailing';

function getPageNumbers(page: number, totalPages: number): PageEntry[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: PageEntry[] = [1];
  if (page > 3) pages.push('ellipsis-leading');
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p);
  if (page < totalPages - 2) pages.push('ellipsis-trailing');
  pages.push(totalPages);
  return pages;
}

const cellBase = 'inline-flex items-center justify-center min-w-[36px] h-[33px] px-3 text-[14px] font-medium border border-canvas-300 bg-canvas-50 transition-colors';

const RolesPagination: React.FC<Props> = ({
  page, pageSize, total, totalPages, pageSizeOptions, onPageChange, onPageSizeChange, disabled = false,
}) => {
  const { t } = useTranslation();
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-between px-4 py-4 gap-3 flex-wrap min-h-[69px]">
      <div className="text-[14px] text-navy-600">
        <Trans
          i18nKey="roles.list.pagination.showing"
          values={{ start, end, total }}
          components={{ b: <span className="font-semibold text-navy-900" /> }}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={disabled}
              aria-label={t('roles.list.pagination.rowsPerPage')}
              className="appearance-none pl-4 pr-8 py-3 bg-[#ECECEB] border border-[#B2BCC2] rounded-lg text-[14px] text-navy-500 cursor-pointer outline-none disabled:opacity-50"
            >
              {pageSizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#5A6F7C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>
          <span className="text-[14px] text-navy-600 whitespace-nowrap">{t('roles.list.pagination.rowsPerPage')}</span>
        </div>

        <div className="inline-flex items-center rounded">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={disabled || page === 1}
            aria-label={t('roles.list.pagination.previousPage')}
            className={`${cellBase} rounded-l hover:bg-canvas-100 disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <ChevronLeft />
          </button>
          {pageNumbers.map((p, i) =>
            isEllipsis(p) ? (
              <span key={`${p}-${i}`} className={`${cellBase} text-navy-600 cursor-default border-l-0`}>…</span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                disabled={disabled}
                className={`${cellBase} border-l-0 ${
                  p === page
                    ? 'bg-navy-300 text-navy-900 font-semibold'
                    : 'text-navy-600 hover:bg-canvas-100'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={disabled || page === totalPages}
            aria-label={t('roles.list.pagination.nextPage')}
            className={`${cellBase} rounded-r border-l-0 hover:bg-canvas-100 disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolesPagination;
