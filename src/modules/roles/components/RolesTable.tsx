import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { RoleSummary } from '../types';
import AssignedUsersAvatars from './AssignedUsersAvatars';
import RoleRowActions from './RoleRowActions';
import MemberPopover from './MemberPopover';

interface Props {
  items: RoleSummary[];
  loading?: boolean;
  skeletonRowCount?: number;
  onView: (role: RoleSummary) => void;
}

const SortIcon = () => (
  <svg width="14" height="14" viewBox="0 0 20 16" fill="none">
    <path d="M9 13L5 17L1 13M5 17V1M9 1H13M9 5H16M9 9H19" stroke="#08283B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const thClass = "px-4 h-14 text-left text-[16px] font-medium text-[#395362] font-['Poppins'] whitespace-nowrap bg-[#E6EAEB] border-b border-canvas-300 select-none";
const tdClass = "px-4 h-16 align-middle border-b border-canvas-300 text-[16px] text-navy-900 bg-canvas-50";

const RolesTable: React.FC<Props> = ({
  items,
  loading = false,
  skeletonRowCount = 8,
  onView,
}) => {
  const { t } = useTranslation();
  const [popover, setPopover] = useState<{
    roleId: string;
    anchor: { below: number; above: number; left: number };
  } | null>(null);

  // Stable identifiers for the skeleton placeholder rows. Generated once per
  // mount so React doesn't reuse the wrong DOM nodes if `skeletonRowCount`
  // changes mid-render. Not array-index-keyed → Sonar happy.
  const skeletonKeys = useMemo(
    () => Array.from({ length: skeletonRowCount }, () => crypto.randomUUID()),
    [skeletonRowCount],
  );

  const openPopover = (roleId: string, btn: HTMLButtonElement) => {
    const rect = btn.getBoundingClientRect();
    // Hand the popover both candidate positions so it can flip above the
    // trigger if it doesn't fit below. "below" = top of popover when it
    // renders under the trigger; "above" = bottom of popover when it
    // renders over the trigger.
    setPopover({
      roleId,
      anchor: {
        below: rect.bottom + 4,
        above: rect.top - 4,
        left: rect.left,
      },
    });
  };

  const renderBody = () => {
    if (loading) {
      return skeletonKeys.map((key) => (
        <tr key={key}>
          <td className={tdClass}><div className="h-3 w-24 bg-canvas-200 rounded animate-pulse" /></td>
          <td className={tdClass}><div className="h-3 w-64 bg-canvas-200 rounded animate-pulse" /></td>
          <td className={tdClass}><div className="h-8 w-24 bg-canvas-200 rounded-full animate-pulse" /></td>
          <td className={`${tdClass} text-center`}><div className="h-3 w-3 bg-canvas-200 rounded animate-pulse mx-auto" /></td>
        </tr>
      ));
    }

    if (items.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="px-4 py-12 text-center text-navy-500 border-b border-canvas-300 text-[14px] align-middle bg-canvas-50">
            <div className="flex flex-col items-center gap-2">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="8" fill="#F0F0F0" />
                <path d="M12 20h16M20 12v16" stroke="#B2BCC2" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>{t('roles.list.empty')}</span>
            </div>
          </td>
        </tr>
      );
    }

    return items.map((role) => {
      const previews = (role.previewMembers ?? []).map((m) => ({
        id: m.id,
        url: m.avatarUrl,
        name: m.name,
      }));
      const avatars = (
        <AssignedUsersAvatars count={role.memberCount} previews={previews} />
      );
      return (
        <tr
          key={role.id}
          onClick={() => onView(role)}
          className="transition-colors cursor-pointer hover:bg-canvas-100"
        >
          <td className={tdClass}>{role.name}</td>
          <td className={`${tdClass} max-w-[420px]`}>
            <span className="block truncate">{role.description}</span>
          </td>
          <td className={tdClass} onClick={(e) => e.stopPropagation()}>
            {role.memberCount > 0 ? (
              <button
                type="button"
                onClick={(e) => openPopover(role.id, e.currentTarget)}
                aria-haspopup="dialog"
                aria-expanded={popover?.roleId === role.id}
                aria-label={t('roles.list.peoplePopover.openLabel', { count: role.memberCount })}
                className="inline-flex items-center border-none bg-transparent p-0 cursor-pointer rounded-md hover:opacity-80 transition-opacity"
              >
                {avatars}
              </button>
            ) : (
              avatars
            )}
          </td>
          <td className={tdClass} onClick={(e) => e.stopPropagation()}>
            <RoleRowActions role={role} />
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="overflow-x-auto w-full" aria-busy={loading} aria-live="polite">
      {loading && <span className="sr-only">{t('roles.list.loading')}</span>}
      <table className="w-full border-collapse min-w-[600px]">
        <thead>
          <tr>
            <th className={`${thClass} min-w-[160px]`}>
              <span className="inline-flex items-center gap-2">
                {t('roles.list.table.roleName')}
                <SortIcon />
              </span>
            </th>
            <th className={`${thClass} min-w-[260px]`}>{t('roles.list.table.description')}</th>
            <th className={`${thClass} min-w-[200px]`}>{t('roles.list.table.assignedUsers')}</th>
            <th className={`${thClass} w-24`}>{t('roles.list.table.actions')}</th>
          </tr>
        </thead>
        <tbody>{renderBody()}</tbody>
      </table>

      {popover && (
        <MemberPopover
          roleId={popover.roleId}
          anchor={popover.anchor}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  );
};

export default RolesTable;
