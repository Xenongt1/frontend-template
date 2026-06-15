import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supplierApi } from '@/core/api/supplier';
import type { SupplierStatus } from '@/core/api';

const StatusBadge: React.FC<{ status?: SupplierStatus }> = ({ status }) => {
  const { t } = useTranslation();
  if (status === 'SUSPENDED') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium bg-[#FDF2F2] border border-[#FDE8E8] text-[#9B1C1C]">
        {t('suppliers.list.badgeSuspended')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium bg-[#F3FAF7] border border-[#DEF7EC] text-[#03543F]">
      {t('suppliers.list.badgeActive')}
    </span>
  );
};

const Field: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <span className="font-inter text-sm text-text-tertiary">{label}</span>
    <span className="font-inter text-sm font-semibold text-text-primary">{value || '—'}</span>
  </div>
);

const SectionCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <div className="bg-surface-card rounded-xl border border-stroke-light p-6 flex flex-col gap-4">
    <div className="flex flex-col gap-0.5 pb-4 border-b border-stroke-light">
      <h2 className="m-0 font-inter font-bold text-base text-text-primary">{title}</h2>
      {subtitle && (
        <p className="m-0 font-inter text-sm text-text-tertiary">{subtitle}</p>
      )}
    </div>
    {children}
  </div>
);

const SupplierDetailPage: React.FC = () => {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => supplierApi.getSupplierById(id),
    enabled: !!id,
  });

  const supplier = data?.data;

  if (isLoading) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto bg-surface-page p-6 flex flex-col gap-4">
        <div className="h-9 w-36 bg-canvas-300 rounded-lg animate-pulse" />
        <div className="bg-surface-card rounded-xl border border-stroke-light p-6 flex flex-col gap-6">
          <div className="h-5 w-48 bg-canvas-300 rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="h-4 w-24 bg-canvas-300 rounded animate-pulse" />
                <div className="h-5 w-40 bg-canvas-300 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto bg-surface-page p-6 flex flex-col gap-4">
        <button
          type="button"
          onClick={() => navigate({ to: '/suppliers' })}
          className="inline-flex items-center gap-2 px-4 py-2 border border-stroke-light rounded-lg bg-surface-card font-inter text-sm text-text-primary cursor-pointer hover:bg-canvas-100 transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          {t('suppliers.detail.backButton')}
        </button>
        <p className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-800 m-0">
          {error ? (error as Error).message : t('suppliers.detail.notFound')}
        </p>
      </div>
    );
  }

  const phone = supplier.phoneCountryCode
    ? `${supplier.phoneCountryCode} ${supplier.phoneNumber}`
    : supplier.phoneNumber;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-surface-page p-6 flex flex-col gap-4 box-border">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate({ to: '/suppliers' })}
        className="inline-flex items-center gap-2 px-4 py-2 border border-stroke-light rounded-lg bg-surface-card font-inter text-sm font-medium text-text-primary cursor-pointer hover:bg-canvas-100 transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        {t('suppliers.detail.backButton')}
      </button>

      {/* General Information */}
      <SectionCard title={t('suppliers.detail.generalInfoTitle')}>
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <Field label={t('suppliers.detail.fieldCompanyName')} value={supplier.companyName} />
          <Field label={t('suppliers.detail.fieldSupplierName')} value={supplier.fullName} />
          <Field label={t('suppliers.detail.fieldPhone')} value={phone} />
          <Field label={t('suppliers.detail.fieldEmail')} value={supplier.email} />
          <div className="flex flex-col gap-1">
            <span className="font-inter text-sm text-text-tertiary">{t('suppliers.detail.fieldStatus')}</span>
            <StatusBadge status={supplier.status} />
          </div>
        </div>

        {supplier.notes && (
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="font-inter text-sm text-text-tertiary">{t('suppliers.detail.fieldNotes')}</span>
            <div className="px-4 py-3 bg-surface-overlay rounded-lg font-inter text-sm text-text-primary leading-relaxed">
              {supplier.notes}
            </div>
          </div>
        )}
      </SectionCard>

      {/* Approved Materials */}
      <SectionCard
        title={t('suppliers.detail.approvedMaterialsTitle')}
        subtitle={t('suppliers.detail.approvedMaterialsSubtitle')}
      >
        {supplier.approvedItems.length === 0 ? (
          <p className="m-0 font-inter text-sm text-text-tertiary">{t('suppliers.detail.noMaterials')}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {supplier.approvedItems.map(item => (
              <span
                key={item.inventoryItemId}
                className="inline-flex items-center px-3 py-1.5 bg-[#E6F4F1] border border-[#B2D8D2] rounded-lg font-inter text-sm font-medium text-[#1A5C54] whitespace-nowrap"
              >
                {item.name}
              </span>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default SupplierDetailPage;
