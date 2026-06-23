import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreVertical, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { Member, MemberStatus } from '../api/usersApi';

interface Props {
  items: Member[];
  loading?: boolean;
  skeletonRowCount?: number;
  onSuspend: (member: Member) => void;
  onActivate: (member: Member) => void;
  onViewDetails?: (member: Member) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0][0] ?? '?').toUpperCase();
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
}

function formatLastActive(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STATUS_BADGE: Record<MemberStatus, { bg: string; text: string; dot: string }> = {
  ACTIVE:    { bg: '#ECFDF5', text: '#00684A', dot: '#00A870' },
  INVITED:   { bg: '#FFFBEB', text: '#92400E', dot: '#D97706' },
  SUSPENDED: { bg: '#FEF2F2', text: '#991B1B', dot: '#EF4444' },
};

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  admin:           { bg: '#EDEBFE', text: '#5521B5', border: '#EDEBFE' },
  manager:         { bg: '#FFF9E6', text: '#8C6900', border: '#FFEBB0' },
  viewer:          { bg: '#F0F5FF', text: '#020769', border: '#E5EDFF' },
  'store officer': { bg: '#F3FAF7', text: '#03543F', border: '#DEF7EC' },
};

function getRoleBadgeColors(role: string): { bg: string; text: string; border: string } {
  return ROLE_COLORS[role.toLowerCase()] ?? { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };
}

const MAX_VISIBLE_ROLES = 1;

const thBase = "px-4 h-[52px] text-left text-[13px] font-medium text-[#395362] bg-[#E6EAEB] border-b border-[#E6EAEB] whitespace-nowrap font-['Inter']";
const tdBase = "px-4 h-16 align-middle border-b border-[#E6EAEB] bg-white text-[14px] font-['Inter']";

// Activity timestamp used for the lastActive column's sort.
function memberLastActiveTs(m: Member): number {
  const iso = m.lastSignInAt ?? m.invitedAt;
  const ts = iso ? new Date(iso).getTime() : NaN;
  return Number.isFinite(ts) ? ts : 0;
}

const MembersTable: React.FC<Props> = ({
  items,
  loading = false,
  skeletonRowCount = 8,
  onSuspend,
  onActivate,
  onViewDetails,
}) => {
  const { t } = useTranslation();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const skeletonKeys = useMemo(
    () => Array.from({ length: skeletonRowCount }, () => crypto.randomUUID()),
    [skeletonRowCount],
  );

  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const columns = useMemo<ColumnDef<Member>[]>(() => [
    {
      id: 'select',
      enableSorting: false,
      size: 48,
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          ref={(el) => { if (el) el.indeterminate = table.getIsSomeRowsSelected(); }}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="w-4 h-4 rounded border-[#B2BCC2] cursor-pointer accent-[#08283B]"
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="w-4 h-4 rounded border-[#B2BCC2] cursor-pointer accent-[#08283B]"
          aria-label={`Select ${row.original.fullName}`}
        />
      ),
    },
    {
      id: 'member',
      accessorFn: (m) => m.fullName,
      enableSorting: true,
      sortingFn: 'alphanumeric',
      header: () => t('users.members.columns.member'),
      cell: ({ row }) => {
        const m = row.original;
        return (
          <div className="flex items-center gap-3">
            {m.imageUrl ? (
              <img src={m.imageUrl} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 select-none"
                style={{
                  background: '#F0F2F4',
                  border: '1px solid #C8D0D6',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#4B5563',
                  fontFamily: 'Inter',
                  letterSpacing: '0.02em',
                }}
                aria-hidden="true"
              >
                {getInitials(m.fullName)}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-[14px] text-[#041620] truncate">{m.fullName}</span>
              <span className="text-[13px] text-[#395362] truncate">{m.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'roles',
      enableSorting: false,
      header: () => t('users.members.columns.roles'),
      cell: ({ row }) => {
        const m = row.original;
        const visibleRoles = m.roles.slice(0, MAX_VISIBLE_ROLES);
        const overflowCount = m.roles.length - MAX_VISIBLE_ROLES;
        if (m.roles.length === 0) {
          return <span className="text-[#5A6F7C] text-[13px]">—</span>;
        }
        return (
          <div className="flex flex-wrap items-center gap-1">
            {visibleRoles.map((role) => {
              const { bg, text, border } = getRoleBadgeColors(role);
              return (
                <span
                  key={role}
                  className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-[12px] font-medium leading-[18px] font-['Inter'] border"
                  style={{ background: bg, color: text, borderColor: border }}
                >
                  {role}
                </span>
              );
            })}
            {overflowCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[12px] font-medium leading-[18px] font-['Inter'] bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]">
                +{overflowCount}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'status',
      accessorFn: (m) => m.status,
      enableSorting: true,
      header: () => t('users.members.columns.status'),
      cell: ({ row }) => {
        const m = row.original;
        const badge = STATUS_BADGE[m.status];
        const statusLabel = t(`users.members.status.${m.status.toLowerCase()}`);
        return (
          <span
            className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-[12px] font-medium leading-[18px] font-['Inter'] border"
            style={{ background: badge.bg, color: badge.text, borderColor: badge.bg }}
          >
            {statusLabel}
          </span>
        );
      },
    },
    {
      id: 'lastActive',
      accessorFn: memberLastActiveTs,
      enableSorting: true,
      sortingFn: 'basic',
      header: () => t('users.members.columns.lastActive'),
      cell: ({ row }) => (
        <span className="text-[13px] text-[#395362]">
          {formatLastActive(row.original.lastSignInAt ?? row.original.invitedAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      enableSorting: false,
      size: 64,
      header: () => t('users.members.columns.actions'),
      cell: ({ row }) => {
        const m = row.original;
        const isMenuOpen = openMenuId === m.id;
        return (
          <div className="relative">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpenMenuId(isMenuOpen ? null : m.id); }}
              className="w-8 h-8 flex items-center justify-center rounded"
              style={{ transition: 'background 0.12s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#E6EAEB'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              aria-label={t('users.members.columns.actions')}
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
            >
              <MoreVertical size={16} color="#395362" />
            </button>
            {isMenuOpen && (
              <div
                className="absolute right-0 top-10 z-50 bg-white border border-[#E6EAEB] rounded-lg overflow-hidden"
                style={{ minWidth: 152, boxShadow: '0px 4px 16px rgba(0,0,0,0.10)' }}
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="w-full px-4 py-2.5 text-left text-[14px] text-[#041620]"
                  style={{ transition: 'background 0.12s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F7F7F7'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  onClick={() => { setOpenMenuId(null); onViewDetails?.(m); }}
                >
                  {t('users.members.actions.viewDetails')}
                </button>
                {m.status === 'ACTIVE' && (
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full px-4 py-2.5 text-left text-[14px] text-[#C81E1E]"
                    style={{ transition: 'background 0.12s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    onClick={() => { setOpenMenuId(null); onSuspend(m); }}
                  >
                    {t('users.members.actions.suspend')}
                  </button>
                )}
                {(m.status === 'SUSPENDED' || m.status === 'INVITED') && (
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full px-4 py-2.5 text-left text-[14px] text-[#00684A]"
                    style={{ transition: 'background 0.12s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#ECFDF5'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    onClick={() => { setOpenMenuId(null); onActivate(m); }}
                  >
                    {t('users.members.actions.reactivate')}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      },
    },
  ], [t, openMenuId, onSuspend, onActivate, onViewDetails]);

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const headerWidthClass: Record<string, string> = {
    select: 'w-12',
    member: 'min-w-[240px]',
    roles: 'min-w-[140px]',
    status: 'min-w-[110px]',
    lastActive: 'min-w-[160px]',
    actions: 'w-16',
  };

  const renderSortIcon = (canSort: boolean, dir: 'asc' | 'desc' | false) => {
    if (!canSort) return null;
    if (dir === 'asc') return <ArrowUp size={14} color="#5A6F7C" />;
    if (dir === 'desc') return <ArrowDown size={14} color="#5A6F7C" />;
    return <ArrowUpDown size={14} color="#5A6F7C" />;
  };

  const renderBody = () => {
    if (loading) {
      return skeletonKeys.map((key) => (
        <tr key={key}>
          <td className={tdBase}><div className="w-4 h-4 bg-canvas-200 rounded animate-pulse" /></td>
          <td className={tdBase}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-canvas-200 animate-pulse flex-shrink-0" />
              <div className="flex flex-col gap-1.5">
                <div className="h-3 w-28 bg-canvas-200 rounded animate-pulse" />
                <div className="h-3 w-40 bg-canvas-200 rounded animate-pulse" />
              </div>
            </div>
          </td>
          <td className={tdBase}><div className="h-6 w-20 bg-canvas-200 rounded-md animate-pulse" /></td>
          <td className={tdBase}><div className="h-6 w-20 bg-canvas-200 rounded-md animate-pulse" /></td>
          <td className={tdBase}><div className="h-3 w-28 bg-canvas-200 rounded animate-pulse" /></td>
          <td className={tdBase}><div className="h-6 w-6 bg-canvas-200 rounded animate-pulse" /></td>
        </tr>
      ));
    }

    const rows = table.getRowModel().rows;
    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan={columns.length} className={`${tdBase} py-12 text-center text-[#5A6F7C]`}>
            {t('users.list.emptyTitle')}
          </td>
        </tr>
      );
    }

    return rows.map((row) => (
      <tr
        key={row.id}
        style={{ transition: 'background 0.12s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#F7F7F7'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        {row.getVisibleCells().map((cell) => (
          <td key={cell.id} className={tdBase}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className="flex-1 min-h-0 overflow-auto w-full" aria-busy={loading} aria-live="polite">
      {loading && <span className="sr-only">{t('users.members.loading')}</span>}
      <table className="w-full border-collapse min-w-[700px]">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sortDir = header.column.getIsSorted();
                const widthClass = headerWidthClass[header.column.id] ?? '';
                return (
                  <th key={header.id} className={`${thBase} ${widthClass}`}>
                    {canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-1.5 text-left bg-transparent border-0 p-0 cursor-pointer font-medium text-[13px] text-[#395362]"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {renderSortIcon(canSort, sortDir)}
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

export default MembersTable;
