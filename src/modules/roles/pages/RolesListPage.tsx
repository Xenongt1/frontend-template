import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { liteDebounce } from '@tanstack/pacer-lite';
import { useRoles } from '../hooks/useRoles';
import RolesTable from '../components/RolesTable';
import RolesPagination from '../components/RolesPagination';
import type { RoleSummary } from '../types';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const SEARCH_DEBOUNCE_MS = 250;

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="5" stroke="#395362" strokeWidth="1.5" />
    <path d="M11 11L14 14" stroke="#395362" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 2l10 10M12 2L2 12" stroke="#395362" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const RolesListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, total, page, pageSize, loading, error, setPage, setPageSize, setSearch } = useRoles();
  const [searchInput, setSearchInput] = useState('');

  // Keep the latest setSearch in a ref so the once-built debouncer always
  // calls the current closure when it fires.
  const setSearchRef = useRef(setSearch);
  setSearchRef.current = setSearch;
  const debouncedSetSearch = useMemo(
    () => liteDebounce((value: string) => setSearchRef.current(value), { wait: SEARCH_DEBOUNCE_MS }),
    [],
  );

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleView = (role: RoleSummary) => {
    navigate({ to: `/iam/roles/${role.id}` });
  };

  return (
    <div className="flex flex-col gap-4 w-full min-h-0">
      {/* Page header */}
      <div className="flex flex-col gap-2 pb-[10px]">
        <h1 className="m-0 text-[18px] font-semibold leading-[28px] text-[#041620] font-['Inter']">
          {t('roles.list.title')}
        </h1>
        <p className="m-0 text-[14px] font-normal leading-5 text-navy-900 font-['Inter']">
          {t('roles.list.description')}
        </p>
      </div>

      {/* Card */}
      <div className="bg-canvas-50 rounded-lg border border-canvas-300 overflow-hidden flex flex-col flex-1">
        {/* Toolbar */}
        <div className="flex justify-between items-center gap-3 px-6 py-4 flex-wrap">
          <div className="relative w-[364px] max-w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder={t('roles.list.searchPlaceholder')}
              aria-label={t('roles.list.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className={[
                'w-full pl-10 py-2 bg-[#ECECEB] border border-[#B2BCC2] rounded-lg',
                'text-[14px] text-navy-900 outline-none box-border',
                'placeholder:text-[#395362] focus:border-navy-600 transition-colors',
                searchInput ? 'pr-9' : 'pr-4',
              ].join(' ')}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                aria-label={t('roles.list.clearSearch')}
                className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer flex items-center p-0.5"
              >
                <XIcon />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: '/iam/roles/new' })}
            className="inline-flex items-center justify-center px-5 py-[10px] border-none rounded-lg bg-navy-900 text-canvas-50 text-[14px] font-medium cursor-pointer whitespace-nowrap transition-colors hover:bg-navy-800"
          >
            {t('roles.list.createRole')}
          </button>
        </div>

        {error && (
          <div className="px-6 py-2.5 bg-red-50 border-t border-red-100 text-red-800 text-[13px]">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <RolesTable
            items={items}
            loading={loading}
            skeletonRowCount={pageSize}
            onView={handleView}
          />
        </div>

        {/* Pagination */}
        <RolesPagination
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default RolesListPage;
