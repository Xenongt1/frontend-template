import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { InventoryItem } from '../types';
import StatusBadge from './StatusBadge';
import InventoryTableSkeleton from './InventoryTableSkeleton';

interface Props {
  items: InventoryItem[];
  loading?: boolean;
  skeletonRowCount?: number;
  onView: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onToggleSuspension: (item: InventoryItem) => void;
}

const SortIcon = () => (
  <svg width="12" height="12" viewBox="0 0 20 16" fill="none">
    <path d="M9 13L5 17L1 13M5 17V1M9 1H13M9 5H16M9 9H19" stroke="#08283B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="3" r="1.2" fill="#395362" />
    <circle cx="8" cy="8" r="1.2" fill="#395362" />
    <circle cx="8" cy="13" r="1.2" fill="#395362" />
  </svg>
);

const thClass = 'px-4 py-3 text-left text-[13px] font-semibold text-navy-600 whitespace-nowrap bg-canvas-300 border-b border-canvas-300 select-none';
const tdClass = 'px-4 h-20 align-middle border-b border-canvas-300 text-sm text-navy-900';

const InventoryTable: React.FC<Props> = ({
  items,
  loading = false,
  skeletonRowCount = 10,
  onView,
  onEdit,
  onToggleSuspension,
}) => {
  const { t } = useTranslation();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  // Position-fixed coords for the open menu, computed from the button so the
  // menu escapes the table's overflow-clipping ancestors.
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
        setMenuPos(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on scroll/resize — fixed-positioned menu would otherwise drift away
  // from its anchor button.
  useEffect(() => {
    if (openMenuId === null) return;
    const close = () => { setOpenMenuId(null); setMenuPos(null); };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [openMenuId]);

  const MENU_WIDTH = 160;
  const openMenuFor = (itemId: string, btn: HTMLButtonElement) => {
    const rect = btn.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      left: Math.max(8, rect.right - MENU_WIDTH),
    });
    setOpenMenuId(itemId);
  };

  const renderActionMenu = (item: InventoryItem) => {
    if (openMenuId !== item.id || !menuPos) return null;
    const isSuspended = item.status === 'INTAKE_SUSPENDED';
    const standardItems = [
      { label: t('table.rowActions.view'), action: () => { onView(item); setOpenMenuId(null); } },
      { label: t('table.rowActions.edit'), action: () => { onEdit(item); setOpenMenuId(null); } },
    ];
    return (
      <div
        role="menu"
        tabIndex={-1}
        className="z-50 bg-canvas-50 border border-canvas-300 rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.10)] py-1"
        style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, width: MENU_WIDTH }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {standardItems.map(({ label, action }) => (
          <button
            key={label}
            role="menuitem"
            onClick={(e) => { e.stopPropagation(); action(); }}
            className="block w-full text-left px-4 py-2 border-none bg-transparent text-sm text-navy-900 cursor-pointer hover:bg-canvas-100"
          >
            {label}
          </button>
        ))}
        <div className="h-px bg-canvas-300 my-1" />
        <button
          role="menuitem"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSuspension(item);
            setOpenMenuId(null);
          }}
          className={`block w-full text-left px-4 py-2 border-none bg-transparent text-sm cursor-pointer ${
            isSuspended ? 'text-navy-900 hover:bg-canvas-100' : 'text-red-800 hover:bg-red-50'
          }`}
        >
          {isSuspended ? t('table.rowActions.activateItem') : t('table.rowActions.suspendIntake')}
        </button>
      </div>
    );
  };

  return (
    <div
      className="overflow-x-auto w-full"
      ref={menuRef}
      aria-busy={loading}
      aria-live="polite"
    >
      {loading && (
        <span className="sr-only">{t('table.loading')}</span>
      )}

      <table className="w-full border-collapse min-w-[600px]">
        <thead>
          <tr>
            <th className={`${thClass} min-w-[110px]`}>{t('table.columns.sku')}</th>
            <th className={`${thClass} min-w-[200px]`}>
              <span className="inline-flex items-center gap-1"><SortIcon /> {t('table.columns.name')}</span>
            </th>
            <th className={`${thClass} min-w-[160px] hide-on-mobile`}>
              <span className="inline-flex items-center gap-1"><SortIcon /> {t('table.columns.category')}</span>
            </th>
            <th className={`${thClass} min-w-[140px] hide-on-mobile`}>
              <span className="inline-flex items-center gap-1"><SortIcon /> {t('table.columns.unit')}</span>
            </th>
            <th className={`${thClass} min-w-[160px]`}>{t('table.columns.status')}</th>
            <th className={`${thClass} w-20 text-center`}>{t('table.columns.actions')}</th>
          </tr>
        </thead>

        <tbody>
          {(() => {
            if (loading) return <InventoryTableSkeleton rowCount={skeletonRowCount} />;
            if (items.length === 0) return (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-navy-500 border-b border-canvas-300 text-sm align-middle">
                  <div className="flex flex-col items-center gap-2">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect width="40" height="40" rx="8" fill="#F0F0F0" />
                      <path d="M12 20h16M20 12v16" stroke="#B2BCC2" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span>{t('table.empty')}</span>
                  </div>
                </td>
              </tr>
            );
            return items.map((item) => (
              <tr
                key={item.id}
                onClick={() => onView(item)}
                className="bg-canvas-50 transition-colors cursor-pointer hover:bg-canvas-100"
              >
                <td className={`${tdClass} font-mono !text-[13px] text-navy-600`}>{item.sku}</td>
                <td className={`${tdClass} font-medium`}>{item.displayName}</td>
                <td className={`${tdClass} text-navy-600 hide-on-mobile`}>{item.category.replace(/_/g, ' ')}</td>
                <td className={`${tdClass} text-navy-600 hide-on-mobile`}>{item.baseUnitOfMeasure}</td>
                <td className={tdClass}><StatusBadge status={item.status} /></td>
                <td className={`${tdClass} text-center relative`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (openMenuId === item.id) {
                        setOpenMenuId(null);
                        setMenuPos(null);
                      } else {
                        openMenuFor(item.id, e.currentTarget);
                      }
                    }}
                    className="inline-flex items-center justify-center w-8 h-8 border-none bg-transparent rounded-md cursor-pointer text-navy-600 transition-colors hover:bg-canvas-300"
                    aria-label={t('table.rowActions.open')}
                  >
                    <DotsIcon />
                  </button>

                  {renderActionMenu(item)}
                </td>
              </tr>
            ));
          })()}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
