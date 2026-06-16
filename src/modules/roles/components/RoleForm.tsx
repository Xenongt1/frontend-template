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

interface Props {
  values: RoleFormValues;
  errors?: RoleFormErrors;
  onChange: (next: RoleFormValues) => void;
}

const EMPTY_ERRORS: RoleFormErrors = {};

const RoleForm: React.FC<Props> = ({ values, errors = EMPTY_ERRORS, onChange }) => {
  const { catalogue, loading: catalogueLoading, error: catalogueError } = usePermissionCatalogue();

  const { t } = useTranslation();

  // Set wrapper for O(1) membership checks while still emitting an array
  // out via onChange (matches RoleWritePayload).
  const grantedSet = useMemo(() => new Set(values.grantedPermissions), [values.grantedPermissions]);

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
    <form
      aria-label={t('roles.form.grantedPermissions')}
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-6"
    >
      {/* Basic info */}
      <div className="flex flex-col gap-4 bg-canvas-50 rounded-lg border border-canvas-300 p-6">
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

      {/* Granted Permissions */}
      <div className="flex flex-col gap-4">
        <h2 className="m-0 text-[18px] font-semibold text-[#041620]">
          {t('roles.form.grantedPermissions')}
        </h2>
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
      </div>
    </form>
  );
};

/** Helper to build the API payload from form values. */
export function buildRoleWritePayload(values: RoleFormValues): RoleWritePayload {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    grantedPermissions: values.grantedPermissions,
  };
}

export default RoleForm;
