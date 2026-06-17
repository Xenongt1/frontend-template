import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { RoleMember } from '../types';

interface Props {
  members: RoleMember[];
  /** When true the search input is hidden (useful when the list is intentionally empty). */
  hideSearchWhenEmpty?: boolean;
}

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="5" stroke="#395362" strokeWidth="1.5" />
    <path d="M11 11L14 14" stroke="#395362" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

const AssignedMembersSidebar: React.FC<Props> = ({ members, hideSearchWhenEmpty = false }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.trim().toLowerCase();
    return members.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    );
  }, [members, search]);

  const empty = members.length === 0;
  const showSearch = !(empty && hideSearchWhenEmpty);

  // Cap the visible list when no search is active. Searching always shows
  // every match — the user is specifically looking for them.
  const MEMBERS_VISIBLE_LIMIT = 10;
  const isSearching = search.trim().length > 0;
  const visibleMembers = isSearching
    ? filteredMembers
    : filteredMembers.slice(0, MEMBERS_VISIBLE_LIMIT);
  const hiddenCount = isSearching
    ? 0
    : Math.max(0, filteredMembers.length - MEMBERS_VISIBLE_LIMIT);

  return (
    <aside
      aria-label={t('roles.form.assignedMembers', { count: members.length })}
      className="bg-canvas-50 rounded-md border border-canvas-300 p-4 flex flex-col gap-4 w-full"
    >
      <div className="p-2.5 border-b border-canvas-300">
        <h2 className="m-0 text-[14px] font-normal text-[#041620]">
          {t('roles.form.assignedMembers', { count: members.length })}
        </h2>
      </div>

      {showSearch && (
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder={t('roles.form.searchMembers')}
            aria-label={t('roles.form.searchMembers')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={empty}
            className="w-full pl-10 pr-4 py-2 bg-[#ECECEB] border border-[#B2BCC2] rounded-lg text-[14px] text-navy-900 outline-none placeholder:text-[#395362] focus:border-navy-600 transition-colors disabled:opacity-90 disabled:cursor-not-allowed"
          />
        </div>
      )}

      {empty && (
        <div className="rounded-lg border border-canvas-300 px-4 py-6 text-center text-[13px] text-navy-600">
          {t('roles.form.noMembersYet')}
        </div>
      )}
      {!empty && filteredMembers.length === 0 && (
        <div className="rounded-lg border border-canvas-300 px-4 py-6 text-center text-[13px] text-navy-600">
          {t('roles.form.noMembersMatch')}
        </div>
      )}
      {!empty && filteredMembers.length > 0 && (
        <ul className="flex flex-col list-none m-0 p-0">
          {visibleMembers.map((m, i) => {
            const isLastVisible = i === visibleMembers.length - 1;
            // Show a separator under every row except the last one *unless*
            // we're appending a +N-more footer below the list.
            const showSeparator = !isLastVisible || hiddenCount > 0;
            return (
              <li
                key={m.id}
                className={`flex items-center gap-2 p-4 ${showSeparator ? 'border-b border-canvas-300' : ''}`}
              >
                {m.avatarUrl ? (
                  <img
                    src={m.avatarUrl}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#C3C3C2] text-[12px] font-medium text-[#222220] flex-shrink-0">
                    {initialsOf(m.name)}
                  </span>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-[16px] font-medium text-navy-900 truncate leading-6">{m.name}</span>
                  <span className="text-[14px] text-[#395362] truncate leading-[21px]">{m.email}</span>
                </div>
              </li>
            );
          })}
          {hiddenCount > 0 && (
            <li className="px-4 py-3 text-center text-[13px] text-[#395362]">
              {t('roles.form.andNMore', { count: hiddenCount })}
            </li>
          )}
        </ul>
      )}
    </aside>
  );
};

export default AssignedMembersSidebar;
