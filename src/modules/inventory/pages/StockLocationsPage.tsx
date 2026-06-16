import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  Plus, Search, Info, MoreVertical, ListFilter,
  ArrowDownNarrowWide, ChevronDown, ChevronLeft, ChevronRight,
} from 'lucide-react';
import emptyStateIllustration from '@/assert/Empty-state-illustration.svg';
import InventoryPageShell, { InventoryPageHeader } from '../components/InventoryPageShell';
import StockLocationFilterModal from '../components/StockLocationFilterModal';
import { storageLocationApi } from '@/core/api';
import { ConfirmDialog, SuccessToast } from '@/shared/components/ui';
import Button from '@/shared/components/ui/Button';
import type { StockLocation, StorageLocationStatus } from '@/types';

type StatusFilter = 'All' | StorageLocationStatus;

const STATUS_OPTIONS: StorageLocationStatus[] = ['ACTIVE', 'INACTIVE'];

// Status badge bg/border/text aren't in the project's design tokens yet;
// keep the literal hexes here (matches Figma) and revisit once tokens land.
const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => (
  <span
    className={[
      'inline-flex items-center justify-center px-2.5 py-0.5 rounded-md',
      'font-inter text-xs font-medium leading-[1.5] whitespace-nowrap border',
      active
        ? 'bg-[#F3FAF7] border-[#DEF7EC] text-[#03543F]'
        : 'bg-canvas-200 border-[#C3C3C2] text-[#222220]',
    ].join(' ')}
  >
    {active ? 'Active' : 'Suspended'}
  </span>
);

const menuItemClass =
  'block w-full text-left px-4 py-2 bg-transparent border-none cursor-pointer ' +
  'font-inter text-sm font-medium leading-[1.5] text-text-primary ' +
  'transition-colors duration-150 hover:bg-canvas-200';

const StockLocationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activeTooltip, setActiveTooltip] = useState<{
    id: string; description: string; top: number; left: number; arrowLeft: number;
  } | null>(null);

  const handleInfoMouseEnter = (
    id: string, description: string, e: React.MouseEvent<HTMLButtonElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipWidth = 224;
    const iconCenterX = rect.left + rect.width / 2;
    let tooltipLeft = iconCenterX - tooltipWidth / 2;
    tooltipLeft = Math.max(8, Math.min(window.innerWidth - tooltipWidth - 8, tooltipLeft));
    setActiveTooltip({ id, description, top: rect.bottom + 8, left: tooltipLeft, arrowLeft: iconCenterX - tooltipLeft });
  };

  const [openMenu, setOpenMenu] = useState<{
    id: string;
    top?: number;
    bottom?: number;
    right: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showRowsMenu, setShowRowsMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const rowsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
      if (rowsMenuRef.current && !rowsMenuRef.current.contains(e.target as Node)) {
        setShowRowsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const MENU_HEIGHT = 116;
  const handleMenuToggle = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (openMenu?.id === id) { setOpenMenu(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const right = window.innerWidth - rect.right;
    if (window.innerHeight - rect.bottom < MENU_HEIGHT) {
      setOpenMenu({ id, bottom: window.innerHeight - rect.top + 4, right });
    } else {
      setOpenMenu({ id, top: rect.bottom + 4, right });
    }
  };

  const [locations, setLocations] = useState<StockLocation[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    let active: boolean | undefined;
    if (statusFilter === 'ACTIVE') active = true;
    else if (statusFilter === 'INACTIVE') active = false;
    storageLocationApi.getStorageLocations({ page, size: rowsPerPage, search: debouncedSearch, active })
      .then(res => {
        if (cancelled) return;
        setLocations(res.data);
        setTotal(res.pagination.totalItems);
        setTotalPages(res.pagination.totalPages);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err?.message ?? 'Failed to load locations');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, rowsPerPage, debouncedSearch, statusFilter]);

  const hasActiveFilters = statusFilter !== 'All' || debouncedSearch !== '';

  const from = total === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const to = Math.min(page * rowsPerPage, total);

  const handleSearch = (value: string) => { setSearch(value); setPage(1); };

  const getPageItems = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, '...', totalPages];
    if (page >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  const menuLoc = openMenu ? locations.find(l => l.id === openMenu.id) ?? null : null;

  const [confirmAction, setConfirmAction] = useState<{ id: string; name: string; action: 'suspend' | 'activate' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      const updated = confirmAction.action === 'suspend'
        ? await storageLocationApi.suspendStorageLocation(confirmAction.id)
        : await storageLocationApi.activateStorageLocation(confirmAction.id);
      setLocations(prev => prev.map(loc => loc.id === updated.id ? updated : loc));
      setToastMessage(
        confirmAction.action === 'suspend'
          ? t('stockLocations.suspend.successToast')
          : t('stockLocations.activate.successToast')
      );
      setConfirmAction(null);
    } catch {
      // error surfaces to the user via the existing error state on reload
    } finally {
      setActionLoading(false);
    }
  };

  const thClass =
    'px-4 py-4 text-left border-b border-stroke-light ' +
    'font-poppins text-base font-medium text-text-secondary whitespace-nowrap';
  const tdClass = 'p-4';

  return (
    <>
      {toastMessage && (
        <SuccessToast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
      <ConfirmDialog
        open={confirmAction !== null}
        title={
          confirmAction?.action === 'suspend'
            ? t('stockLocations.suspend.confirmTitle')
            : t('stockLocations.activate.confirmTitle')
        }
        description={
          confirmAction?.action === 'suspend'
            ? t('stockLocations.suspend.confirmDescription', { name: confirmAction?.name })
            : t('stockLocations.activate.confirmDescription', { name: confirmAction?.name })
        }
        confirmLabel={
          confirmAction?.action === 'suspend'
            ? t('stockLocations.suspend.confirmButton')
            : t('stockLocations.activate.confirmButton')
        }
        danger={confirmAction?.action === 'suspend'}
        loading={actionLoading}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Row action menu — fixed to escape overflow:hidden */}
      {openMenu && menuLoc && (
        <div
          ref={menuRef}
          style={{ top: openMenu.top, bottom: openMenu.bottom, right: openMenu.right }}
          className="fixed z-[1000] min-w-[160px] bg-canvas-50 border border-stroke-light rounded-lg overflow-hidden shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),_0px_2px_4px_-2px_rgba(0,0,0,0.10)]"
        >
          <button
            type="button"
            onClick={() => { setOpenMenu(null); navigate({ to: `/inventory/stock-locations/${menuLoc.id}` }); }}
            className={menuItemClass}
          >
            View details
          </button>
          <button
            type="button"
            onClick={() => { setOpenMenu(null); navigate({ to: `/inventory/stock-locations/${menuLoc.id}/edit` }); }}
            className={menuItemClass}
          >
            Edit
          </button>
          <div className="h-px bg-stroke-light" />
          {menuLoc.status === 'ACTIVE' ? (
            <button
              type="button"
              onClick={() => { setOpenMenu(null); setConfirmAction({ id: menuLoc.id, name: menuLoc.name, action: 'suspend' }); }}
              className={menuItemClass}
            >
              Suspend location
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setOpenMenu(null); setConfirmAction({ id: menuLoc.id, name: menuLoc.name, action: 'activate' }); }}
              className={menuItemClass}
            >
              Activate location
            </button>
          )}
        </div>
      )}

      {/* Tooltip — fixed positioning is computed at runtime */}
      {activeTooltip && (
        <div
          style={{ top: activeTooltip.top, left: activeTooltip.left }}
          className="fixed z-[9999] w-56 bg-brand-navy rounded-lg px-3 py-2.5 pointer-events-none shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10)]"
        >
          <div
            style={{ left: activeTooltip.arrowLeft }}
            className="absolute -top-2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-l-transparent border-r-transparent border-b-8 border-b-brand-navy"
          />
          <p className="m-0 font-inter text-sm font-normal leading-[1.5] text-canvas-50">
            {activeTooltip.description}
          </p>
        </div>
      )}

      <InventoryPageShell>
        <InventoryPageHeader
          title={t('stockLocations.list.title')}
          subtitle={t('stockLocations.list.subtitle')}
        />

        {/* Search bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-canvas-200 border border-stroke-medium rounded-lg w-[364px] box-border">
          <Search size={16} color="#395362" />
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder={t('stockLocations.list.searchPlaceholder')}
            className="flex-1 bg-transparent border-none outline-none font-inter text-sm font-normal leading-[1.5] text-text-secondary"
          />
        </div>

        {loading && (
          <div className="flex justify-center p-12">
            <span className="font-inter text-sm text-text-secondary">Loading…</span>
          </div>
        )}
        {!loading && error && (
          <div className="flex justify-center p-12">
            <span className="font-inter text-sm text-[#B91C1C]">{error}</span>
          </div>
        )}

        {/* Empty state — only when no filters active */}
        {!loading && !error && locations.length === 0 && !hasActiveFilters && (
          <div className="bg-surface-card rounded-lg flex-1 min-h-[400px] flex items-center justify-center px-20 py-32 box-border">
            <div className="flex flex-col items-center gap-6 max-w-[600px] w-full">
              <img src={emptyStateIllustration} alt="" className="w-[290px] h-[220px] shrink-0" />
              <div className="flex flex-col items-center gap-6 w-full">
                <div className="flex flex-col gap-2 text-center">
                  <p className="m-0 font-poppins text-2xl font-medium leading-9 text-brand-navy-dark">
                    {t('stockLocations.list.emptyTitle')}
                  </p>
                  <p className="m-0 font-inter text-base font-normal leading-6 text-text-secondary">
                    {t('stockLocations.list.emptyDescription')}
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => navigate({ to: '/inventory/stock-locations/register' })}
                  leftIcon={<Plus size={20} />}
                >
                  {t('stockLocations.list.newButton')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (locations.length > 0 || hasActiveFilters) && (
          <div className="bg-surface-card border border-stroke-light rounded-lg flex flex-col overflow-hidden">

            {/* Table toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stroke-light">
              <p className="m-0 font-poppins text-xl font-medium leading-[1.5] text-brand-navy-dark">
                Locations
              </p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowFilterModal(true)}
                  className={[
                    'relative inline-flex items-center gap-2 px-5 py-2.5 rounded-lg cursor-pointer',
                    'bg-transparent transition-colors duration-150 hover:bg-canvas-200',
                    'font-inter text-sm font-medium text-brand-navy-mid',
                    statusFilter !== 'All' ? 'border border-brand-navy' : 'border border-brand-navy-mid',
                  ].join(' ')}
                >
                  <ListFilter size={16} color="#061C2A" />
                  <span>Filter</span>
                </button>
                <Button
                  variant="primary"
                  onClick={() => navigate({ to: '/inventory/stock-locations/register' })}
                  leftIcon={<Plus size={20} />}
                >
                  {t('stockLocations.list.newButton')}
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[480px]">
                <thead>
                  <tr className="bg-stroke-light">
                    <th className={`${thClass} w-1/2`}>
                      <span className="inline-flex items-center gap-1.5">
                        Name <ArrowDownNarrowWide size={16} color="#395362" />
                      </span>
                    </th>
                    <th className={thClass}>
                      <span className="inline-flex items-center gap-1.5">
                        Status <ArrowDownNarrowWide size={16} color="#395362" />
                      </span>
                    </th>
                    <th className={`${thClass} text-right`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {locations.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-12 text-center font-inter text-sm text-text-secondary">
                        {t('stockLocations.list.noMatch', 'No locations match your filters.')}
                      </td>
                    </tr>
                  )}
                  {locations.map((loc: StockLocation) => (
                    <tr
                      key={loc.id}
                      className="bg-canvas-50 hover:bg-canvas-200 border-b border-stroke-light h-20 cursor-pointer transition-colors duration-150"
                    >
                      <td className={tdClass}>
                        <div className="inline-flex items-center gap-2">
                          <span className="font-inter text-base font-normal leading-[1.5] text-text-primary whitespace-nowrap">
                            {loc.name}
                          </span>
                          <button
                            type="button"
                            onMouseEnter={(e) => handleInfoMouseEnter(loc.id, loc.description ?? '', e)}
                            onMouseLeave={() => setActiveTooltip(null)}
                            className="bg-transparent border-none p-0 cursor-default flex items-center"
                            aria-label={`Description for ${loc.name}`}
                          >
                            <Info size={18} color="#395362" />
                          </button>
                        </div>
                      </td>
                      <td className={tdClass}>
                        <StatusBadge active={loc.status === 'ACTIVE'} />
                      </td>
                      <td className={`${tdClass} text-right`}>
                        <button
                          type="button"
                          onMouseDown={(e) => handleMenuToggle(loc.id, e)}
                          className="bg-transparent border-none cursor-pointer p-2 rounded-lg inline-flex items-center transition-colors duration-150 hover:bg-stroke-light"
                          aria-label="Row actions"
                        >
                          <MoreVertical size={16} color="#08283B" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between p-4">
              <p className="m-0 font-inter text-sm font-normal text-text-secondary">
                {'Showing '}
                <strong className="font-semibold text-text-primary">{from}-{to}</strong>
                {' of '}
                <strong className="font-semibold text-text-primary">{total} locations</strong>
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div ref={rowsMenuRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setShowRowsMenu(p => !p)}
                      className="inline-flex items-center gap-2.5 px-4 py-3 bg-canvas-200 border border-stroke-medium rounded-lg cursor-pointer transition-colors duration-150 hover:bg-canvas-300"
                    >
                      <span className="font-inter text-sm font-normal leading-tight text-text-tertiary">{rowsPerPage}</span>
                      <ChevronDown size={16} color="#5A6F7C" />
                    </button>
                    {showRowsMenu && (
                      <div className="absolute bottom-[calc(100%+4px)] left-0 bg-canvas-50 border border-stroke-light rounded-lg overflow-hidden z-[200] min-w-full shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10)]">
                        {[5, 10, 20, 25].map(n => (
                          <button
                            type="button"
                            key={n}
                            onClick={() => { setRowsPerPage(n); setPage(1); setShowRowsMenu(false); }}
                            className={[
                              'block w-full text-left px-4 py-2 border-none cursor-pointer',
                              'font-inter text-sm font-medium text-text-primary',
                              'transition-colors duration-150',
                              n === rowsPerPage ? 'bg-canvas-200' : 'bg-transparent hover:bg-canvas-200',
                            ].join(' ')}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-inter text-sm font-normal leading-[1.5] text-text-secondary whitespace-nowrap">
                    Rows per page
                  </span>
                </div>
                <div className="flex border border-stroke-light rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="flex items-center justify-center px-3 py-1.5 bg-canvas-50 border-none border-r border-r-stroke-light cursor-pointer transition-colors duration-150 hover:bg-canvas-200"
                  >
                    <ChevronLeft size={20} color="#08283B" />
                  </button>
                  {getPageItems().map((item, i) => {
                    const isEllipsis = item === '...';
                    const isActive = item === page;
                    return (
                      <button
                        type="button"
                        key={`${item}-${i}`}
                        onClick={() => !isEllipsis && setPage(Number(item))}
                        className={[
                          'flex items-center justify-center px-3 py-1.5 min-w-8',
                          'border-none border-r border-r-stroke-light',
                          'font-inter text-sm font-medium leading-[1.5]',
                          'transition-colors duration-150',
                          isActive
                            ? 'bg-stroke-medium text-text-primary cursor-pointer'
                            : 'bg-canvas-50 text-text-secondary hover:bg-canvas-200',
                          isEllipsis ? 'cursor-default' : 'cursor-pointer',
                        ].join(' ')}
                      >
                        {item}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="flex items-center justify-center px-3 py-1.5 bg-canvas-50 border-none cursor-pointer transition-colors duration-150 hover:bg-canvas-200"
                  >
                    <ChevronRight size={20} color="#08283B" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <StockLocationFilterModal
          isOpen={showFilterModal}
          currentStatus={statusFilter}
          statusOptions={STATUS_OPTIONS}
          onApply={(s) => { setStatusFilter(s); setPage(1); }}
          onClose={() => setShowFilterModal(false)}
        />
      </InventoryPageShell>
    </>
  );
};

export default StockLocationsPage;
