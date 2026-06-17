import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreVertical, ArrowUpDown } from 'lucide-react';
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

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin:           { bg: '#EDE9FE', text: '#6D28D9' },
  manager:         { bg: '#DBEAFE', text: '#1D4ED8' },
  viewer:          { bg: '#F3F4F6', text: '#374151' },
  'store officer': { bg: '#D1FAE5', text: '#065F46' },
};

function getRoleBadgeColors(role: string): { bg: string; text: string } {
  return ROLE_COLORS[role.toLowerCase()] ?? { bg: '#F3F4F6', text: '#374151' };
}

const MAX_VISIBLE_ROLES = 1;

const thBase = "px-4 h-[52px] text-left text-[13px] font-medium text-[#395362] bg-[#E6EAEB] border-b border-[#E6EAEB] whitespace-nowrap font-['Inter']";
const tdBase = "px-4 h-16 align-middle border-b border-[#E6EAEB] bg-white text-[14px] font-['Inter']";

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const skeletonKeys = useMemo(
    () => Array.from({ length: skeletonRowCount }, () => crypto.randomUUID()),
    [skeletonRowCount],
  );

  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const allSelected = items.length > 0 && items.every((m) => selectedIds.has(m.id));
  const someSelected = items.some((m) => selectedIds.has(m.id));

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map((m) => m.id)));
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
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
          <td className={tdBase}><div className="h-6 w-20 bg-canvas-200 rounded-full animate-pulse" /></td>
          <td className={tdBase}><div className="h-6 w-20 bg-canvas-200 rounded-full animate-pulse" /></td>
          <td className={tdBase}><div className="h-3 w-28 bg-canvas-200 rounded animate-pulse" /></td>
          <td className={tdBase}><div className="h-6 w-6 bg-canvas-200 rounded animate-pulse" /></td>
        </tr>
      ));
    }

    if (items.length === 0) {
      return (
        <tr>
          <td colSpan={6} className={`${tdBase} py-12 text-center text-[#5A6F7C]`}>
            {t('users.list.emptyTitle')}
          </td>
        </tr>
      );
    }

    return items.map((member) => {
      const badge = STATUS_BADGE[member.status];
      const statusLabel = t(`users.members.status.${member.status.toLowerCase()}`);
      const visibleRoles = member.roles.slice(0, MAX_VISIBLE_ROLES);
      const overflowCount = member.roles.length - MAX_VISIBLE_ROLES;
      const isMenuOpen = openMenuId === member.id;

      return (
        <tr
          key={member.id}
          style={{ transition: 'background 0.12s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F7F7F7'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <td className={tdBase}>
            <input
              type="checkbox"
              checked={selectedIds.has(member.id)}
              onChange={() => toggleOne(member.id)}
              className="w-4 h-4 rounded border-[#B2BCC2] cursor-pointer accent-[#08283B]"
              aria-label={`Select ${member.fullName}`}
            />
          </td>

          <td className={tdBase}>
            <div className="flex items-center gap-3">
              {member.imageUrl ? (
                <img src={member.imageUrl} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
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
                  {getInitials(member.fullName)}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-[14px] text-[#041620] truncate">{member.fullName}</span>
                <span className="text-[13px] text-[#395362] truncate">{member.email}</span>
              </div>
            </div>
          </td>

          <td className={tdBase}>
            <div className="flex flex-wrap items-center gap-1">
              {member.roles.length === 0 ? (
                <span className="text-[#5A6F7C] text-[13px]">—</span>
              ) : (
                <>
                  {visibleRoles.map((role) => {
                    const { bg, text } = getRoleBadgeColors(role);
                    return (
                      <span
                        key={role}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium"
                        style={{ background: bg, color: text }}
                      >
                        {role}
                      </span>
                    );
                  })}
                  {overflowCount > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium bg-[#F3F4F6] text-[#374151]">
                      +{overflowCount}
                    </span>
                  )}
                </>
              )}
            </div>
          </td>

          <td className={tdBase}>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium"
              style={{ background: badge.bg, color: badge.text }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: badge.dot }} aria-hidden="true" />
              {statusLabel}
            </span>
          </td>

          <td className={tdBase}>
            <span className="text-[13px] text-[#395362]">
              {formatLastActive(member.lastSignInAt ?? member.invitedAt)}
            </span>
          </td>

          <td className={tdBase}>
            <div className="relative">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpenMenuId(isMenuOpen ? null : member.id); }}
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
                    onClick={() => { setOpenMenuId(null); onViewDetails?.(member); }}
                  >
                    {t('users.members.actions.viewDetails')}
                  </button>
                  {member.status === 'ACTIVE' && (
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full px-4 py-2.5 text-left text-[14px] text-[#C81E1E]"
                      style={{ transition: 'background 0.12s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      onClick={() => { setOpenMenuId(null); onSuspend(member); }}
                    >
                      {t('users.members.actions.suspend')}
                    </button>
                  )}
                  {(member.status === 'SUSPENDED' || member.status === 'INVITED') && (
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full px-4 py-2.5 text-left text-[14px] text-[#00684A]"
                      style={{ transition: 'background 0.12s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#ECFDF5'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      onClick={() => { setOpenMenuId(null); onActivate(member); }}
                    >
                      {t('users.members.actions.reactivate')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="flex-1 min-h-0 overflow-auto w-full" aria-busy={loading} aria-live="polite">
      {loading && <span className="sr-only">{t('users.members.loading')}</span>}
      <table className="w-full border-collapse min-w-[700px]">
        <thead>
          <tr>
            <th className={`${thBase} w-12`}>
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => { if (el) el.indeterminate = !allSelected && someSelected; }}
                onChange={toggleAll}
                className="w-4 h-4 rounded border-[#B2BCC2] cursor-pointer accent-[#08283B]"
                aria-label="Select all"
              />
            </th>
            <th className={`${thBase} min-w-[240px]`}>
              <div className="flex items-center gap-1.5">
                {t('users.members.columns.member')}
                <ArrowUpDown size={14} color="#5A6F7C" />
              </div>
            </th>
            <th className={`${thBase} min-w-[140px]`}>{t('users.members.columns.roles')}</th>
            <th className={`${thBase} min-w-[110px]`}>
              <div className="flex items-center gap-1.5">
                {t('users.members.columns.status')}
                <ArrowUpDown size={14} color="#5A6F7C" />
              </div>
            </th>
            <th className={`${thBase} min-w-[160px]`}>
              <div className="flex items-center gap-1.5">
                {t('users.members.columns.lastActive')}
                <ArrowUpDown size={14} color="#5A6F7C" />
              </div>
            </th>
            <th className={`${thBase} w-16`}>{t('users.members.columns.actions')}</th>
          </tr>
        </thead>
        <tbody>{renderBody()}</tbody>
      </table>
    </div>
  );
};

export default MembersTable;
