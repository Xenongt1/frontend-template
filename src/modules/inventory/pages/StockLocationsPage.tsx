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
import type { StockLocation, StorageLocationStatus } from '@/types';

type StatusFilter = 'All' | StorageLocationStatus;

const STATUS_OPTIONS: StorageLocationStatus[] = ['ACTIVE', 'INACTIVE'];

const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: 500,
    lineHeight: 1.5,
    background: active ? '#F3FAF7' : '#ECECEB',
    border: `1px solid ${active ? '#DEF7EC' : '#C3C3C2'}`,
    color: active ? '#03543F' : '#222220',
    whiteSpace: 'nowrap',
  }}>
    {active ? 'Active' : 'Suspended'}
  </span>
);

const StockLocationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
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
          style={{
            position: 'fixed',
            top: openMenu.top,
            bottom: openMenu.bottom,
            right: openMenu.right,
            zIndex: 1000,
            minWidth: 160,
            background: '#FDFDFD',
            border: '1px solid #E6EAEB',
            borderRadius: 8,
            boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.10), 0px 2px 4px -2px rgba(0,0,0,0.10)',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => { setOpenMenu(null); navigate({ to: `/inventory/stock-locations/${menuLoc.id}` }); }}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', fontFamily: 'Inter', fontWeight: 500, fontSize: 14, lineHeight: 1.5, color: '#08283B', cursor: 'pointer' }}
          >
            View details
          </button>
          <button
            onClick={() => { setOpenMenu(null); navigate({ to: `/inventory/stock-locations/${menuLoc.id}/edit` }); }}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', fontFamily: 'Inter', fontWeight: 500, fontSize: 14, lineHeight: 1.5, color: '#08283B', cursor: 'pointer' }}
          >
            Edit
          </button>
          <div style={{ height: 1, background: '#E6EAEB' }} />
          {menuLoc.status === 'ACTIVE' ? (
            <button
              onClick={() => { setOpenMenu(null); setConfirmAction({ id: menuLoc.id, name: menuLoc.name, action: 'suspend' }); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', fontFamily: 'Inter', fontWeight: 500, fontSize: 14, lineHeight: 1.5, color: '#08283B', cursor: 'pointer' }}
            >
              Suspend location
            </button>
          ) : (
            <button
              onClick={() => { setOpenMenu(null); setConfirmAction({ id: menuLoc.id, name: menuLoc.name, action: 'activate' }); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', fontFamily: 'Inter', fontWeight: 500, fontSize: 14, lineHeight: 1.5, color: '#08283B', cursor: 'pointer' }}
            >
              Activate location
            </button>
          )}
        </div>
      )}

      {activeTooltip && (
        <div style={{ position: 'fixed', top: activeTooltip.top, left: activeTooltip.left, zIndex: 9999, width: 224, background: '#08283B', borderRadius: 8, padding: '10px 12px', pointerEvents: 'none', boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.10)' }}>
          <div style={{ position: 'absolute', top: -8, left: activeTooltip.arrowLeft, transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '8px solid #08283B' }} />
          <p style={{ margin: 0, fontFamily: 'Inter', fontWeight: 400, fontSize: 14, lineHeight: 1.5, color: '#FDFDFD' }}>
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
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 16px', background: '#ECECEB',
        border: '1px solid #B2BCC2', borderRadius: 8, width: 364, boxSizing: 'border-box',
      }}>
        <Search size={16} color="#395362" />
        <input
          type="text"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder={t('stockLocations.list.searchPlaceholder')}
          style={{
            flex: 1, border: 'none', background: 'transparent', outline: 'none',
            fontFamily: 'Inter', fontWeight: 400, fontSize: 14, lineHeight: 1.5, color: '#395362',
          }}
        />
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#395362' }}>Loading…</span>
        </div>
      )}
      {!loading && error && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#B91C1C' }}>{error}</span>
        </div>
      )}

      {/* Empty state — only when no filters active */}
      {!loading && !error && locations.length === 0 && !hasActiveFilters && (

        <div style={{
          background: 'var(--Background-General-Light, #FDFDFD)', borderRadius: 8,
          flex: 1, minHeight: 400, display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '128px 80px', boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, maxWidth: 600, width: '100%' }}>
            <img src={emptyStateIllustration} alt="" style={{ width: 290, height: 220, flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
                <p style={{ margin: 0, fontFamily: 'Poppins, Inter, sans-serif', fontWeight: 500, fontSize: 24, lineHeight: '36px', color: '#041620' }}>
                  {t('stockLocations.list.emptyTitle')}
                </p>
                <p style={{ margin: 0, fontFamily: 'Inter', fontWeight: 400, fontSize: 16, lineHeight: '24px', color: 'var(--Body-Text-Secondary, #395362)' }}>
                  {t('stockLocations.list.emptyDescription')}
                </p>
              </div>
              <button
                onClick={() => navigate({ to: '/inventory/stock-locations/register' })}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', background: 'var(--Buttons-Filled-Dark-Blue-Default, #08283B)',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                }}
              >
                <Plus size={20} color="#FDFDFD" />
                <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 14, lineHeight: '21px', color: '#FDFDFD', whiteSpace: 'nowrap' }}>
                  {t('stockLocations.list.newButton')}
                </span>
              </button>
            </div>
          </div>
        </div>

      )}

      {!loading && !error && (locations.length > 0 || hasActiveFilters) && (

        <div style={{ background: '#FDFDFD', border: '1px solid #E6EAEB', borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Table toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #E6EAEB' }}>
            <p style={{ margin: 0, fontFamily: 'Poppins, Inter, sans-serif', fontWeight: 500, fontSize: 20, lineHeight: 1.5, color: '#041620' }}>
              Locations
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={() => setShowFilterModal(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', background: 'transparent',
                  border: statusFilter !== 'All' ? '1px solid #08283B' : '1px solid #061C2A',
                  borderRadius: 8, cursor: 'pointer', position: 'relative',
                }}
              >
                <ListFilter size={16} color="#061C2A" />
                <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 14, color: '#061C2A' }}>Filter</span>
              </button>
              <button
                onClick={() => navigate({ to: '/inventory/stock-locations/register' })}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', background: 'var(--Buttons-Filled-Dark-Blue-Default, #08283B)',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                }}
              >
                <Plus size={20} color="#FDFDFD" />
                <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 14, lineHeight: '21px', color: '#FDFDFD', whiteSpace: 'nowrap' }}>
                  {t('stockLocations.list.newButton')}
                </span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <thead>
              <tr style={{ background: '#E6EAEB' }}>
                <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #E6EAEB', fontFamily: 'Poppins, Inter, sans-serif', fontWeight: 500, fontSize: 16, color: '#395362', whiteSpace: 'nowrap', width: '50%' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Name <ArrowDownNarrowWide size={16} color="#395362" />
                  </span>
                </th>
                <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #E6EAEB', fontFamily: 'Poppins, Inter, sans-serif', fontWeight: 500, fontSize: 16, color: '#395362', whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Status <ArrowDownNarrowWide size={16} color="#395362" />
                  </span>
                </th>
                <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid #E6EAEB', fontFamily: 'Poppins, Inter, sans-serif', fontWeight: 500, fontSize: 16, color: '#395362', whiteSpace: 'nowrap' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {locations.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '48px 16px', textAlign: 'center', fontFamily: 'Inter', fontSize: 14, color: '#395362' }}>
                    {t('stockLocations.list.noMatch', 'No locations match your filters.')}
                  </td>
                </tr>
              )}
              {locations.map((loc: StockLocation) => (
                <tr
                  key={loc.id}
                  onMouseEnter={() => setHoveredId(loc.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ background: hoveredId === loc.id ? '#ECECEB' : '#FDFDFD', borderBottom: '1px solid #E6EAEB', height: 80, cursor: 'pointer', transition: 'background 0.15s ease' }}
                >
                  <td style={{ padding: 16 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 16, lineHeight: 1.5, color: '#08283B', whiteSpace: 'nowrap' }}>
                        {loc.name}
                      </span>
                      <button
                        onMouseEnter={(e) => handleInfoMouseEnter(loc.id, loc.description ?? '', e)}
                        onMouseLeave={() => setActiveTooltip(null)}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'default', display: 'flex', alignItems: 'center' }}
                        aria-label={`Description for ${loc.name}`}
                      >
                        <Info size={18} color="#395362" />
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: 16 }}>
                    <StatusBadge active={loc.status === 'ACTIVE'} />
                  </td>
                  <td style={{ padding: 16, textAlign: 'right' }}>
                    <button
                      onMouseDown={(e) => handleMenuToggle(loc.id, e)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'inline-flex', alignItems: 'center' }}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
            <p style={{ margin: 0, fontFamily: 'Inter', fontWeight: 400, fontSize: 14, color: '#395362' }}>
              {'Showing '}
              <strong style={{ fontWeight: 600, color: '#08283B' }}>{from}-{to}</strong>
              {' of '}
              <strong style={{ fontWeight: 600, color: '#08283B' }}>{total} locations</strong>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div ref={rowsMenuRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowRowsMenu(p => !p)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#ECECEB', border: '1px solid #B2BCC2', borderRadius: 8, cursor: 'pointer' }}
                  >
                    <span style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 14, lineHeight: 1.25, color: '#5A6F7C' }}>{rowsPerPage}</span>
                    <ChevronDown size={16} color="#5A6F7C" />
                  </button>
                  {showRowsMenu && (
                    <div style={{ position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, background: '#FDFDFD', border: '1px solid #E6EAEB', borderRadius: 8, overflow: 'hidden', zIndex: 200, minWidth: '100%', boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.10)' }}>
                      {[5, 10, 20, 25].map(n => (
                        <button key={n} onClick={() => { setRowsPerPage(n); setPage(1); setShowRowsMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: n === rowsPerPage ? '#ECECEB' : 'none', border: 'none', fontFamily: 'Inter', fontWeight: 500, fontSize: 14, color: '#08283B', cursor: 'pointer' }}>
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 14, lineHeight: 1.5, color: '#395362', whiteSpace: 'nowrap' }}>
                  Rows per page
                </span>
              </div>
              <div style={{ display: 'flex', border: '1px solid #E6EAEB', borderRadius: 4, overflow: 'hidden' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 12px', background: '#FDFDFD', border: 'none', borderRight: '1px solid #E6EAEB', cursor: 'pointer' }}>
                  <ChevronLeft size={20} color="#08283B" />
                </button>
                {getPageItems().map((item, i) => {
                  const isEllipsis = item === '...';
                  const isActive = item === page;
                  return (
                    <button key={`${item}-${i}`} onClick={() => !isEllipsis && setPage(Number(item))} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 12px', minWidth: 32, background: isActive ? '#B2BCC2' : '#FDFDFD', border: 'none', borderRight: '1px solid #E6EAEB', cursor: isEllipsis ? 'default' : 'pointer', fontFamily: 'Inter', fontWeight: 500, fontSize: 14, lineHeight: 1.5, color: isActive ? '#08283B' : '#395362' }}>
                      {item}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 12px', background: '#FDFDFD', border: 'none', cursor: 'pointer' }}>
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
