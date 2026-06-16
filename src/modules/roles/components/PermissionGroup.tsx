import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PermissionAreaDefinition } from '../data/permissionCatalogue';
import PermissionRow from './PermissionRow';

interface Props {
  area: PermissionAreaDefinition;
  /** Set of granted permission codes (we use a Set for O(1) membership). */
  granted: Set<string>;
  /** Toggle a single permission. Omit for read-only mode. */
  onTogglePermission?: (code: string, checked: boolean) => void;
  /** Toggle every permission in the area at once. Omit for read-only mode. */
  onToggleAll?: (checked: boolean) => void;
}

const PermissionGroup: React.FC<Props> = ({ area, granted, onTogglePermission, onToggleAll }) => {
  const { t } = useTranslation();
  const grantedInArea = area.permissions.filter((p) => granted.has(p.code)).length;
  const total = area.permissions.length;
  const allSelected = grantedInArea === total;
  const readOnly = !onTogglePermission && !onToggleAll;

  return (
    <section
      aria-labelledby={`permission-area-${area.code}`}
      className="rounded-md border border-canvas-300 overflow-hidden"
    >
      <header className="px-4 py-3.5 bg-[#F7F7F7] border-b border-canvas-300 flex items-center gap-2">
        <h3 id={`permission-area-${area.code}`} className="m-0 text-[14px] font-medium text-navy-900">
          {area.title ?? (area.titleKey ? t(area.titleKey) : area.code)}{' '}
          <span className="text-[14px] font-medium text-[#5A6F7C]">
            {t('roles.form.permissionsGrantedCount', { granted: grantedInArea, total })}
          </span>
        </h3>
      </header>

      <div className={`px-4 py-2.5 flex flex-col gap-4 bg-canvas-50 ${readOnly ? 'opacity-80' : ''}`}>
        {!readOnly && onToggleAll && (
          <label className="inline-flex items-center gap-2 text-[14px] font-semibold text-navy-900 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onToggleAll(e.target.checked)}
              className="w-4 h-4 rounded-[3px] border border-[#B2BCC2] accent-navy-900 cursor-pointer"
              aria-label={t('roles.form.selectAll')}
            />
            <span>{t('roles.form.selectAll')}</span>
          </label>
        )}

        {area.permissions.map((perm) => (
          <PermissionRow
            key={perm.code}
            permission={perm}
            checked={granted.has(perm.code)}
            onChange={onTogglePermission ? (next) => onTogglePermission(perm.code, next) : undefined}
          />
        ))}
      </div>
    </section>
  );
};

export default PermissionGroup;
