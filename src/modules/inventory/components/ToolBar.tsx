import React, { useRef, useState } from 'react';
import type { InventoryFilters, InventoryStatus } from '../types';
import AdvancedFilterModal from './AdvancedFilterModal';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

interface Props {
  filters: InventoryFilters;
  onSearch: (value: string) => void;
  onFiltersApply: (status: InventoryStatus | 'All', category: string) => void;
}

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="5" stroke="#395362" strokeWidth="1.5" />
    <path d="M11 11L14 14" stroke="#395362" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M4 8h8M6 12h4" stroke="#061C2A" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3v10M3 8h10" stroke="#FDFDFD" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 2l10 10M12 2L2 12" stroke="#395362" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ToolBar: React.FC<Props> = ({ filters, onSearch, onFiltersApply }) => {
  // The filter dropdown anchors to the Filter button — capture its rect on
  // open so the panel renders right below it (instead of being a centered
  // modal). null = closed.
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const [filterAnchor, setFilterAnchor] = useState<{ top: number; right: number } | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const openFilter = () => {
    const btn = filterBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setFilterAnchor({
      top: rect.bottom + 6,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4 px-6 py-4 flex-wrap">
        {/* Search input — fixed 364px per Figma spec (the canonical width). */}
        <div className="relative w-[364px] max-w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder={t('toolbar.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-9 py-2 bg-canvas-200 border border-navy-300 rounded-lg text-sm text-navy-900 outline-none box-border focus:border-stroke-focus transition-colors"
            style={{ paddingRight: filters.search ? 36 : 12 }}
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer flex items-center p-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-button-focus-ring rounded"
              aria-label={t('toolbar.clearSearch')}
            >
              <XIcon />
            </button>
          )}
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
          <button
            ref={filterBtnRef}
            type="button"
            onClick={openFilter}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#061C2A] rounded-lg bg-transparent text-[#061C2A] text-sm font-medium cursor-pointer whitespace-nowrap transition-colors hover:bg-[#F0F2F3] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-button-focus-ring"
          >
            <FilterIcon />
            {t('toolbar.filter')}
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: '/inventory/register' })}
            className="inline-flex items-center gap-2 px-[18px] py-2 border-none rounded-lg bg-navy-900 text-canvas-50 text-sm font-medium cursor-pointer whitespace-nowrap transition-colors hover:bg-navy-800 active:bg-button-primary-click focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-button-focus-ring"
          >
            <PlusIcon />
            {t('toolbar.addInventory')}
          </button>
        </div>
      </div>

      <AdvancedFilterModal
        anchor={filterAnchor}
        currentFilters={filters}
        onApply={onFiltersApply}
        onClose={() => setFilterAnchor(null)}
      />
    </>
  );
};

export default ToolBar;
