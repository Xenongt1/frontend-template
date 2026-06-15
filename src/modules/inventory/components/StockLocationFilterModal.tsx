import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { StorageLocationStatus } from '@/types';

type StatusFilter = 'All' | StorageLocationStatus;

interface Props {
  isOpen: boolean;
  currentStatus: StatusFilter;
  statusOptions: StorageLocationStatus[];
  onApply: (status: StatusFilter) => void;
  onClose: () => void;
}

const StockLocationFilterModal: React.FC<Props> = ({ isOpen, currentStatus, statusOptions, onApply, onClose }) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<StatusFilter>(currentStatus);

  const statusLabel = (s: StorageLocationStatus): string => {
    const key = `stockLocations.status.${s.toLowerCase()}`;
    const fallback = s.charAt(0) + s.slice(1).toLowerCase();
    return t(key, fallback);
  };

  useEffect(() => {
    if (isOpen) setDraft(currentStatus);
  }, [isOpen, currentStatus]);

  if (!isOpen) return null;

  const isDirty = draft !== 'All';

  return (
    <>
      <button
        type="button"
        aria-label={t('filter.closeDialog')}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-navy-900/35 border-none cursor-pointer"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-canvas-50 rounded-2xl shadow-[0_8px_32px_rgba(8,40,59,0.15)] w-full max-w-[440px] mx-4 overflow-hidden pointer-events-auto">

          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-canvas-300">
            <span className="text-base font-semibold text-navy-900">{t('filter.title')}</span>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-8 h-8 border-none rounded-md bg-transparent cursor-pointer text-navy-600 transition-colors hover:bg-canvas-300"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l12 12M14 2L2 14" stroke="#395362" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">
            <div>
              <label htmlFor="sl-filter-status" className="block mb-1.5 text-[13px] font-medium text-navy-600">
                {t('filter.statusLabel')}
              </label>
              <select
                id="sl-filter-status"
                value={draft}
                onChange={(e) => setDraft(e.target.value as StatusFilter)}
                className="w-full px-3 py-2 bg-canvas-200 border border-navy-300 rounded-lg text-sm text-navy-900 outline-none cursor-pointer appearance-none"
              >
                <option value="All">{t('filter.allStatuses')}</option>
                {statusOptions.map(s => (
                  <option key={s} value={s}>{statusLabel(s)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-canvas-300">
            <button
              onClick={() => setDraft('All')}
              disabled={!isDirty}
              className={`px-4 py-2 border border-canvas-300 rounded-lg bg-transparent text-sm font-medium transition-colors ${
                isDirty ? 'text-navy-900 cursor-pointer hover:bg-canvas-100' : 'text-navy-300 cursor-not-allowed'
              }`}
            >
              {t('filter.clear')}
            </button>
            <button
              onClick={() => { onApply(draft); onClose(); }}
              className="px-5 py-2 border-none rounded-lg bg-navy-900 text-canvas-50 text-sm font-medium cursor-pointer transition-colors hover:bg-navy-800"
            >
              {t('filter.apply')}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default StockLocationFilterModal;
