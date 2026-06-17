import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { SuccessToast, ConfirmDialog } from '@/shared/components/ui';
import AddRoleModal from '../components/AddRoleModal';
import {
  useGetMemberByIdQuery,
  useGetRolesQuery,
  useSuspendMemberMutationCompat as useSuspendMemberMutation,
  useActivateMemberMutationCompat as useActivateMemberMutation,
  useAddMemberRoleMutationCompat as useAddMemberRoleMutation,
  useRemoveMemberRoleMutationCompat as useRemoveMemberRoleMutation,
} from '../api/usersApi';
import type { MemberStatus, MemberDetailRole } from '../api/usersApi';

const STATUS_BADGE: Record<MemberStatus, { bg: string; text: string; dot: string }> = {
  ACTIVE:    { bg: '#ECFDF5', text: '#00684A', dot: '#00A870' },
  INVITED:   { bg: '#FFFBEB', text: '#92400E', dot: '#D97706' },
  SUSPENDED: { bg: '#FEF2F2', text: '#991B1B', dot: '#EF4444' },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0][0] ?? '?').toUpperCase();
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Surface the backend's actual error message (RTK Query error → { status, data }).
// Falls back to the HTTP status so an opaque 500 is still visible to the user.
function extractErrorMessage(err: unknown, fallback: string): string {
  const e = err as { status?: number | string; data?: { message?: string } | string };
  if (e && typeof e.data === 'object' && e.data?.message) return e.data.message;
  if (typeof e?.data === 'string' && e.data.trim()) return e.data;
  if (e?.status === 403) return fallback;
  if (typeof e?.status === 'number') return `${fallback} (HTTP ${e.status})`;
  return fallback;
}

const cardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 10,
  border: '1px solid #E6EAEB',
  padding: 24,
  boxSizing: 'border-box',
};

const UserDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams({ from: '/users/$id' });

  const { data: member, isLoading, isError } = useGetMemberByIdQuery(id ?? '', { skip: !id });
  const hasToken = !!localStorage.getItem('chainpilot_access_token');
  const { data: rolesData } = useGetRolesQuery(undefined, { skip: !hasToken });
  const catalogue = useMemo(() => (Array.isArray(rolesData) ? rolesData : []), [rolesData]);

  const [suspendMember, { isLoading: isSuspending }] = useSuspendMemberMutation();
  const [activateMember, { isLoading: isActivating }] = useActivateMemberMutation();
  const [addMemberRole, { isLoading: isAdding }] = useAddMemberRoleMutation();
  const [removeMemberRole, { isLoading: isRemoving }] = useRemoveMemberRoleMutation();
  const isSavingRoles = isAdding || isRemoving;

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [statusAction, setStatusAction] = useState<'suspend' | 'activate' | null>(null);
  const [roleToRemove, setRoleToRemove] = useState<MemberDetailRole | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Resolve each assigned role against the catalogue to enrich description + id.
  const resolvedRoles = useMemo(() => {
    if (!member) return [];
    return member.roles.map((role) => {
      const match = catalogue.find(
        (c) => c.id === role.id || c.name.toLowerCase() === role.name.toLowerCase(),
      );
      return {
        id: match?.id ?? role.id,
        name: role.name ? role.name : (match?.name ?? ''),
        description: role.description ?? match?.description ?? '',
      };
    });
  }, [member, catalogue]);

  const assignedKeys = useMemo(
    () => new Set(resolvedRoles.map((r) => r.id.toLowerCase())),
    [resolvedRoles],
  );

  const availableRoles = useMemo(
    () => catalogue.filter((r) => !assignedKeys.has(r.id.toLowerCase())),
    [catalogue, assignedKeys],
  );

  const handleStatusConfirm = async () => {
    if (!member || !statusAction) return;
    try {
      if (statusAction === 'suspend') {
        await suspendMember(member.id).unwrap();
        setSuccessMessage(t('users.members.suspendSuccess'));
      } else {
        await activateMember(member.id).unwrap();
        setSuccessMessage(t('users.members.activateSuccess'));
      }
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, t('users.members.error')));
    } finally {
      setStatusAction(null);
    }
  };

  const handleAddRole = async (roleId: string) => {
    if (!member) return;
    try {
      await addMemberRole({ memberId: member.id, roleId }).unwrap();
      setSuccessMessage(t('users.details.roleAddedToast'));
      setAddModalOpen(false);
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, t('users.details.roleUpdateError')));
    }
  };

  const handleRemoveConfirm = async () => {
    if (!member || !roleToRemove) return;
    if (resolvedRoles.length <= 1) {
      setErrorMessage(t('users.details.minimumRoleError'));
      setRoleToRemove(null);
      return;
    }
    try {
      await removeMemberRole({ memberId: member.id, roleId: roleToRemove.id }).unwrap();
      setSuccessMessage(t('users.details.roleRemovedToast'));
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, t('users.details.roleUpdateError')));
    } finally {
      setRoleToRemove(null);
    }
  };

  const badge = member ? STATUS_BADGE[member.status] : STATUS_BADGE.ACTIVE;
  const isActive = member?.status === 'ACTIVE';

  return (
    <div style={{
      background: 'var(--Page-Background, #F7F7F7)',
      minHeight: '100%',
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      boxSizing: 'border-box',
    }}>
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => navigate({ to: '/users' })}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            background: '#FFFFFF',
            border: '1px solid #E6EAEB',
            borderRadius: 8,
            fontFamily: 'Inter',
            fontSize: 14,
            fontWeight: 500,
            color: '#08283B',
            cursor: 'pointer',
            transition: 'background 0.12s, border-color 0.12s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F7F7F7'; e.currentTarget.style.borderColor = '#B2BCC2'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E6EAEB'; }}
        >
          <ArrowLeft size={16} />
          {t('users.details.back')}
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontFamily: 'Inter', fontWeight: 600, fontSize: 18, lineHeight: '28px', color: '#041620' }}>
          {t('users.details.title')}
        </h1>
        <p style={{ margin: '4px 0 0', fontFamily: 'Inter', fontWeight: 400, fontSize: 14, lineHeight: '20px', color: '#08283B' }}>
          {t('users.details.subtitle')}
        </p>
      </div>

      {isLoading && (
        <div style={cardStyle}>
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-canvas-200" />
            <div className="flex flex-col gap-2">
              <div className="h-4 w-40 bg-canvas-200 rounded" />
              <div className="h-3 w-56 bg-canvas-200 rounded" />
            </div>
          </div>
        </div>
      )}

      {!isLoading && (isError || !member) && (
        <div style={{ ...cardStyle, color: '#991B1B', fontFamily: 'Inter', fontSize: 14 }}>
          {t('users.details.notFound')}
        </div>
      )}

      {!isLoading && member && (
        <>
          {/* Profile card */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              {member.imageUrl ? (
                <img src={member.imageUrl} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div
                  aria-hidden="true"
                  style={{
                    width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#F0F2F4', border: '1px solid #C8D0D6',
                    fontSize: 16, fontWeight: 600, color: '#4B5563', fontFamily: 'Inter',
                  }}
                >
                  {getInitials(member.fullName)}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 16, color: '#041620' }}>{member.fullName}</span>
                <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#395362' }}>{member.email}</span>
              </div>

              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px', borderRadius: 20,
                  background: badge.bg, color: badge.text,
                  fontFamily: 'Inter', fontSize: 13, fontWeight: 500,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: badge.dot }} aria-hidden="true" />
                {t(`users.members.status.${member.status.toLowerCase()}`)}
              </span>

              <button
                type="button"
                onClick={() => setStatusAction(isActive ? 'suspend' : 'activate')}
                disabled={isSuspending || isActivating}
                style={{
                  marginLeft: 'auto',
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: isActive ? '#C81E1E' : '#08283B',
                  color: '#FDFDFD',
                  fontFamily: 'Inter', fontSize: 14, fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => {
                  if (isSuspending || isActivating) return;
                  e.currentTarget.style.background = isActive ? '#a11919' : '#041620';
                }}
                onMouseLeave={(e) => {
                  if (isSuspending || isActivating) return;
                  e.currentTarget.style.background = isActive ? '#C81E1E' : '#08283B';
                }}
                onMouseDown={(e) => {
                  if (isSuspending || isActivating) return;
                  e.currentTarget.style.background = isActive ? '#8b1515' : '#072436';
                }}
                onMouseUp={(e) => {
                  if (isSuspending || isActivating) return;
                  e.currentTarget.style.background = isActive ? '#a11919' : '#041620';
                }}
              >
                {isActive ? t('users.details.suspendUser') : t('users.details.activateUser')}
              </button>
            </div>

            <div style={{ borderTop: '1px solid #E6EAEB', margin: '20px 0 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0' }}>
              <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#395362' }}>{t('users.details.created')}</span>
              <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#041620' }}>{formatDate(member.createdAt ?? member.invitedAt)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0' }}>
              <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#395362' }}>{t('users.details.lastActive')}</span>
              <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#041620' }}>{formatDate(member.lastSignInAt)}</span>
            </div>
          </div>

          {/* Role assignment card */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontFamily: 'Inter', fontWeight: 600, fontSize: 16, color: '#041620' }}>
                {t('users.details.roleAssignment')}
              </h2>
              <span style={{
                padding: '2px 10px', borderRadius: 20,
                background: '#FEF2F2', color: '#C81E1E',
                fontFamily: 'Inter', fontSize: 12, fontWeight: 500,
              }}>
                {t('users.details.minimumRequired')}
              </span>

              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                disabled={isSavingRoles}
                style={{
                  marginLeft: 'auto',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px',
                  background: '#08283B', border: 'none', borderRadius: 8,
                  fontFamily: 'Inter', fontSize: 14, fontWeight: 500, color: '#FDFDFD',
                  cursor: isSavingRoles ? 'not-allowed' : 'pointer',
                  opacity: isSavingRoles ? 0.6 : 1,
                  whiteSpace: 'nowrap',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => { if (!isSavingRoles) e.currentTarget.style.background = '#041620'; }}
                onMouseLeave={(e) => { if (!isSavingRoles) e.currentTarget.style.background = '#08283B'; }}
                onMouseDown={(e) => { if (!isSavingRoles) e.currentTarget.style.background = '#072436'; }}
                onMouseUp={(e) => { if (!isSavingRoles) e.currentTarget.style.background = '#041620'; }}
              >
                <Plus size={14} />
                {t('users.details.addRole')}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              {resolvedRoles.length === 0 ? (
                <p style={{ margin: 0, fontFamily: 'Inter', fontSize: 14, color: '#5A6F7C' }}>
                  {t('users.details.noRoles')}
                </p>
              ) : (
                resolvedRoles.map((role) => (
                  <div
                    key={role.id}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: 16, background: '#F7F8F9', borderRadius: 8,
                      border: '1px solid #EEF1F2',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: '#041620' }}>{role.name}</div>
                      {role.description && (
                        <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#5A6F7C', marginTop: 4 }}>{role.description}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setRoleToRemove(role)}
                      disabled={isSavingRoles || resolvedRoles.length <= 1}
                      title={resolvedRoles.length <= 1 ? t('users.details.minimumRoleError') : undefined}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 14px', flexShrink: 0,
                        background: '#FFFFFF', border: '1px solid #E6B0B0', borderRadius: 8,
                        fontFamily: 'Inter', fontSize: 13, fontWeight: 500, color: '#C81E1E',
                        cursor: resolvedRoles.length <= 1 ? 'not-allowed' : 'pointer',
                        opacity: resolvedRoles.length <= 1 ? 0.5 : 1,
                        transition: 'background 0.12s, border-color 0.12s',
                      }}
                      onMouseEnter={(e) => {
                        if (isSavingRoles || resolvedRoles.length <= 1) return;
                        e.currentTarget.style.background = '#FEF2F2';
                        e.currentTarget.style.borderColor = '#C81E1E';
                      }}
                      onMouseLeave={(e) => {
                        if (isSavingRoles || resolvedRoles.length <= 1) return;
                        e.currentTarget.style.background = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#E6B0B0';
                      }}
                    >
                      <X size={14} />
                      {t('users.details.remove')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Suspend confirm */}
      <ConfirmDialog
        open={statusAction === 'suspend'}
        title={t('users.members.suspend.title')}
        description={t('users.members.suspend.description', { name: member?.fullName ?? '' })}
        confirmLabel={t('users.members.suspend.confirm')}
        danger
        loading={isSuspending}
        onConfirm={handleStatusConfirm}
        onCancel={() => setStatusAction(null)}
      />

      {/* Activate confirm */}
      <ConfirmDialog
        open={statusAction === 'activate'}
        title={t('users.members.activate.title')}
        description={t('users.members.activate.description', { name: member?.fullName ?? '' })}
        confirmLabel={t('users.members.activate.confirm')}
        loading={isActivating}
        onConfirm={handleStatusConfirm}
        onCancel={() => setStatusAction(null)}
      />

      {/* Remove role confirm */}
      <ConfirmDialog
        open={!!roleToRemove}
        title={t('users.details.removeTitle')}
        description={t('users.details.removeDescription')}
        confirmLabel={t('users.details.remove')}
        danger
        loading={isSavingRoles}
        onConfirm={handleRemoveConfirm}
        onCancel={() => setRoleToRemove(null)}
      />

      {/* Add role modal */}
      {addModalOpen && (
        <AddRoleModal
          roles={availableRoles}
          saving={isAdding}
          onClose={() => setAddModalOpen(false)}
          onAdd={handleAddRole}
        />
      )}

      {successMessage && <SuccessToast message={successMessage} onClose={() => setSuccessMessage('')} />}
      {errorMessage && <SuccessToast message={errorMessage} onClose={() => setErrorMessage('')} />}
    </div>
  );
};

export default UserDetailsPage;
