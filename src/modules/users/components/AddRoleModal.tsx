import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search } from 'lucide-react';
import type { Role } from '../api/usersApi';

interface Props {
  roles: Role[];
  saving?: boolean;
  onClose: () => void;
  onAdd: (roleId: string) => void;
}

const AddRoleModal: React.FC<Props> = ({ roles, saving = false, onClose, onAdd }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (r) => r.name.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q),
    );
  }, [roles, search]);

  const handleSubmit = () => {
    if (!selectedId || saving) return;
    onAdd(selectedId);
  };

  const emptyTextStyle: React.CSSProperties = {
    margin: 0, fontFamily: 'Inter', fontSize: 14, color: '#5A6F7C',
    textAlign: 'center', padding: '16px 0',
  };

  const renderRoleList = () => {
    if (roles.length === 0) {
      return <p style={emptyTextStyle}>{t('users.details.addRoleNoneAvailable')}</p>;
    }
    if (filtered.length === 0) {
      return <p style={emptyTextStyle}>{t('users.details.addRoleEmpty')}</p>;
    }
    return filtered.map((role) => {
      const selected = selectedId === role.id;
      return (
        <label
          key={role.id}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14,
            borderRadius: 8, cursor: 'pointer',
            border: `1px solid ${selected ? '#08283B' : '#E6EAEB'}`,
            background: selected ? '#F5F7F8' : '#FFFFFF',
          }}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={() => setSelectedId(selected ? null : role.id)}
            className="accent-[#08283B]"
            style={{ width: 16, height: 16, marginTop: 2, flexShrink: 0, cursor: 'pointer' }}
          />
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: '#041620' }}>
              {role.name}
            </span>
            {role.description && (
              <span style={{ display: 'block', fontFamily: 'Inter', fontSize: 13, color: '#5A6F7C', marginTop: 2 }}>
                {role.description}
              </span>
            )}
          </span>
        </label>
      );
    });
  };

  return (
    <>
      <button
        type="button"
        tabIndex={-1}
        aria-label={t('dialog.close')}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          border: 'none', cursor: 'default', zIndex: 999,
        }}
      />
      <dialog
        open
        aria-modal="true"
        aria-labelledby="add-role-title"
        style={{
          position: 'fixed', inset: 0, background: 'transparent', border: 'none',
          padding: 0, maxWidth: 'none', maxHeight: 'none', width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, pointerEvents: 'none',
        }}
      >
        <div style={{
          background: '#FDFDFD', borderRadius: 10, border: '1px solid #E6EAEB',
          boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
          width: 'min(540px, calc(100vw - 32px))', maxHeight: 'calc(100vh - 64px)',
          display: 'flex', flexDirection: 'column', boxSizing: 'border-box', pointerEvents: 'auto',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px', borderBottom: '1px solid #E6EAEB',
          }}>
            <h2 id="add-role-title" style={{ margin: 0, fontFamily: 'Inter', fontWeight: 600, fontSize: 18, lineHeight: '28px', color: '#041620' }}>
              {t('users.details.addRoleTitle')}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('dialog.close')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7, display: 'flex', padding: 0 }}
            >
              <X size={18} color="#5A6F7C" />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#5A6F7C" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('users.details.addRolePlaceholder')}
                style={{
                  width: '100%', boxSizing: 'border-box', paddingLeft: 40, paddingRight: 14,
                  paddingTop: 10, paddingBottom: 10, border: '1px solid #E6EAEB', borderRadius: 8,
                  fontFamily: 'Inter', fontSize: 14, color: '#08283B', background: '#FDFDFD', outline: 'none',
                }}
              />
            </div>

            {/* Role list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {renderRoleList()}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 8,
            padding: '16px 24px', borderTop: '1px solid #E6EAEB',
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: '10px 20px', background: 'transparent', border: '1px solid #2C2B29',
                borderRadius: 8, fontFamily: 'Inter', fontWeight: 500, fontSize: 14, color: '#2C2B29',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => {
                if (saving) return;
                e.currentTarget.style.background = '#F7F7F7';
              }}
              onMouseLeave={(e) => {
                if (saving) return;
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {t('users.details.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedId || saving}
              style={{
                padding: '10px 20px', border: 'none', borderRadius: 8,
                background: !selectedId || saving ? '#395362' : '#08283B',
                fontFamily: 'Inter', fontWeight: 500, fontSize: 14, color: '#FDFDFD',
                cursor: !selectedId || saving ? 'not-allowed' : 'pointer',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => { if (selectedId && !saving) e.currentTarget.style.background = '#041620'; }}
              onMouseLeave={(e) => { if (selectedId && !saving) e.currentTarget.style.background = '#08283B'; }}
              onMouseDown={(e) => { if (selectedId && !saving) e.currentTarget.style.background = '#072436'; }}
              onMouseUp={(e) => { if (selectedId && !saving) e.currentTarget.style.background = '#041620'; }}
            >
              {t('users.details.addRoleConfirm')}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default AddRoleModal;
