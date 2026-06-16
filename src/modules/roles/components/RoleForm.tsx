import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermissionCatalogue } from '../hooks/usePermissionCatalogue';
import { Skeleton } from '@/shared/components/ui';
import type { RoleWritePayload } from '../types';
import PermissionGroup from './PermissionGroup';

export interface RoleFormValues {
  name: string;
  description: string;
  grantedPermissions: string[];
}

export interface RoleFormErrors {
  name?: string;
}

const EMPTY_ERRORS: RoleFormErrors = {};

// Card shape used by every panel on the role pages (Role identity, Granted
// Permissions, etc.). Matches the Figma snippet — white bg, 1px stroke-light
// border, 8px corners, 21px / 18px padding.
const cardClass =
  'bg-canvas-50 rounded-lg border border-stroke-light px-[21px] py-[18px]';

// ─── Basic info card (Role Name + Description) ────────────────────────────────

interface BasicInfoCardProps {
  values: RoleFormValues;
  errors?: RoleFormErrors;
  onChange: (next: RoleFormValues) => void;
}

export const RoleBasicInfoCard: React.FC<BasicInfoCardProps> = ({
  values,
  errors = EMPTY_ERRORS,
  onChange,
}) => {
  const { t } = useTranslation();
  return (
    <div className={`${cardClass} flex flex-col gap-4`}>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="role-name" className="text-[14px] font-medium text-navy-900">
          {t('roles.form.roleNameLabel')}
          <span className="text-red-700">*</span>
        </label>
        <input
          id="role-name"
          type="text"
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          placeholder={t('roles.form.roleNamePlaceholder')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'role-name-error' : undefined}
          className={`w-full px-4 py-2 bg-[#ECECEB] border rounded-lg text-[14px] text-navy-900 outline-none placeholder:text-[#395362] focus:border-navy-600 transition-colors ${
            errors.name ? 'border-red-700' : 'border-[#B2BCC2]'
          }`}
        />
        {errors.name && (
          <p id="role-name-error" className="m-0 text-[12px] text-red-800">
            {errors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="role-description" className="text-[14px] font-medium text-navy-900">
          {t('roles.form.descriptionLabel')}{' '}
          <span className="text-navy-500 font-normal">{t('roles.form.descriptionOptional')}</span>
        </label>
        <textarea
          id="role-description"
          rows={3}
          value={values.description}
          onChange={(e) => onChange({ ...values, description: e.target.value })}
          placeholder={t('roles.form.descriptionPlaceholder')}
          className="w-full px-4 py-2 bg-[#ECECEB] border border-[#B2BCC2] rounded-lg text-[14px] text-navy-900 outline-none placeholder:text-[#395362] focus:border-navy-600 transition-colors resize-y"
        />
      </div>
    </div>
  );
};

// ─── Permissions card (heading + groups) ──────────────────────────────────────

interface PermissionsCardProps {
  values: RoleFormValues;
  onChange: (next: RoleFormValues) => void;
}

export const RolePermissionsCard: React.FC<PermissionsCardProps> = ({ values, onChange }) => {
  const { t } = useTranslation();
  const { catalogue, loading: catalogueLoading, error: catalogueError } = usePermissionCatalogue();

  const grantedSet = useMemo(
    () => new Set(values.grantedPermissions),
    [values.grantedPermissions],
  );

  const setGranted = (next: Set<string>) => {
    onChange({ ...values, grantedPermissions: Array.from(next) });
  };

  const togglePermission = (code: string, checked: boolean) => {
    const next = new Set(grantedSet);
    if (checked) next.add(code);
    else next.delete(code);
    setGranted(next);
  };

  const toggleArea = (areaCodes: string[], checked: boolean) => {
    const next = new Set(grantedSet);
    for (const c of areaCodes) {
      if (checked) next.add(c);
      else next.delete(c);
    }
    setGranted(next);
  };

  return (
    <section
      aria-labelledby="granted-permissions-heading"
      className={`${cardClass} flex flex-col gap-4 min-w-0`}
    >
      <div className="py-2 border-b border-stroke-light">
        <h2
          id="granted-permissions-heading"
          className="m-0 text-[18px] font-semibold leading-7 text-[#041620]"
        >
          {t('roles.form.grantedPermissions')}
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {catalogueLoading && (
          <>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} variant="block" className="h-40 w-full" />
            ))}
          </>
        )}
        {!catalogueLoading && catalogueError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
            {catalogueError}
          </div>
        )}
        {!catalogueLoading && !catalogueError && catalogue.map((area) => (
          <PermissionGroup
            key={area.code}
            area={area}
            granted={grantedSet}
            onTogglePermission={togglePermission}
            onToggleAll={(checked) => toggleArea(area.permissions.map((p) => p.code), checked)}
          />
        ))}
      </div>
    </section>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Helper to build the API payload from form values. */
export function buildRoleWritePayload(values: RoleFormValues): RoleWritePayload {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    grantedPermissions: values.grantedPermissions,
  };
}
