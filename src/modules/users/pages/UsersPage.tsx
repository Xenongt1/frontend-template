import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Search, Download, Plus, ChevronDown } from 'lucide-react';
import EmptyState, { PanaIllustration } from '@/shared/components/EmptyState';
import { SuccessToast, ConfirmDialog } from '@/shared/components/ui';
import RolesPagination from '@/modules/roles/components/RolesPagination';
import InviteUserModal from '../components/InviteUserModal';
import MembersTable from '../components/MembersTable';
import {
  useGetMembersQuery,
  useGetRolesQuery,
  useSuspendMemberMutationCompat as useSuspendMemberMutation,
  useActivateMemberMutationCompat as useActivateMemberMutation,
} from '../api/usersApi';
import type { Member } from '../api/usersApi';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface PendingAction {
  type: 'suspend' | 'activate';
  member: Member;
}

const UsersPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  // Search state with 300ms debounce sent to backend
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rolesOpen, setRolesOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const rolesDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [roleFilter, statusFilter]);

  const { data, isLoading, isFetching, isError, error } = useGetMembersQuery(
    {
      page: page - 1,
      pageSize,
      search: debouncedSearch || undefined,
      role: roleFilter || undefined,
      status: statusFilter || undefined,
    },
    { refetchOnMountOrArgChange: true },
  );

  const hasToken = !!localStorage.getItem('chainpilot_access_token');
  const { data: rolesData } = useGetRolesQuery(undefined, { skip: !hasToken });
  const availableRoles = Array.isArray(rolesData) ? rolesData : [];

  const [suspendMember, { isLoading: isSuspending }] = useSuspendMemberMutation();
  const [activateMember, { isLoading: isActivating }] = useActivateMemberMutation();

  const totalItems = data?.totalItems ?? 0;
  const totalPages = Math.max(1, data?.totalPages ?? Math.ceil(totalItems / pageSize));
  const isTableLoading = isLoading || isFetching;

  // Client-side filtering — instant on the current page; backend params add server-side support when available
  const filteredMembers = useMemo(() => {
    let result = data?.data ?? [];
    // Use live `search` (not debounced) so each keystroke instantly filters visible rows
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) => m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
      );
    }
    if (roleFilter) {
      result = result.filter((m) =>
        m.roles.some((r) => r.toLowerCase() === roleFilter.toLowerCase()),
      );
    }
    if (statusFilter) {
      result = result.filter((m) => m.status === statusFilter);
    }
    return result;
  }, [data?.data, search, roleFilter, statusFilter]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (rolesDropdownRef.current && !rolesDropdownRef.current.contains(e.target as Node)) setRolesOpen(false);
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) setStatusOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handlePageSizeChange = (size: number) => { setPageSize(size); setPage(1); };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    const { type, member } = pendingAction;
    try {
      if (type === 'suspend') {
        await suspendMember(member.id).unwrap();
        setSuccessMessage(t('users.members.suspendSuccess'));
      } else {
        await activateMember(member.id).unwrap();
        setSuccessMessage(t('users.members.activateSuccess'));
      }
    } catch (err) {
      const e = err as { status?: number | string; data?: { message?: string } | string };
      const msg =
        (e && typeof e.data === 'object' && e.data?.message) ||
        (typeof e?.data === 'string' && e.data) ||
        (typeof e?.status === 'number' ? `${t('users.members.error')} (HTTP ${e.status})` : '') ||
        t('users.members.error');
      setSuccessMessage(msg);
    } finally {
      setPendingAction(null);
    }
  };

  const emptyDescription = i18n.exists('users.list.emptyDescription')
    ? (t('users.list.emptyDescription', { returnObjects: true }) as string[])
    : t('users.list.emptyDescription');

  const showErrorState = !isTableLoading && isError;
  const showEmptyState = !isTableLoading && !isError && totalItems === 0;
  const showTable = isTableLoading || (!isError && totalItems > 0);

  const STATUS_OPTIONS = [
    { value: '', label: t('users.list.allStatus') },
    { value: 'ACTIVE', label: t('users.members.status.active') },
    { value: 'INVITED', label: t('users.members.status.invited') },
    { value: 'SUSPENDED', label: t('users.members.status.suspended') },
  ];

  const dropdownMenuStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    background: '#FFFFFF',
    border: '1px solid #E6EAEB',
    borderRadius: 8,
    boxShadow: '0px 4px 16px rgba(0,0,0,0.10)',
    zIndex: 200,
    overflow: 'hidden',
    minWidth: 170,
    padding: '4px 0',
  };

  return (
    <>
      <div style={{
        background: 'var(--Page-Background, #F7F7F7)',
        minHeight: '100%',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxSizing: 'border-box',
      }}>
        {/* Page header */}
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Inter', fontWeight: 600, fontSize: 18, lineHeight: '28px', color: '#041620' }}>
            {t('users.list.title')}
          </h1>
          <p style={{ margin: '4px 0 0', fontFamily: 'Inter', fontWeight: 400, fontSize: 14, lineHeight: '20px', color: '#08283B' }}>
            {t('users.list.subtitle')}
          </p>
        </div>

        {/* Active filter chips — shown when any filter is active */}
        {(roleFilter || statusFilter) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            background: '#FFFFFF',
            border: '1px solid #E6EAEB',
            borderRadius: 8,
            flexWrap: 'wrap',
          }}>
            <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#5A6F7C', whiteSpace: 'nowrap' }}>
              {t('users.list.filterLabel')}
            </span>
            {roleFilter && (
              <FilterChip
                label={roleFilter}
                onRemove={() => setRoleFilter('')}
              />
            )}
            {statusFilter && (
              <FilterChip
                label={t(`users.members.status.${statusFilter.toLowerCase()}`)}
                onRemove={() => setStatusFilter('')}
              />
            )}
            <button
              type="button"
              onClick={() => { setRoleFilter(''); setStatusFilter(''); }}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                fontFamily: 'Inter',
                fontSize: 13,
                color: '#00684A',
                cursor: 'pointer',
                padding: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {t('users.list.clearFilters')}
            </button>
          </div>
        )}

        {/* Request error */}
        {showErrorState && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 8,
            color: '#991B1B',
            fontFamily: 'Inter',
            fontSize: 14,
            lineHeight: '20px',
            padding: '14px 16px',
          }}>
            {(error as Error | undefined)?.message || t('users.members.error')}
          </div>
        )}

        {/* Empty state */}
        {showEmptyState && (
          <EmptyState
            icon={<PanaIllustration />}
            iconSize={290}
            title={t('users.list.emptyTitle')}
            description={emptyDescription}
            actionLabel={t('users.list.inviteButton')}
            onAction={() => setIsInviteOpen(true)}
          />
        )}

        {/* Members table card */}
        {showTable && (
          <div className="bg-white rounded-lg border border-[#E6EAEB] overflow-visible flex flex-col">

            {/* ── Toolbar ─────────────────────────────────────────────────────── */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              borderBottom: '1px solid #E6EAEB',
            }}>
              {/* LEFT: Search */}
              <div style={{ position: 'relative', width: 260, flexShrink: 0 }}>
                <Search
                  size={16}
                  color="#5A6F7C"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('users.list.searchPlaceholder')}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    paddingLeft: 36,
                    paddingRight: 12,
                    paddingTop: 8,
                    paddingBottom: 8,
                    border: '1px solid #E6EAEB',
                    borderRadius: 8,
                    fontFamily: 'Inter',
                    fontSize: 14,
                    color: '#08283B',
                    background: '#FDFDFD',
                    outline: 'none',
                  }}
                />
              </div>

              {/* SPACER — pushes right group to the far right */}
              <div style={{ flex: 1 }} />

              {/* RIGHT: Filters + Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

                {/* All Roles dropdown */}
                <div ref={rolesDropdownRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => { setRolesOpen((o) => !o); setStatusOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      border: `1px solid ${rolesOpen || roleFilter ? '#B2BCC2' : '#E6EAEB'}`,
                      borderRadius: 8,
                      background: '#FFFFFF',
                      fontFamily: 'Inter',
                      fontSize: 14,
                      color: '#08283B',
                      fontWeight: 400,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {roleFilter || t('users.list.allRoles')}
                    <ChevronDown size={14} color="#5A6F7C" />
                  </button>
                  {rolesOpen && (
                    <div style={dropdownMenuStyle}>
                      <DropdownItem
                        label={t('users.list.allRoles')}
                        active={!roleFilter}
                        onClick={() => { setRoleFilter(''); setRolesOpen(false); }}
                      />
                      {availableRoles.map((role) => (
                        <DropdownItem
                          key={role.id}
                          label={role.name}
                          active={roleFilter === role.name}
                          onClick={() => { setRoleFilter(role.name); setRolesOpen(false); }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* All Status dropdown */}
                <div ref={statusDropdownRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => { setStatusOpen((o) => !o); setRolesOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      border: `1px solid ${statusOpen || statusFilter ? '#B2BCC2' : '#E6EAEB'}`,
                      borderRadius: 8,
                      background: '#FFFFFF',
                      fontFamily: 'Inter',
                      fontSize: 14,
                      color: '#08283B',
                      fontWeight: 400,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {statusFilter ? t(`users.members.status.${statusFilter.toLowerCase()}`) : t('users.list.allStatus')}
                    <ChevronDown size={14} color="#5A6F7C" />
                  </button>
                  {statusOpen && (
                    <div style={dropdownMenuStyle}>
                      {STATUS_OPTIONS.map((opt) => (
                        <DropdownItem
                          key={opt.value}
                          label={opt.label}
                          active={statusFilter === opt.value}
                          onClick={() => { setStatusFilter(opt.value); setStatusOpen(false); }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Export */}
                <button
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    border: '1px solid #2C2B29',
                    borderRadius: 8,
                    background: 'transparent',
                    fontFamily: 'Inter',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#2C2B29',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Download size={14} />
                  {t('users.list.export')}
                </button>

                {/* Invite User */}
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    background: '#08283B',
                    border: 'none',
                    borderRadius: 8,
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    fontSize: 14,
                    color: '#FDFDFD',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Plus size={14} />
                  {t('users.list.inviteButton')}
                </button>
              </div>
            </div>
            {/* ── End Toolbar ─────────────────────────────────────────────────── */}

            <MembersTable
              items={filteredMembers}
              loading={isTableLoading}
              onSuspend={(member) => setPendingAction({ type: 'suspend', member })}
              onActivate={(member) => setPendingAction({ type: 'activate', member })}
              onViewDetails={(member) => navigate({ to: `/users/${member.id}` })}
            />
            {!isTableLoading && totalItems > 0 && (
              <RolesPagination
                page={page}
                pageSize={pageSize}
                total={totalItems}
                totalPages={totalPages}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
                disabled={isFetching}
                i18nKeyPrefix="users.list.pagination"
              />
            )}
          </div>
        )}
      </div>

      {isInviteOpen && (
        <InviteUserModal
          onClose={() => setIsInviteOpen(false)}
          onSuccess={(msg) => { setIsInviteOpen(false); setSuccessMessage(msg); }}
        />
      )}

      <ConfirmDialog
        open={pendingAction?.type === 'suspend'}
        title={t('users.members.suspend.title')}
        description={t('users.members.suspend.description', { name: pendingAction?.member.fullName ?? '' })}
        confirmLabel={t('users.members.suspend.confirm')}
        danger
        loading={isSuspending}
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingAction(null)}
      />

      <ConfirmDialog
        open={pendingAction?.type === 'activate'}
        title={t('users.members.activate.title')}
        description={t('users.members.activate.description', { name: pendingAction?.member.fullName ?? '' })}
        confirmLabel={t('users.members.activate.confirm')}
        loading={isActivating}
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingAction(null)}
      />

      {successMessage && (
        <SuccessToast message={successMessage} onClose={() => setSuccessMessage('')} />
      )}
    </>
  );
};

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 10px 3px 10px',
      background: '#E6EAEB',
      borderRadius: 20,
      fontFamily: 'Inter',
      fontSize: 13,
      color: '#08283B',
      fontWeight: 400,
    }}
  >
    {label}
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${label} filter`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        marginLeft: 2,
        color: '#395362',
        lineHeight: 1,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M9 3L3 9M3 3L9 9" stroke="#395362" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  </span>
);

interface DropdownItemProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: 'block',
      width: '100%',
      padding: '9px 16px',
      textAlign: 'left',
      fontFamily: 'Inter',
      fontSize: 14,
      lineHeight: '20px',
      color: '#08283B',
      fontWeight: active ? 500 : 400,
      background: active ? '#F5F5F5' : 'transparent',
      border: 'none',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.background = '#F5F5F5';
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.background = active ? '#F5F5F5' : 'transparent';
    }}
  >
    {label}
  </button>
);

export default UsersPage;
