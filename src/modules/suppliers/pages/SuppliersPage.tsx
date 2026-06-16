import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supplierApi } from '@/core/api';
import type { Supplier, SupplierStatus } from '@/core/api';
import { ConfirmDialog } from '@/shared/components/ui';
import { useSuppliers } from '../hooks/useSuppliers';


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

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);


const SupplierStatusBadge: React.FC<{ status?: SupplierStatus }> = ({ status }) => {
  const { t } = useTranslation();
  if (status === 'SUSPENDED') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium whitespace-nowrap bg-[#FDF2F2] border border-[#FDE8E8] text-[#9B1C1C]">
        {t('suppliers.list.badgeSuspended')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium whitespace-nowrap bg-[#F3FAF7] border border-[#DEF7EC] text-[#03543F]">
      {t('suppliers.list.badgeActive')}
    </span>
  );
};


const SkeletonRow: React.FC = () => (
  <tr className="bg-canvas-50 animate-pulse">
    {Array.from({ length: 5 }).map((_, i) => (
      <td key={i} className="px-4 h-20 align-middle border-b border-canvas-300">
        <div className={`h-4 bg-canvas-300 rounded ${i === 1 ? 'rounded-full w-16' : i === 3 ? 'w-36' : 'w-3/4'}`} />
      </td>
    ))}
  </tr>
);


type PageEntry = number | 'ellipsis-l' | 'ellipsis-r';

function buildPageNumbers(page: number, total: number): PageEntry[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: PageEntry[] = [1];
  if (page > 3) pages.push('ellipsis-l');
  for (let p = Math.max(2, page - 1); p <= Math.min(total - 1, page + 1); p++) pages.push(p);
  if (page < total - 2) pages.push('ellipsis-r');
  pages.push(total);
  return pages;
}


const MENU_WIDTH = 184;

const SuppliersPage: React.FC = () => {
  const navigate   = useNavigate();
  const queryClient = useQueryClient();
  const { t }      = useTranslation();

  const {
    suppliers, loading, error, total,
    allMaterials, filters, pagination, totalPages, pageSizeOptions,
    updateSearch, updateStatus, toggleMaterial, clearFilters,
    goToPage, changePageSize, reload,
    materialSearchInput, setMaterialSearchInput, materialsLoading,
  } = useSuppliers();

  // ── Action mutations ──────────────────────────────────────────────────────
  const suspendMutation = useMutation({
    mutationFn: (id: string) => supplierApi.suspendSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      reload();
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => supplierApi.activateSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      reload();
    },
  });

  const [suspendTarget, setSuspendTarget] = useState<Supplier | null>(null);
  const [activateTarget, setActivateTarget] = useState<Supplier | null>(null);

  // ── Dropdown state ────────────────────────────────────────────────────────
  const [statusOpen,   setStatusOpen]   = useState(false);
  const [materialOpen, setMaterialOpen] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos,    setMenuPos]    = useState<{ top: number; left: number } | null>(null);

  const tableRef   = useRef<HTMLDivElement>(null);
  const statusRef  = useRef<HTMLDivElement>(null);
  const materialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const t = e.target as Node;
      if (tableRef.current   && !tableRef.current.contains(t))   { setOpenMenuId(null); setMenuPos(null); }
      if (statusRef.current  && !statusRef.current.contains(t))  setStatusOpen(false);
      if (materialRef.current && !materialRef.current.contains(t)) setMaterialOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  useEffect(() => {
    if (!openMenuId) return;
    const close = () => { setOpenMenuId(null); setMenuPos(null); };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [openMenuId]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const openMenuFor = (id: string, btn: HTMLButtonElement) => {
    const rect = btn.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, left: Math.max(8, rect.right - MENU_WIDTH) });
    setOpenMenuId(id);
  };
  const closeMenu = () => { setOpenMenuId(null); setMenuPos(null); };

  const handleToggleSuspension = (s: Supplier) => {
    closeMenu();
    s.status === 'SUSPENDED' ? setActivateTarget(s) : setSuspendTarget(s);
  };

  const hasFilters = filters.status !== '' || filters.materials.length > 0;


  const { page, pageSize } = pagination;
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd   = Math.min(page * pageSize, total);

  const statusOptions = [
    { value: '' as SupplierStatus | '',         label: t('suppliers.list.allStatuses') },
    { value: 'ACTIVE' as SupplierStatus | '',   label: t('suppliers.list.badgeActive') },
    { value: 'SUSPENDED' as SupplierStatus | '', label: t('suppliers.list.badgeSuspended') },
  ];

  const thClass = 'px-4 py-3 text-left text-[13px] font-semibold text-navy-600 whitespace-nowrap bg-canvas-300 border-b border-canvas-300 select-none';
  const tdClass = 'px-4 h-20 align-middle border-b border-canvas-300 text-sm text-navy-900';

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-surface-page p-6 flex flex-col gap-4 box-border">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="m-0 font-inter font-semibold text-lg leading-7 text-brand-navy-dark">
          {t('suppliers.list.title')}
        </h1>
        <p className="m-0 font-inter font-normal text-sm text-text-primary">
          {t('suppliers.list.subtitle')}
        </p>
      </div>

      {error && (
        <p className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-800 m-0">{error}</p>
      )}

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] text-navy-600 whitespace-nowrap">filter(s)</span>

          {filters.status && (
            <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-canvas-200 border border-canvas-300 rounded-full text-[13px] text-navy-900">
              {filters.status === 'ACTIVE' ? t('suppliers.list.badgeActive') : t('suppliers.list.badgeSuspended')}
              <button
                type="button"
                onClick={() => updateStatus('')}
                className="inline-flex items-center justify-center w-4 h-4 border-none bg-transparent cursor-pointer text-navy-500 hover:text-navy-900"
                aria-label="Remove status filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.materials.map(id => {
            const material = allMaterials.find(m => m.id === id);
            if (!material) return null;
            return (
              <span key={id} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-canvas-200 border border-canvas-300 rounded-full text-[13px] text-navy-900">
                {material.name}
                <button
                  type="button"
                  onClick={() => toggleMaterial(id)}
                  className="inline-flex items-center justify-center w-4 h-4 border-none bg-transparent cursor-pointer text-navy-500 hover:text-navy-900"
                  aria-label={`Remove ${material.name} filter`}
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}

          <button
            type="button"
            onClick={clearFilters}
            className="text-[13px] text-navy-600 underline underline-offset-2 border-none bg-transparent cursor-pointer hover:text-navy-900 whitespace-nowrap"
          >
            Clear filter(s)
          </button>
        </div>
      )}

      {/* Card */}
      <div className="bg-surface-card rounded-lg flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-canvas-300 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder pointer-events-none" />
            <input
              type="text"
              value={filters.search}
              onChange={e => updateSearch(e.target.value)}
              placeholder={t('suppliers.list.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 bg-surface-overlay border border-stroke-medium rounded-lg text-sm text-text-primary placeholder:text-text-placeholder outline-none focus:border-stroke-focus"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {/* Material types */}
            <div className="relative" ref={materialRef}>
              <button
                type="button"
                onClick={() => setMaterialOpen(p => !p)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-stroke-medium rounded-lg bg-surface-card text-sm text-text-primary cursor-pointer whitespace-nowrap hover:bg-canvas-100 transition-colors"
              >
                {filters.materials.length > 0
                  ? `${filters.materials.length} material${filters.materials.length > 1 ? 's' : ''}`
                  : t('suppliers.list.allMaterialTypes')}
                <ChevronDown size={14} className="text-text-secondary shrink-0" />
              </button>
              {materialOpen && (
                <div className="absolute top-full mt-1 left-0 z-50 bg-surface-card border border-stroke-medium rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.10)] py-2 w-64">
                  <div className="px-3 pb-2">
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-placeholder pointer-events-none" />
                      <input
                        type="text"
                        value={materialSearchInput}
                        onChange={e => setMaterialSearchInput(e.target.value)}
                        placeholder={t('suppliers.list.searchMaterial')}
                        className="w-full pl-8 pr-3 py-1.5 bg-surface-overlay border border-stroke-medium rounded-md text-[13px] text-text-primary placeholder:text-text-placeholder outline-none focus:border-stroke-focus"
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {materialsLoading ? (
                      <p className="px-3 py-2 text-[13px] text-navy-400">{t('common.loading')}</p>
                    ) : allMaterials.length === 0 ? (
                      <p className="px-3 py-2 text-[13px] text-navy-400">{t('suppliers.list.noMaterials')}</p>
                    ) : (
                      allMaterials.map(m => (
                        <label key={m.id} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-canvas-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={filters.materials.includes(m.id)}
                            onChange={() => toggleMaterial(m.id)}
                            className="w-4 h-4 rounded border-stroke-medium accent-brand-navy cursor-pointer"
                          />
                          <span className="text-[13px] text-text-primary">{m.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Status filter */}
            <div className="relative" ref={statusRef}>
              <button
                type="button"
                onClick={() => setStatusOpen(p => !p)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-stroke-medium rounded-lg bg-surface-card text-sm text-text-primary cursor-pointer whitespace-nowrap hover:bg-canvas-100 transition-colors"
              >
                {filters.status === 'ACTIVE'
                  ? t('suppliers.list.badgeActive')
                  : filters.status === 'SUSPENDED'
                  ? t('suppliers.list.badgeSuspended')
                  : t('suppliers.list.allStatuses')}
                <ChevronDown size={14} className="text-text-secondary shrink-0" />
              </button>
              {statusOpen && (
                <div className="absolute top-full mt-1 left-0 z-50 bg-surface-card border border-stroke-medium rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.10)] py-1 min-w-[160px]">
                  {statusOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { updateStatus(opt.value as SupplierStatus | ''); setStatusOpen(false); }}
                      className={`block w-full text-left px-4 py-2.5 text-sm cursor-pointer hover:bg-canvas-100 transition-colors ${filters.status === opt.value ? 'font-semibold text-brand-navy' : 'text-text-primary'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* New supplier */}
            <button
              type="button"
              onClick={() => navigate({ to: '/suppliers/register' })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy border-none rounded-lg cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity"
            >
              <Plus size={16} color="#FDFDFD" />
              <span className="font-inter font-medium text-sm text-surface-card">{t('suppliers.list.newButton')}</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full" ref={tableRef}>
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className={`${thClass} min-w-[160px]`}>
                  <span className="inline-flex items-center gap-1.5">{t('suppliers.list.colCompanyName')} <SortIcon /></span>
                </th>
                <th className={`${thClass} min-w-[130px]`}>
                  <span className="inline-flex items-center gap-1.5">{t('suppliers.list.colStatus')} <SortIcon /></span>
                </th>
                <th className={`${thClass} min-w-[220px]`}>
                  <span className="inline-flex items-center gap-1.5">{t('suppliers.list.colSupplierName')} <SortIcon /></span>
                </th>
                <th className={`${thClass} min-w-[220px]`}>
                  <span className="inline-flex items-center gap-1.5">{t('suppliers.list.colApprovedMaterials')} <SortIcon /></span>
                </th>
                <th className={`${thClass} w-20 text-center`}>{t('suppliers.list.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: pageSize }).map((_, i) => <SkeletonRow key={i} />)}

              {!loading && suppliers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-navy-500 text-sm border-b border-canvas-300">
                    {t('suppliers.list.empty')}
                  </td>
                </tr>
              )}

              {!loading && suppliers.map(s => {
                const items    = s.approvedItems ?? [];
                const firstName = items[0]?.name ?? null;
                const extra    = items.length > 1 ? items.length - 1 : 0;
                const isSuspended = s.status === 'SUSPENDED';

                return (
                  <tr key={s.id} className="bg-canvas-50 transition-colors hover:bg-canvas-100">
                    <td className={`${tdClass} font-medium`}>
                      {s.companyName || <span className="text-navy-300">—</span>}
                    </td>
                    <td className={tdClass}>
                      <SupplierStatusBadge status={s.status} />
                    </td>
                    <td className={tdClass}>
                      <div className="font-medium text-navy-900">{s.fullName}</div>
                      <div className="text-[13px] text-navy-500 mt-0.5">{s.email}</div>
                    </td>
                    <td className={tdClass}>
                      {firstName ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 bg-[#E6F4F1] border border-[#B2D8D2] rounded text-[13px] text-[#1A5C54] whitespace-nowrap">
                            {firstName}
                          </span>
                          {extra > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-canvas-200 border border-canvas-300 rounded-full text-[13px] text-navy-600 font-medium whitespace-nowrap">
                              +{extra}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-navy-300">—</span>
                      )}
                    </td>
                    <td className={`${tdClass} text-center`}>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          openMenuId === s.id ? closeMenu() : openMenuFor(s.id, e.currentTarget);
                        }}
                        className="inline-flex items-center justify-center w-8 h-8 border-none bg-transparent rounded-md cursor-pointer text-navy-600 hover:bg-canvas-300 transition-colors"
                        aria-label="Open actions"
                      >
                        <DotsIcon />
                      </button>

                      {openMenuId === s.id && menuPos && (
                        <div
                          role="menu"
                          className="z-50 bg-surface-card border border-stroke-medium rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.10)] py-1"
                          style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, width: MENU_WIDTH }}
                          onClick={e => e.stopPropagation()}
                          onKeyDown={e => e.stopPropagation()}
                        >
                          <button role="menuitem" type="button"
                            onClick={() => { navigate({ to: '/suppliers/$id', params: { id: s.id } }); closeMenu(); }}
                            className="block w-full text-left px-4 py-2.5 border-none bg-transparent text-sm text-navy-900 cursor-pointer hover:bg-canvas-100"
                          >
                            {t('suppliers.list.viewDetails')}
                          </button>
                          <button role="menuitem" type="button"
                            onClick={() => { navigate({ to: '/suppliers/$id/edit', params: { id: s.id } }); closeMenu(); }}
                            className="block w-full text-left px-4 py-2.5 border-none bg-transparent text-sm text-navy-900 cursor-pointer hover:bg-canvas-100"
                          >
                            {t('suppliers.list.editAction')}
                          </button>
                          <div className="h-px bg-canvas-300 my-1" />
                          <button role="menuitem" type="button"
                            onClick={() => handleToggleSuspension(s)}
                            className="block w-full text-left px-4 py-2.5 border-none bg-transparent text-sm text-navy-900 cursor-pointer hover:bg-canvas-100"
                          >
                            {isSuspended ? t('suppliers.list.activate') : t('suppliers.list.suspend')}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-canvas-300 gap-3 flex-wrap">
            <span className="text-[13px] text-navy-600 whitespace-nowrap">
              {t('suppliers.list.showing', { start: rangeStart, end: rangeEnd, total })}
            </span>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={e => changePageSize(Number(e.target.value))}
                  className="px-2.5 py-[5px] bg-canvas-200 border border-navy-300 rounded-md text-[13px] text-navy-900 cursor-pointer outline-none"
                >
                  {pageSizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="text-[13px] text-navy-500 whitespace-nowrap">Rows per page</span>
              </div>

              <div className="flex items-center gap-1">
                <button type="button" onClick={() => goToPage(page - 1)} disabled={page === 1}
                  className="inline-flex items-center justify-center w-8 h-8 border border-canvas-300 rounded-md bg-canvas-50 text-navy-600 hover:bg-canvas-100 hover:border-navy-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon />
                </button>

                {buildPageNumbers(page, totalPages).map((p, idx) =>
                  typeof p === 'string' ? (
                    <span key={p + idx} className="inline-flex items-center justify-center min-w-8 h-8 px-1 text-[13px] text-navy-300">…</span>
                  ) : (
                    <button key={p} type="button" onClick={() => goToPage(p)}
                      className={`inline-flex items-center justify-center min-w-8 h-8 px-1 rounded-md text-[13px] transition-colors border ${
                        p === page
                          ? 'bg-navy-300 text-navy-900 font-semibold border-navy-300'
                          : 'bg-transparent text-navy-600 font-normal border-transparent hover:bg-canvas-200'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button type="button" onClick={() => goToPage(page + 1)} disabled={page === totalPages}
                  className="inline-flex items-center justify-center w-8 h-8 border border-canvas-300 rounded-md bg-canvas-50 text-navy-600 hover:bg-canvas-100 hover:border-navy-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={suspendTarget !== null}
        title={t('suppliers.suspend.title')}
        description={t('suppliers.suspend.description')}
        confirmLabel={t('suppliers.suspend.confirm')}
        cancelLabel={t('suppliers.suspend.cancel')}
        danger
        loading={suspendMutation.isPending}
        onConfirm={() => {
          if (suspendTarget) {
            suspendMutation.mutate(suspendTarget.id, { onSuccess: () => setSuspendTarget(null) });
          }
        }}
        onCancel={() => setSuspendTarget(null)}
      />

      <ConfirmDialog
        open={activateTarget !== null}
        title={t('suppliers.activate.title')}
        description={t('suppliers.activate.description')}
        confirmLabel={t('suppliers.activate.confirm')}
        cancelLabel={t('suppliers.activate.cancel')}
        loading={activateMutation.isPending}
        onConfirm={() => {
          if (activateTarget) {
            activateMutation.mutate(activateTarget.id, { onSuccess: () => setActivateTarget(null) });
          }
        }}
        onCancel={() => setActivateTarget(null)}
      />
    </div>
  );
};

export default SuppliersPage;
