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
      style={{
        background: '#FDFDFD',
        border: '1px solid #E6EAEB',
        borderRadius: 10,
        padding: 'clamp(12px, 2vh, 24px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(8px, 1.5vh, 16px)',
      }}
    >
      <div style={{ borderBottom: '1px solid #E6EAEB', paddingBottom: 10 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            fontFamily: "'Inter', system-ui, sans-serif",
            color: '#041620',
            lineHeight: '28px',
          }}
        >
          {t('inventory.basicInfo.title')}
        </h2>
        <p
          style={{
            margin: '4px 0 0 0',
            fontSize: 14,
            fontWeight: 400,
            fontFamily: "'Inter', system-ui, sans-serif",
            color: '#08283B',
            lineHeight: '20px',
          }}
        >
          {t('inventory.basicInfo.description')}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.5vh, 16px)' }}>
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

        <div style={{ display: 'flex', gap: 16 }}>
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
