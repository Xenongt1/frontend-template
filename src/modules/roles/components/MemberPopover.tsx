import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getRoleById } from '../api/rolesApi';
import type { RoleMember } from '../types';
import { initialsOf } from '../utils/initials';

interface Props {
  roleId: string;
  /**
   * Candidate positions for the popover, both measured from the
   * triggering element:
   *   below — top edge if the popover renders under the trigger.
   *   above — bottom edge if the popover renders over the trigger.
   * The popover picks whichever side leaves the popover fully in view.
   */
  anchor: { below: number; above: number; left: number };
  onClose: () => void;
}

const POPOVER_WIDTH = 320;
const VIEWPORT_MARGIN = 8;

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2 2l10 10M12 2L2 12" stroke="#395362" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="5" stroke="#5A6F7C" strokeWidth="1.5" />
    <path d="M11 11L14 14" stroke="#5A6F7C" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/**
 * Floating "People (N)" panel triggered by clicking a role's avatar stack
 * on the Browse Roles table. Lazy-loads the role's full member list when
 * mounted — `RoleSummary` only carries memberCount, not the actual list.
 */
const MemberPopover: React.FC<Props> = ({ roleId, anchor, onClose }) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [members, setMembers] = useState<RoleMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // Position state — initialised from the trigger anchor, then clamped to
  // the viewport in useLayoutEffect below so the popover never spills off
  // the bottom or right edge.
  const [position, setPosition] = useState({ top: anchor.below, left: anchor.left });
  const [maxHeight, setMaxHeight] = useState<number>(() => window.innerHeight - VIEWPORT_MARGIN * 2);

  // Lazy-fetch members on open.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRoleById(roleId)
      .then((role) => {
        if (cancelled) return;
        setMembers(role.members);
      })
      .catch(() => {
        if (cancelled) return;
        setMembers([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [roleId]);

  // Click-outside + escape + page-scroll/resize closes the popover.
  // Scrolling INSIDE the popover (the member list) should NOT close it,
  // so we ignore scroll events whose target lives inside this popover.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) onClose();
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleScroll = (e: Event) => {
      const target = e.target as Node | null;
      if (target && containerRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', onClose);
    };
  }, [onClose]);

  // After mount + on size changes, pick whichever side (below vs above
  // the trigger) fits the popover's natural height. Falls back to
  // whichever side has more room and caps the popover's height to that
  // space. Re-runs on resize and on the loading→loaded transition since
  // the natural height changes once the member list materialises.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const clamp = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const spaceBelow = vh - anchor.below - VIEWPORT_MARGIN;
      const spaceAbove = anchor.above - VIEWPORT_MARGIN;
      // scrollHeight is the un-clipped content height even when overflow
      // is hidden, so it gives us the popover's natural height regardless
      // of any maxHeight we previously set.
      const natural = el.scrollHeight;

      let top: number;
      let cap: number;
      if (natural <= spaceBelow) {
        top = anchor.below;
        cap = spaceBelow;
      } else if (natural <= spaceAbove) {
        top = anchor.above - natural;
        cap = spaceAbove;
      } else if (spaceAbove > spaceBelow) {
        top = VIEWPORT_MARGIN;
        cap = spaceAbove;
      } else {
        top = anchor.below;
        cap = spaceBelow;
      }

      const rect = el.getBoundingClientRect();
      const maxLeft = vw - rect.width - VIEWPORT_MARGIN;
      setMaxHeight(cap);
      setPosition({
        top,
        left: Math.max(VIEWPORT_MARGIN, Math.min(anchor.left, maxLeft)),
      });
    };
    clamp();
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, [anchor.below, anchor.above, anchor.left, loading, members.length]);

  const filtered = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.trim().toLowerCase();
    return members.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    );
  }, [members, search]);

  return (
    <section
      ref={containerRef}
      aria-label={t('roles.list.peoplePopover.title', { count: members.length })}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: POPOVER_WIDTH,
        maxHeight,
        zIndex: 60,
      }}
      className="bg-canvas-50 border border-canvas-300 rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.10)] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-canvas-300">
        <h2 className="m-0 text-[16px] font-semibold leading-6 text-[#041620]">
          {t('roles.list.peoplePopover.title', { count: members.length })}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('roles.list.peoplePopover.close')}
          className="inline-flex items-center justify-center w-8 h-8 border-none bg-transparent rounded-md cursor-pointer text-navy-600 transition-colors hover:bg-canvas-200"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('roles.list.peoplePopover.searchPlaceholder')}
            aria-label={t('roles.list.peoplePopover.searchPlaceholder')}
            disabled={loading || members.length === 0}
            className="w-full pl-10 pr-4 py-2 bg-[#ECECEB] border border-[#B2BCC2] rounded-lg text-[14px] text-navy-900 outline-none placeholder:text-[#395362] focus:border-navy-600 transition-colors disabled:opacity-90 disabled:cursor-not-allowed"
          />
        </div>

        {loading && (
          <div className="py-4 text-center text-[13px] text-navy-600">
            {t('common.loading')}
          </div>
        )}
        {!loading && members.length === 0 && (
          <div className="py-4 text-center text-[13px] text-navy-600">
            {t('roles.form.noMembersYet')}
          </div>
        )}
        {!loading && members.length > 0 && filtered.length === 0 && (
          <div className="py-4 text-center text-[13px] text-navy-600">
            {t('roles.form.noMembersMatch')}
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <ul className="flex flex-col list-none m-0 p-0 max-h-[280px] overflow-y-auto">
            {filtered.map((m, i) => (
              <li
                key={m.id}
                className={`flex items-center gap-3 px-2 py-4 ${i < filtered.length - 1 ? 'border-b border-canvas-300' : ''}`}
              >
                {m.avatarUrl ? (
                  <img
                    src={m.avatarUrl}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#C3C3C2] text-[14px] font-medium text-[#222220] flex-shrink-0">
                    {initialsOf(m.name)}
                  </span>
                )}
                <span className="text-[14px] font-semibold text-navy-900 truncate">{m.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default MemberPopover;
