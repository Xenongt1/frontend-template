import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Skeleton, SuccessToast } from '@/shared/components/ui';
import RoleForm, { type RoleFormValues, type RoleFormErrors, buildRoleWritePayload } from '../components/RoleForm';
import AssignedMembersSidebar from '../components/AssignedMembersSidebar';
import { listRoles, updateRole } from '../api/rolesApi';
import { useRoleDetail } from '../hooks/useRoleDetail';

const INITIAL_VALUES: RoleFormValues = { name: '', description: '', grantedPermissions: [] };

const EditRolePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams({ strict: false }) as { id?: string };
  const { data, loading, error } = useRoleDetail(id);

  const [values, setValues] = useState<RoleFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<RoleFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Prefill the form when the role finishes loading.
  useEffect(() => {
    if (data) {
      setValues({
        name: data.name,
        description: data.description,
        grantedPermissions: data.grantedPermissions,
      });
    }
  }, [data]);

  const cancel = () => {
    if (id) navigate({ to: `/iam/roles/${id}` });
    else navigate({ to: '/iam/roles' });
  };

  const handleSubmit = async () => {
    if (!id || !data) return;
    setSubmitError(null);

    const name = values.name.trim();
    if (!name) {
      setErrors({ name: t('roles.form.roleNameRequired') });
      return;
    }

    setIsSubmitting(true);
    try {
      // Uniqueness check excludes the role being edited — its current name must not collide with itself.
      const existing = await listRoles({ search: name, pageSize: 50 });
      const duplicate = existing.data.some(
        (r) => r.id !== id && r.name.trim().toLowerCase() === name.toLowerCase()
      );
      if (duplicate) {
        setErrors({ name: t('roles.form.roleNameDuplicate') });
        setIsSubmitting(false);
        return;
      }

      await updateRole(id, buildRoleWritePayload(values));
      setShowSuccess(true);
      window.setTimeout(() => navigate({ to: `/iam/roles/${id}` }), 1200);
    } catch (err) {
      const e = err as Error;
      setSubmitError(e.message || t('roles.edit.genericFailure'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full flex-1 min-h-0 overflow-y-auto pr-1">
      <button
        type="button"
        onClick={cancel}
        className="inline-flex items-center gap-2 self-start px-3 py-2 border border-[#B2BCC2] rounded-lg bg-canvas-50 text-[14px] font-medium text-[#061C2A] cursor-pointer hover:bg-canvas-100 transition-colors"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t('roles.edit.backToDetail')}
      </button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[18px] font-semibold leading-7 text-[#041620] font-['Inter']">
            {t('roles.edit.title')}
          </h1>
          <p className="m-0 text-[14px] text-navy-900 leading-5">
            {t('roles.edit.description')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={cancel}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-5 py-[10px] border border-[#2C2B29] rounded-lg bg-canvas-50 text-[14px] font-medium text-[#2C2B29] cursor-pointer transition-colors hover:bg-canvas-100 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || loading || !data}
            className="inline-flex items-center justify-center px-5 py-[10px] border-none rounded-lg bg-navy-900 text-canvas-50 text-[14px] font-medium cursor-pointer transition-colors hover:bg-navy-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('roles.edit.saving') : t('roles.edit.updateRole')}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-red-800 text-[13px]">
          {error}
        </div>
      )}

      {submitError && (
        <div role="alert" className="px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-red-800 text-[13px]">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
        <div className="min-w-0">
          {loading ? (
            <div className="flex flex-col gap-4">
              <Skeleton variant="block" className="h-32 w-full" />
              <Skeleton variant="block" className="h-40 w-full" />
              <Skeleton variant="block" className="h-40 w-full" />
            </div>
          ) : (
            <RoleForm values={values} errors={errors} onChange={setValues} />
          )}
        </div>
        <div className="min-w-0">
          {loading ? (
            <Skeleton variant="block" className="h-64 w-full" />
          ) : (
            <AssignedMembersSidebar members={data?.members ?? []} />
          )}
        </div>
      </div>

      {showSuccess && (
        <SuccessToast
          message={t('roles.edit.successToast')}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};

export default EditRolePage;
