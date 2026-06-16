import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import type { RoleSummary } from '../types';

interface Props {
  role: RoleSummary;
  /** Optional delete handler; if omitted the option still renders but is disabled. */
  onDelete?: (role: RoleSummary) => void;
}

const KebabIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="3" r="1.4" fill="#061C2A" />
    <circle cx="8" cy="8" r="1.4" fill="#061C2A" />
    <circle cx="8" cy="13" r="1.4" fill="#061C2A" />
  </svg>
);

const MENU_WIDTH = 168;

const RoleRowActions: React.FC<Props> = ({ role, onDelete }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setPos(null);
      }
    };
    const closeOnScroll = () => { setOpen(false); setPos(null); };
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', closeOnScroll, true);
    window.addEventListener('resize', closeOnScroll);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', closeOnScroll, true);
      window.removeEventListener('resize', closeOnScroll);
    };
  }, [open]);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (open) {
      setOpen(false);
      setPos(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: Math.max(8, rect.right - MENU_WIDTH) });
    setOpen(true);
  };

  const handle = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
    setOpen(false);
    setPos(null);
  };

  const itemClass = 'w-full text-left px-4 py-2 border-none bg-transparent text-[14px] font-medium text-navy-900 cursor-pointer hover:bg-canvas-100 transition-colors';

  return (
    <div ref={containerRef} className="inline-block">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('roles.list.table.openActions')}
        className="inline-flex items-center justify-center w-8 h-8 border-none bg-transparent rounded-md cursor-pointer transition-colors hover:bg-canvas-300"
      >
        <KebabIcon />
      </button>

      {open && pos && (
        <div
          role="menu"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          className="bg-canvas-50 border border-canvas-300 rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.10)] py-1"
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: MENU_WIDTH, zIndex: 50 }}
        >
          <button role="menuitem" className={itemClass} onClick={handle(() => navigate({ to: `/iam/roles/${role.id}/edit` }))}>
            {t('roles.list.actions.edit')}
          </button>
          <button role="menuitem" className={itemClass} onClick={handle(() => navigate({ to: `/iam/roles/${role.id}` }))}>
            {t('roles.list.actions.view')}
          </button>
          <div className="h-px bg-canvas-300 my-1" />
          <button
            role="menuitem"
            disabled={!onDelete}
            className={`${itemClass} text-red-800 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
            onClick={handle(() => onDelete?.(role))}
          >
            {t('roles.list.actions.delete')}
          </button>
        </div>
      )}
    </div>
  );
};

export default RoleRowActions;
