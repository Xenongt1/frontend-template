import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ChevronDown } from 'lucide-react';
import { useGetRolesQuery, useInviteMemberMutationCompat as useInviteMemberMutation } from '../api/usersApi';

interface Props {
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const inputBase: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'var(--Overlay-Primary, #ECECEB)',
  border: '1px solid var(--Stroke-Default-Medium, #B2BCC2)',
  borderRadius: 8,
  padding: '12px 16px',
  fontFamily: 'Inter',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: '21px',
  color: 'var(--Body-Text-Primary, #08283B)',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: 14,
  lineHeight: '21px',
  color: 'var(--Body-Text-Primary, #08283B)',
};

const InviteUserModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [emailError, setEmailError] = useState('');

  const hasToken = !!localStorage.getItem('chainpilot_access_token');
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery(undefined, { skip: !hasToken });
  const roles = Array.isArray(rolesData) ? rolesData : [];
  const [inviteMember, { isLoading }] = useInviteMemberMutation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const validate = (): boolean => {
    if (!email.trim()) {
      setEmailError(t('users.invite.emailRequired'));
      return false;
    }
    if (!/^[^\s@]+@[^\s@.]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError(t('users.invite.emailInvalid'));
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await inviteMember({
        fullName: fullName.trim(),
        email: email.trim(),
        roleIds: roleId ? [roleId] : [],
      }).unwrap();
      onSuccess(t('users.invite.successToast'));
      onClose();
    } catch (err) {
      const msg =
        (err as { data?: { message?: string }; message?: string })?.data?.message ??
        (err as { message?: string })?.message ??
        t('users.invite.genericFailure');
      setEmailError(msg);
    }
  };

  return (
    <>
      <button
        type="button"
        tabIndex={-1}
        aria-label={t('dialog.close')}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          border: 'none',
          cursor: 'default',
          zIndex: 999,
        }}
      />
      <dialog
        open
        aria-modal="true"
        aria-labelledby="invite-user-title"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'transparent',
          border: 'none',
          padding: 0,
          maxWidth: 'none',
          maxHeight: 'none',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          pointerEvents: 'none',
        }}
      >
      <div style={{
        background: 'var(--Background-General-Light, #FDFDFD)',
        borderRadius: 10,
        border: '1px solid var(--Stroke-Default-Light, #E6EAEB)',
        boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
        width: 471,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxSizing: 'border-box',
        pointerEvents: 'auto',
      }}>

        {/* Header */}
        <div style={{ borderBottom: '1px solid var(--Stroke-Default-Light, #E6EAEB)', paddingBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 id="invite-user-title" style={{ margin: 0, fontFamily: 'Inter', fontWeight: 600, fontSize: 18, lineHeight: '28px', color: '#041620' }}>
              {t('users.invite.title')}
            </h2>
            <button
              onClick={onClose}
              aria-label={t('dialog.close')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7, display: 'flex', padding: 0 }}
            >
              <X size={16} color="#041620" />
            </button>
          </div>
          <p style={{ margin: 0, fontFamily: 'Inter', fontWeight: 400, fontSize: 14, lineHeight: '20px', color: 'var(--Body-Text-Primary, #08283B)' }}>
            {t('users.invite.subtitle')}
          </p>
        </div>

        {/* Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelStyle}>{t('users.invite.nameLabel')}</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t('users.invite.namePlaceholder')}
            style={inputBase}
          />
        </div>

        {/* Email */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelStyle}>
            {t('users.invite.emailLabel')}
            <span style={{ color: '#C81E1E', marginLeft: 1 }}>*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
            placeholder={t('users.invite.emailPlaceholder')}
            style={{
              ...inputBase,
              border: emailError ? '1px solid #C81E1E' : '1px solid var(--Stroke-Default-Medium, #B2BCC2)',
              color: emailError ? '#C81E1E' : 'var(--Body-Text-Primary, #08283B)',
            }}
          />
          {emailError && (
            <span style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 14, lineHeight: '21px', color: '#C81E1E' }}>
              {emailError}
            </span>
          )}
        </div>

        {/* Assign Role */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelStyle}>{t('users.invite.roleLabel')}</label>
          <div style={{ position: 'relative' }}>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              disabled={rolesLoading}
              style={{
                ...inputBase,
                color: roleId ? 'var(--Body-Text-Primary, #08283B)' : 'var(--Body-Text-Tertiary, #5A6F7C)',
                appearance: 'none',
                cursor: rolesLoading ? 'not-allowed' : 'pointer',
                paddingRight: 40,
              }}
            >
              <option value="" disabled>{t('users.invite.rolePlaceholder')}</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <ChevronDown
              size={16}
              color="#08283B"
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid #2C2B29',
              borderRadius: 8,
              fontFamily: 'Inter',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '21px',
              color: '#2C2B29',
              cursor: 'pointer',
              transition: 'background 0.12s, color 0.12s',
            }}
            onMouseEnter={(e) => {
              if (isLoading) return;
              e.currentTarget.style.background = '#2C2B29';
              e.currentTarget.style.color = '#FDFDFD';
            }}
            onMouseLeave={(e) => {
              if (isLoading) return;
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#2C2B29';
            }}
          >
            {t('users.invite.cancelButton')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              background: isLoading ? '#395362' : 'var(--Buttons-Filled-Dark-Blue-Default, #08283B)',
              border: 'none',
              borderRadius: 8,
              fontFamily: 'Inter',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '21px',
              color: '#FDFDFD',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = '#041620'; }}
            onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = '#08283B'; }}
            onMouseDown={(e) => { if (!isLoading) e.currentTarget.style.background = '#072436'; }}
            onMouseUp={(e) => { if (!isLoading) e.currentTarget.style.background = '#041620'; }}
          >
            {isLoading ? t('users.invite.sending') : t('users.invite.sendButton')}
          </button>
        </div>
      </div>
    </dialog>
    </>
  );
};

export default InviteUserModal;
