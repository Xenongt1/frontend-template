import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { InventoryItem } from '../types';
import StatusBadge from './StatusBadge';
import CategoryBadge from './CategoryBadge';
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

const thClass = 'p-4 h-14 text-left font-poppins text-base font-medium leading-6 text-text-tertiary whitespace-nowrap bg-stroke-light border-b border-stroke-light select-none';
const tdClass = 'p-4 h-20 align-middle border-b border-stroke-light font-inter text-base font-normal leading-6 text-text-primary';

const MENU_WIDTH = 160;

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
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
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

  const columns = useMemo<ColumnDef<InventoryItem>[]>(() => [
    {
      id: 'sku',
      accessorFn: (i) => i.sku,
      enableSorting: true,
      sortingFn: 'alphanumeric',
      header: () => t('table.columns.sku'),
      cell: ({ row }) => row.original.sku,
    },
    {
      id: 'name',
      accessorFn: (i) => i.displayName,
      enableSorting: true,
      sortingFn: 'alphanumeric',
      header: () => t('table.columns.name'),
      cell: ({ row }) => row.original.displayName,
    },
    {
      id: 'category',
      enableSorting: false,
      header: () => t('table.columns.category'),
      cell: ({ row }) => <CategoryBadge category={row.original.category} />,
    },
    {
      id: 'unit',
      accessorFn: (i) => i.uomLabel,
      enableSorting: true,
      sortingFn: 'alphanumeric',
      header: () => t('table.columns.unit'),
      cell: ({ row }) => row.original.uomLabel,
    },
    {
      id: 'status',
      accessorFn: (i) => i.status,
      enableSorting: true,
      header: () => t('table.columns.status'),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      enableSorting: false,
      header: () => t('table.columns.actions'),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <>
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
          </>
        );
      },
    },
  ], [t, openMenuId, menuPos, onView, onEdit, onToggleSuspension]);

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const headerLayout: Record<string, { width: string; hideMobile?: boolean; align?: 'center' }> = {
    sku: { width: 'min-w-[110px]' },
    name: { width: 'min-w-[200px]' },
    category: { width: 'min-w-[160px]', hideMobile: true },
    unit: { width: 'min-w-[140px]', hideMobile: true },
    status: { width: 'min-w-[160px]' },
    actions: { width: 'w-20', align: 'center' },
  };

  const renderBody = () => {
    if (loading) return <InventoryTableSkeleton rowCount={skeletonRowCount} />;
    const rows = table.getRowModel().rows;
    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan={columns.length} className="px-4 py-12 text-center text-navy-500 border-b border-canvas-300 text-sm align-middle">
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
    }
    return rows.map((row) => (
      <tr
        key={row.id}
        onClick={() => onView(row.original)}
        className="bg-canvas-50 transition-colors cursor-pointer hover:bg-canvas-100"
      >
        {row.getVisibleCells().map((cell) => {
          const layout = headerLayout[cell.column.id];
          const extras = [
            layout?.hideMobile ? 'hide-on-mobile' : '',
            layout?.align === 'center' ? 'text-center relative' : '',
            cell.column.id === 'unit' ? 'text-navy-600' : '',
          ].filter(Boolean).join(' ');
          return (
            <td key={cell.id} className={`${tdClass} ${extras}`}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          );
        })}
      </tr>
    ));
  };

  return (
    <div
      className="overflow-x-auto w-full"
      ref={menuRef}
      aria-busy={loading}
      aria-live="polite"
    >
      {loading && <span className="sr-only">{t('table.loading')}</span>}
      <table className="w-full border-collapse min-w-[600px]">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const layout = headerLayout[header.column.id];
                const extras = [
                  layout?.width ?? '',
                  layout?.hideMobile ? 'hide-on-mobile' : '',
                  layout?.align === 'center' ? 'text-center' : '',
                ].filter(Boolean).join(' ');
                return (
                  <th key={header.id} className={`${thClass} ${extras}`}>
                    {canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 bg-transparent border-0 p-0 cursor-pointer font-poppins text-base font-medium leading-6 text-text-tertiary"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <SortIcon />
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>{renderBody()}</tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
