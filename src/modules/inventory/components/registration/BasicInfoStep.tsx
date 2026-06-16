import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormField, Input, Textarea } from '@/shared/components/ui';
import type { BasicInfoValues } from './types';
import { RegistrationDropdown } from './RegistrationDropdown';

interface BasicInfoStepProps {
  values: BasicInfoValues;
  categoryOptions: { label: string; value: string }[];
  uomOptions: { label: string; value: string }[];
  onChange: (field: keyof BasicInfoValues, value: string) => void;
  errors?: Partial<Record<keyof BasicInfoValues, string>>;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  values,
  categoryOptions,
  uomOptions,
  onChange,
  errors = {},
}) => {
  const { t } = useTranslation();
  return (
    <form
      aria-label={t('inventory.basicInfo.ariaLabel')}
      onSubmit={(e) => e.preventDefault()}
      className="bg-canvas-50 border border-stroke-light rounded-[10px] p-[clamp(12px,2vh,24px)] flex flex-col gap-[clamp(8px,1.5vh,16px)]"
    >
      <div className="border-b border-stroke-light pb-2.5">
        <h2 className="m-0 font-inter text-lg font-semibold leading-7 text-brand-navy-dark">
          {t('inventory.basicInfo.title')}
        </h2>
        <p className="mt-1 mb-0 font-inter text-sm font-normal leading-5 text-text-primary">
          {t('inventory.basicInfo.description')}
        </p>
      </div>

      <div className="flex flex-col gap-[clamp(8px,1.5vh,16px)]">
        {/* Name */}
        <FormField id="item-name" label={t('inventory.basicInfo.nameLabel')} required error={errors.name}>
          <Input
            id="item-name"
            placeholder={t('inventory.basicInfo.namePlaceholder')}
            value={values.name}
            onChange={(e) => onChange('name', e.target.value)}
            aria-invalid={!!errors.name}
          />
        </FormField>

        <div className="flex gap-4">
          {/* Stock Unit (quantity) */}
          <FormField id="item-stockunit" label={t('inventory.basicInfo.stockUnitLabel')} required error={errors.stockUnit}>
            <Input
              id="item-stockunit"
              type="number"
              min="0"
              step="0.01"
              placeholder={t('inventory.basicInfo.stockUnitPlaceholder')}
              value={values.stockUnit}
              onChange={(e) => onChange('stockUnit', e.target.value)}
              aria-invalid={!!errors.stockUnit}
            />
          </FormField>

          {/* Unit of Measure */}
          <FormField id="item-uom" label={t('inventory.basicInfo.uomLabel')} hint={t('inventory.basicInfo.uomHint')} required error={errors.uom}>
            <RegistrationDropdown
              id="item-uom"
              options={uomOptions}
              value={values.uom}
              onChange={(value) => onChange('uom', value)}
              error={errors.uom}
            />
          </FormField>
        </div>

        {/* Category */}
        <FormField id="item-category" label={t('inventory.basicInfo.categoryLabel')} required error={errors.category}>
          <RegistrationDropdown
            id="item-category"
            options={categoryOptions}
            placeholder={t('inventory.basicInfo.categoryPlaceholder')}
            value={values.category}
            onChange={(value) => onChange('category', value)}
            error={errors.category}
          />
        </FormField>

        {/* Description */}
        <FormField id="item-description" label={t('inventory.basicInfo.descriptionLabel')} optional>
          <Textarea
            id="item-description"
            placeholder={t('inventory.basicInfo.descriptionPlaceholder')}
            value={values.description}
            onChange={(e) => onChange('description', e.target.value)}
          />
        </FormField>
      </div>
    </form>
  );
};
