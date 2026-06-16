import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { PermissionDefinition } from '../data/permissionCatalogue';

interface Props {
  permission: PermissionDefinition;
  checked: boolean;
  /** When omitted the row renders as read-only (no checkbox; just label + info icon). */
  onChange?: (checked: boolean) => void;
}

const TOOLTIP_WIDTH = 224;
const TOOLTIP_GAP = 8;

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="8" stroke="#5A6F7C" strokeWidth="1.5" />
    <circle cx="10" cy="6.5" r="0.9" fill="#5A6F7C" />
    <path d="M10 9v5" stroke="#5A6F7C" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/**
 * Info-icon tooltip matching the Figma "Edit Role" hover state:
 * dark navy panel with the permission label on top + the longer hint
 * description below, with a small upward-pointing triangle.
 *
 * Rendered via a portal so it isn't clipped by parent overflow:hidden
 * (the area card needs overflow-hidden for its rounded corners).
 */
const PermissionInfoTooltip: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const show = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + TOOLTIP_GAP,
      left: rect.left + rect.width / 2 - 16, // align triangle under the icon
    });
  };
  const hide = () => setPos(null);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-label={title}
        className="inline-flex items-center bg-transparent border-none p-0 cursor-help"
      >
        <InfoIcon />
      </button>
      {pos && createPortal(
        <div
          role="tooltip"
          className="pointer-events-none"
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: TOOLTIP_WIDTH, zIndex: 70 }}
        >
          <span
            aria-hidden="true"
            className="block"
            style={{
              width: 0,
              height: 0,
              marginLeft: 4,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '8px solid #08283B',
            }}
          />
          <div
            className="rounded-md px-3 py-2.5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10),0_2px_4px_-2px_rgba(0,0,0,0.05)]"
            style={{ background: '#08283B' }}
          >
            <div
              className="text-[14px] font-medium leading-[18px] text-canvas-50 mb-1.5"
              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
            >
              {title}
            </div>
            <div
              className="text-[12px] font-normal leading-[16px] text-[#B2BCC2]"
              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
            >
              {description}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

const PermissionRow: React.FC<Props> = ({ permission, checked, onChange }) => {
  const { t } = useTranslation();
  const readOnly = !onChange;
  // Prefer the direct label/hint strings (backend-provided catalogue).
  // Fall back to translating the legacy i18n keys if only those are set.
  const label = permission.label ?? (permission.labelKey ? t(permission.labelKey) : permission.code);
  const hint = permission.hint ?? (permission.hintKey ? t(permission.hintKey) : '');

  // Read-only rows in the design are just label + info icon — no checkbox.
  if (readOnly) {
    return (
      <div className="inline-flex items-center gap-1 text-[14px] leading-[21px] text-navy-900">
        <span>{label}</span>
        <PermissionInfoTooltip title={label} description={hint} />
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-[14px] text-navy-900">
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded-[3px] border border-[#B2BCC2] accent-navy-900 cursor-pointer"
        />
        <span>{label}</span>
      </label>
      <PermissionInfoTooltip title={label} description={hint} />
    </span>
  );
};

export default PermissionRow;
