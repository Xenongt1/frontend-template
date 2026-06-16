import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { SuccessToast } from '@/shared/components/ui';
import RoleForm, { type RoleFormValues, type RoleFormErrors, buildRoleWritePayload } from '../components/RoleForm';
import AssignedMembersSidebar from '../components/AssignedMembersSidebar';
import { createRole, listRoles } from '../api/rolesApi';

const INITIAL_VALUES: RoleFormValues = {
  name: '',
  description: '',
  grantedPermissions: [],
};

const CreateRolePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [values, setValues] = useState<RoleFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<RoleFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    setSubmitError(null);
    const name = values.name.trim();
    if (!name) {
      setErrors({ name: t('roles.form.roleNameRequired') });
      return;
    }

    setIsSubmitting(true);
    try {
      // Async uniqueness check against the existing list.
      const existing = await listRoles({ search: name, pageSize: 50 });
      const duplicate = existing.data.some(
        (r) => r.name.trim().toLowerCase() === name.toLowerCase()
      );
      if (duplicate) {
        setErrors({ name: t('roles.form.roleNameDuplicate') });
        setIsSubmitting(false);
        return;
      }

      const created = await createRole(buildRoleWritePayload(values));
      setShowSuccess(true);
      // Brief pause so users see the toast, then navigate to the new role's detail page.
      window.setTimeout(() => navigate({ to: `/iam/roles/${created.id}` }), 1200);
    } catch (err) {
      const e = err as Error;
      setSubmitError(e.message || t('roles.create.genericFailure'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full flex-1 min-h-0 overflow-y-auto pr-1">
      <button
        type="button"
        onClick={() => navigate({ to: '/iam/roles' })}
        className="inline-flex items-center gap-2 self-start px-4 py-2 border border-canvas-300 rounded-lg bg-canvas-50 text-[14px] text-navy-900 cursor-pointer hover:bg-canvas-100 transition-colors"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t('roles.create.backToRoles')}
      </button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[18px] font-semibold leading-7 text-[#041620] font-['Inter']">
            {t('roles.create.title')}
          </h1>
          <p className="m-0 text-[14px] text-navy-900">{t('roles.create.description')}</p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center px-5 py-[10px] border-none rounded-lg bg-navy-900 text-canvas-50 text-[14px] font-medium cursor-pointer transition-colors hover:bg-navy-800 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t('roles.create.saving') : t('roles.create.saveAndApply')}
        </button>
      </div>

      {submitError && (
        <div role="alert" className="px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-red-800 text-[13px]">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
        <div className="min-w-0">
          <RoleForm values={values} errors={errors} onChange={setValues} />
        </div>
        <div className="min-w-0">
          <AssignedMembersSidebar members={[]} />
        </div>
      </div>

      {showSuccess && (
        <SuccessToast
          message={t('roles.create.successToast')}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};

export default CreateRolePage;
