import React from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui';
import { useRoleDetail } from '../hooks/useRoleDetail';
import PermissionGroup from '../components/PermissionGroup';
import AssignedMembersSidebar from '../components/AssignedMembersSidebar';
import { usePermissionCatalogue } from '../hooks/usePermissionCatalogue';

const SKELETON_KEYS = ['skeleton-perm-1', 'skeleton-perm-2', 'skeleton-perm-3'];

const RoleDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams({ strict: false }) as { id?: string };
  const { data, loading, error } = useRoleDetail(id);
  const { catalogue, loading: catalogueLoading } = usePermissionCatalogue();

  const grantedSet = React.useMemo(
    () => new Set(data?.grantedPermissions ?? []),
    [data?.grantedPermissions]
  );

  return (
    <div className="flex flex-col gap-4 w-full flex-1 min-h-0 overflow-y-auto pr-1">
      <button
        type="button"
        onClick={() => navigate({ to: '/iam/roles' })}
        className="inline-flex items-center gap-2 self-start px-3 py-2 border border-[#B2BCC2] rounded-lg bg-canvas-50 text-[14px] font-medium text-[#061C2A] cursor-pointer hover:bg-canvas-100 transition-colors"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t('roles.create.backToRoles')}
      </button>

      <div className="flex flex-col gap-2 pb-[10px]">
        <h1 className="m-0 text-[18px] font-semibold leading-7 text-[#041620] font-['Inter']">
          {t('roles.detail.title')}
        </h1>
        <p className="m-0 text-[14px] text-navy-900 leading-5">{t('roles.detail.description')}</p>
      </div>

      {error && (
        <div role="alert" className="px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-red-800 text-[13px]">
          {error}
        </div>
      )}

      {/* Role identity card — full-width row */}
      <div className="bg-canvas-50 rounded-lg border border-stroke-light px-[21px] py-[18px] flex flex-col gap-4">
        {loading && (
          <>
            <Skeleton variant="text" className="w-32 h-5" />
            <Skeleton variant="text" className="w-3/4 h-4" />
          </>
        )}
        {!loading && data && (
          <>
            <div className="pb-3 border-b border-stroke-light">
              <span className="text-[18px] font-medium leading-[27px] text-[#041620]">
                {data.name}
              </span>
            </div>
            <p className="m-0 text-[14px] text-navy-900 leading-5">
              {data.description || '—'}
            </p>
          </>
        )}
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
        {/* Granted Permissions card */}
        <div className="bg-canvas-50 rounded-lg border border-stroke-light px-[21px] py-[18px] flex flex-col gap-4 min-w-0">
          <div className="py-2 border-b border-stroke-light">
            <h2 className="m-0 text-[18px] font-semibold leading-7 text-[#041620]">
              {t('roles.form.grantedPermissions')}
            </h2>
          </div>

          {(loading || catalogueLoading) && (
            <div className="flex flex-col gap-4">
              {SKELETON_KEYS.map((key) => (
                <Skeleton key={key} variant="block" className="h-40 w-full" />
              ))}
            </div>
          )}
          {!loading && !catalogueLoading && (
            <div className="flex flex-col gap-4">
              {catalogue.map((area) => (
                <PermissionGroup key={area.code} area={area} granted={grantedSet} />
              ))}
            </div>
          )}
        </div>

        {/* Assigned Members card */}
        <div className="min-w-0">
          {loading ? (
            <Skeleton variant="block" className="h-64 w-full" />
          ) : (
            <AssignedMembersSidebar members={data?.members ?? []} />
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleDetailPage;
