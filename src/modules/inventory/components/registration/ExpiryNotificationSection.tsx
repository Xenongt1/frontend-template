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
      style={{
        background: '#FDFDFD',
        border: '1px solid #E6EAEB',
        borderRadius: 10,
        padding: 'clamp(12px, 2vh, 24px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(10px, 1.6vh, 18px)',
      }}
    >
      <div style={{ borderBottom: '1px solid #E6EAEB', paddingBottom: 12 }}>
        <h2
          id="expiry-notification-heading"
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            fontFamily: "'Inter', system-ui, sans-serif",
            color: '#041620',
            lineHeight: '28px',
          }}
        >
          {t('inventory.expiryNotification.title')}
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
          {t('inventory.expiryNotification.description')}
        </p>
      </div>

      <div
        style={{
          background: '#F7F8F8',
          borderRadius: 6,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            fontFamily: "'Inter', system-ui, sans-serif",
            color: '#08283B',
            lineHeight: '24px',
          }}
        >
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
