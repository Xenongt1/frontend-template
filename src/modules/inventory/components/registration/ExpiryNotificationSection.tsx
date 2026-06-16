import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormField, Input } from '@/shared/components/ui';

interface ExpiryNotificationSectionProps {
  value?: string;
  onChange?: (value: string) => void;
}

export const ExpiryNotificationSection: React.FC<ExpiryNotificationSectionProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation();
  return (
    <section
      aria-labelledby="expiry-notification-heading"
      className="bg-canvas-50 border border-stroke-light rounded-[10px] p-[clamp(12px,2vh,24px)] flex flex-col gap-[clamp(10px,1.6vh,18px)]"
    >
      <div className="border-b border-stroke-light pb-3">
        <h2
          id="expiry-notification-heading"
          className="m-0 font-inter text-lg font-semibold leading-7 text-brand-navy-dark"
        >
          {t('inventory.expiryNotification.title')}
        </h2>
        <p className="mt-1 mb-0 font-inter text-sm font-normal leading-5 text-text-primary">
          {t('inventory.expiryNotification.description')}
        </p>
      </div>

      <div className="bg-[#F7F8F8] rounded-md p-4 flex flex-col gap-3">
        <h3 className="m-0 font-inter text-base font-semibold leading-6 text-text-primary">
          {t('inventory.expiryNotification.subheading')}
        </h3>

        <FormField id="expiry-duration" label={t('inventory.expiryNotification.durationLabel')} required>
          <Input
            id="expiry-duration"
            type="number"
            placeholder={t('inventory.expiryNotification.durationPlaceholder')}
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
          />
        </FormField>
      </div>
    </section>
  );
};
