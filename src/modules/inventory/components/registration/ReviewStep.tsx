import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AttributeItem, BasicInfoValues, IntakeField } from './types';

interface ReviewStepProps {
  basicInfo: BasicInfoValues;
  categoryOptions: { label: string; value: string }[];
  uomOptions: { label: string; value: string }[];
  attributes: AttributeItem[];
  intakeFields: IntakeField[];
  tags: string[];
  enableExpiryAlert: boolean;
  expiryDays: string;
  enableReorderAlert: boolean;
  reorderLevel: string;
  enableMinStockAlert: boolean;
  minStockLevel: string;
}

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <span className="font-inter text-xs font-medium text-text-tertiary">{label}</span>
    <span className="font-inter text-sm font-medium text-text-primary">{value}</span>
  </div>
);

const getOptionLabel = (value: string, options: { label: string; value: string }[]) =>
  options.find((option) => option.value === value)?.label ?? '—';

const ReviewPanel: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="px-4 py-3 bg-surface-page rounded-lg flex flex-col items-start gap-2">
    <div className="self-stretch flex flex-col items-start gap-4">
      <div className="self-stretch pb-3.5 border-b border-stroke-light flex items-center">
        <h3 className="m-0 flex-1 text-brand-navy-dark font-inter text-lg font-semibold leading-7">
          {title}
        </h3>
      </div>
      {children}
    </div>
  </div>
);

// Badge variants — three palettes used across the file.
const GreenBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center px-3 py-0.5 rounded-md border border-[#DEF7EC] bg-[#F3FAF7] text-[#03543F] font-inter text-sm font-semibold leading-[21px] text-center">
    {children}
  </span>
);

const TagBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center px-3 py-0.5 rounded-md border border-[#FDE8E8] bg-[#FDF2F2] text-[#9B1C1C] font-inter text-sm font-medium leading-[21px]">
    {children}
  </span>
);

const TypeBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md border border-stroke-light bg-canvas-50 text-text-primary font-inter text-xs font-medium leading-[18px] whitespace-nowrap">
    {children}
  </span>
);

const RequiredBadge: React.FC<{ required: boolean }> = ({ required }) => {
  const { t } = useTranslation();
  return (
    <span
      className={[
        'inline-flex items-center justify-center px-2.5 py-0.5 rounded-md',
        'font-inter text-xs font-medium leading-[18px] text-center whitespace-nowrap border',
        required
          ? 'bg-[#FDF2F2] border-[#FDE8E8] text-[#9B1C1C]'
          : 'bg-[#FFF9E6] border-[#FFEBB0] text-[#8C6900]',
      ].join(' ')}
    >
      {required ? t('common.required') : t('common.optional')}
    </span>
  );
};

const EnabledBadge: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const { t } = useTranslation();
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-md',
        'font-inter text-xs font-medium leading-[18px] border',
        enabled
          ? 'bg-[#F3FAF7] border-[#84E1BC] text-[#03543F]'
          : 'bg-[#F3F4F6] border-[#D1D5DB] text-[#6B7280]',
      ].join(' ')}
    >
      {enabled ? t('common.true') : t('common.false')}
    </span>
  );
};

const NotificationReviewCard: React.FC<{ title: string; enabled: boolean; value: string }> = ({
  title,
  enabled,
  value,
}) => (
  <div className="rounded-lg border border-stroke-light p-3">
    <h4 className="m-0 font-inter text-[13px] font-semibold text-brand-navy-dark">
      {title}
    </h4>
    <div className="mt-2 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="font-inter text-xs text-text-tertiary">Enabled:</span>
        <EnabledBadge enabled={enabled} />
      </div>
      <div className="flex items-center gap-2">
        <span className="font-inter text-xs text-text-tertiary">Value:</span>
        {value !== '—' ? (
          <GreenBadge>{value}</GreenBadge>
        ) : (
          <span className="font-inter text-[13px] text-text-tertiary">—</span>
        )}
      </div>
    </div>
  </div>
);

export const ReviewStep: React.FC<ReviewStepProps> = ({
  basicInfo,
  categoryOptions,
  uomOptions,
  attributes,
  intakeFields,
  tags,
  enableExpiryAlert,
  expiryDays,
  enableReorderAlert,
  reorderLevel,
  enableMinStockAlert,
  minStockLevel,
}) => {
  const { t } = useTranslation();
  const categoryLabel = basicInfo.category
    ? getOptionLabel(basicInfo.category, categoryOptions)
    : '—';
  const uomLabel = basicInfo.uom ? getOptionLabel(basicInfo.uom, uomOptions) : '—';
  const visibleIntakeFields = intakeFields.filter((field) => field.label.trim());

  return (
    <section
      aria-label={t('inventory.review.ariaLabel')}
      className="bg-canvas-50 border border-stroke-light rounded-[10px] p-[clamp(12px,2vh,24px)] flex flex-col gap-4"
    >
      <div className="border-b border-stroke-light pb-2.5">
        <h2 className="m-0 font-inter text-lg font-semibold leading-7 text-brand-navy-dark">
          {t('inventory.review.title')}
        </h2>
        <p className="mt-1 mb-0 font-inter text-sm font-normal leading-5 text-text-primary">
          {t('inventory.review.description')}
        </p>
      </div>

      <div className="flex flex-col gap-[18px]">
        {/* Basic Information */}
        <div>
          <h3 className="m-0 font-inter text-base font-semibold text-brand-navy-dark">
            {t('inventory.review.basicInformation')}
          </h3>
          <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
            <InfoItem label={t('inventory.review.nameLabel')} value={basicInfo.name || '—'} />
            <InfoItem label={t('inventory.review.stockUnitLabel')} value={basicInfo.stockUnit || '—'} />
            <InfoItem label={t('inventory.review.categoryLabel')} value={categoryLabel} />
            <InfoItem label={t('inventory.review.uomLabel')} value={uomLabel} />
          </div>
          <div className="mt-3">
            <span className="font-inter text-xs font-medium text-text-tertiary">
              {t('inventory.review.descriptionLabel')}
            </span>
            <div className="mt-1.5 p-3 bg-canvas-200 rounded-lg font-inter text-sm text-text-secondary">
              {basicInfo.description || '—'}
            </div>
          </div>
        </div>

        {/* Attributes */}
        {attributes.length === 0 ? (
          <div className="rounded-lg border border-stroke-light p-3">
            <h4 className="m-0 font-inter text-sm font-semibold text-brand-navy-dark">
              {t('inventory.review.attributes')}
            </h4>
            <p className="mt-2 mb-0 font-inter text-[13px] text-text-tertiary">—</p>
          </div>
        ) : (
          <ReviewPanel title={t('inventory.review.attributes')}>
            <div className="self-stretch flex items-center gap-2.5 flex-wrap">
              {attributes.map((attribute) => (
                <GreenBadge key={attribute.id}>
                  {attribute.label}: {attribute.value}
                  {attribute.type && (
                    <span className="ml-1.5 px-1.5 py-px text-[11px] font-medium rounded bg-[#D1FAE5] text-[#065F46] capitalize">
                      {attribute.type}
                    </span>
                  )}
                </GreenBadge>
              ))}
            </div>
          </ReviewPanel>
        )}

        {/* Stock Level Properties (intake fields) */}
        {visibleIntakeFields.length === 0 ? (
          <div>
            <h3 className="m-0 font-inter text-base font-semibold text-brand-navy-dark">
              {t('inventory.review.intakeFields')}
            </h3>
            <div className="mt-3">
              <span className="font-inter text-[13px] text-text-tertiary">
                {t('inventory.review.noIntakeFields')}
              </span>
            </div>
          </div>
        ) : (
          <ReviewPanel title={t('inventory.review.intakeFields')}>
            <div className="self-stretch flex items-center gap-2.5 flex-wrap">
              {visibleIntakeFields.map((field) => (
                <div
                  key={field.id}
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-canvas-50 rounded-xl border border-stroke-medium min-h-[42px]"
                >
                  <span className="font-inter text-sm font-medium leading-[21px] text-text-primary break-words">
                    {field.label}
                  </span>
                  <TypeBadge>
                    {field.type === 'number'
                      ? t('inventory.properties.typeNumber')
                      : t('inventory.properties.typeText')}
                  </TypeBadge>
                  <RequiredBadge required={field.required} />
                </div>
              ))}
            </div>
          </ReviewPanel>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <ReviewPanel title={t('inventory.review.tagsLabel')}>
            <div className="self-stretch flex items-center gap-2 flex-wrap">
              {tags.map((tag) => (
                <TagBadge key={tag}>{tag}</TagBadge>
              ))}
            </div>
          </ReviewPanel>
        )}

        {/* Notifications */}
        <div>
          <h3 className="m-0 mb-3 font-inter text-base font-semibold text-brand-navy-dark">
            {t('inventory.review.notifications')}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
            <NotificationReviewCard
              title={t('inventory.notifications.expiryTitle')}
              enabled={enableExpiryAlert}
              value={expiryDays ? t('common.days', { count: Number(expiryDays) }) : '—'}
            />
            <NotificationReviewCard
              title={t('inventory.review.reorderLevel')}
              enabled={enableReorderAlert}
              value={reorderLevel || '—'}
            />
            <NotificationReviewCard
              title={t('inventory.review.minStockLevel')}
              enabled={enableMinStockAlert}
              value={minStockLevel || '—'}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
