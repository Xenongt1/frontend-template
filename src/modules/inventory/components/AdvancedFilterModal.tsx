import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InventoryFilters, InventoryStatus, FilterOption } from '../types';
import { inventoryApi } from '../api/inventoryApi';

interface DraftFilters {
  status: InventoryStatus | 'All';
  category: string;
}

interface Props {
  /**
   * Anchor rect of the triggering Filter button (in viewport coordinates).
   * When null, the dropdown is closed.
   */
  anchor: { top: number; right: number } | null;
  currentFilters: InventoryFilters;
  onApply: (status: InventoryStatus | 'All', category: string) => void;
  onClose: () => void;
}

const PANEL_WIDTH = 380;
const VIEWPORT_MARGIN = 8;

const AdvancedFilterModal: React.FC<Props> = ({ anchor, currentFilters, onApply, onClose }) => {
  const { t } = useTranslation();
  const isOpen = anchor !== null;
  const containerRef = useRef<HTMLDivElement>(null);

  const [draft, setDraft] = useState<DraftFilters>({
    status: currentFilters.status,
    category: currentFilters.category,
  });
  const [categories, setCategories] = useState<Array<FilterOption<string>>>([]);
  const [statuses, setStatuses] = useState<Array<FilterOption<InventoryStatus>>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<{ top: number; right: number }>({
    top: anchor?.top ?? 0,
    right: anchor?.right ?? VIEWPORT_MARGIN,
  });

  useEffect(() => {
    if (isOpen) {
      setDraft({ status: currentFilters.status, category: currentFilters.category });
    }
  }, [isOpen, currentFilters.status, currentFilters.category]);

  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();

    const loadFilterOptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const [categoryOptions, statusOptions] = await Promise.all([
          inventoryApi.getCategories(controller.signal),
          inventoryApi.getStatuses(controller.signal),
        ]);
        setCategories(categoryOptions);
        setStatuses(statusOptions);
      } catch (err) {
        const e = err as Error;
        if (e.name === 'AbortError') return;
        setError(e.message || t('filter.loadError'));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadFilterOptions();
    return () => controller.abort();
  }, [isOpen, t]);

  // Click-outside + Escape close.
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) onClose();
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Clamp the panel to the viewport so it doesn't spill off the right or
  // bottom edge.
  useLayoutEffect(() => {
    if (!isOpen || !anchor) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const maxTop = vh - rect.height - VIEWPORT_MARGIN;
    setPosition({
      top: Math.max(VIEWPORT_MARGIN, Math.min(anchor.top, maxTop)),
      right: Math.max(VIEWPORT_MARGIN, anchor.right),
    });
  }, [isOpen, anchor, loading]);

  if (!isOpen) return null;

  const isDirty = draft.status !== 'All' || draft.category !== 'All';

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label={t('filter.title')}
      style={{
        position: 'fixed',
        top: position.top,
        right: position.right,
        width: PANEL_WIDTH,
        maxWidth: `calc(100vw - ${VIEWPORT_MARGIN * 2}px)`,
        zIndex: 50,
      }}
      className="bg-canvas-50 rounded-xl shadow-[0_8px_32px_rgba(8,40,59,0.15)] border border-canvas-300 overflow-hidden flex flex-col"
    >
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-canvas-300">
        <span className="text-base font-semibold text-navy-900">{t('filter.title')}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('filter.closeDialog')}
          className="inline-flex items-center justify-center w-8 h-8 border-none rounded-md bg-transparent cursor-pointer text-navy-600 transition-colors hover:bg-canvas-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-button-focus-ring"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="#395362" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">
        {error && (
          <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-red-800 text-[13px]">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="filter-status" className="block mb-1.5 text-[13px] font-medium text-navy-600">{t('filter.statusLabel')}</label>
          <select
            id="filter-status"
            value={draft.status}
            onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as InventoryStatus | 'All' }))}
            disabled={loading}
            className="w-full px-3 py-2 bg-canvas-200 border border-navy-300 rounded-lg text-sm text-navy-900 outline-none cursor-pointer appearance-none focus:border-stroke-focus disabled:opacity-60"
          >
            <option value="All">{t('filter.allStatuses')}</option>
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-category" className="block mb-1.5 text-[13px] font-medium text-navy-600">{t('filter.categoryLabel')}</label>
          <select
            id="filter-category"
            value={draft.category}
            onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
            disabled={loading}
            className="w-full px-3 py-2 bg-canvas-200 border border-navy-300 rounded-lg text-sm text-navy-900 outline-none cursor-pointer appearance-none focus:border-stroke-focus disabled:opacity-60"
          >
            <option value="All">{t('filter.allCategories')}</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-canvas-300">
        <button
          type="button"
          onClick={() => setDraft({ status: 'All', category: 'All' })}
          disabled={!isDirty || loading}
          className={`px-4 py-2 border border-canvas-300 rounded-lg bg-transparent text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-button-focus-ring ${
            isDirty && !loading ? 'text-navy-900 cursor-pointer hover:bg-canvas-100' : 'text-navy-300 cursor-not-allowed'
          }`}
        >
          {t('filter.clear')}
        </button>
        <button
          type="button"
          onClick={() => { onApply(draft.status, draft.category); onClose(); }}
          disabled={loading}
          className="px-5 py-2 border-none rounded-lg bg-navy-900 text-canvas-50 text-sm font-medium cursor-pointer transition-colors hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-button-focus-ring disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? t('common.loading') : t('filter.apply')}
        </button>
      </div>
    </div>
  );
};

export default AdvancedFilterModal;
