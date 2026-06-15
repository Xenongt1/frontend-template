import React from 'react';
import { useTranslation } from 'react-i18next';
import NotificationCard from './NotificationCard';

interface NotificationsStepProps {
  enableExpiryAlert: boolean;
  expiryDays: string;
  onToggleExpiryAlert: () => void;
  onExpiryDaysChange: (value: string) => void;

  enableReorderAlert: boolean;
  reorderLevel: string;
  onToggleReorderAlert: () => void;
  onReorderLevelChange: (value: string) => void;

  enableMinStockAlert: boolean;
  minStockLevel: string;
  onToggleMinStockAlert: () => void;
  onMinStockLevelChange: (value: string) => void;

  errors?: Record<string, string>;
}









export const NotificationsStep: React.FC<NotificationsStepProps> = ({
  enableExpiryAlert,
  expiryDays,
  onToggleExpiryAlert,
  onExpiryDaysChange,
  enableReorderAlert,
  reorderLevel,
  onToggleReorderAlert,
  onReorderLevelChange,
  enableMinStockAlert,
  minStockLevel,
  onToggleMinStockAlert,
  onMinStockLevelChange,
  errors = {},
}) => {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vh, 20px)' }}>
      <NotificationCard
        ariaLabelledBy="expiry-alert-heading"
        title={t('inventory.notifications.expiryTitle')}
        description={t('inventory.notifications.expiryDescription')}
        toggleLabel={t('inventory.notifications.enableExpiry')}
        enabled={enableExpiryAlert}
        onToggle={onToggleExpiryAlert}
        fieldId="expiry-days"
        fieldLabel={t('inventory.notifications.durationLabel')}
        fieldPlaceholder={t('inventory.notifications.durationPlaceholder')}
        value={expiryDays}
        onChange={onExpiryDaysChange}
        error={errors.expiryDays}
      />

      <NotificationCard
        ariaLabelledBy="reorder-alert-heading"
        title={t('inventory.notifications.reorderTitle')}
        subtitle={t('inventory.notifications.reorderSubtitle')}
        description={t('inventory.notifications.reorderDescription')}
        toggleLabel={t('inventory.notifications.enableReorder')}
        enabled={enableReorderAlert}
        onToggle={onToggleReorderAlert}
        fieldId="reorder-level"
        fieldLabel={t('inventory.notifications.reorderLevelLabel')}
        fieldPlaceholder={t('inventory.notifications.reorderLevelPlaceholder')}
        value={reorderLevel}
        onChange={onReorderLevelChange}
        error={errors.reorderLevel}
      />

      <NotificationCard
        ariaLabelledBy="min-stock-alert-heading"
        title={t('inventory.notifications.minStockTitle')}
        subtitle={t('inventory.notifications.minStockSubtitle')}
        description={t('inventory.notifications.minStockDescription')}
        toggleLabel={t('inventory.notifications.enableMinStock')}
        enabled={enableMinStockAlert}
        onToggle={onToggleMinStockAlert}
        fieldId="min-stock-level"
        fieldLabel={t('inventory.notifications.minStockLevelLabel')}
        fieldPlaceholder={t('inventory.notifications.minStockLevelPlaceholder')}
        value={minStockLevel}
        onChange={onMinStockLevelChange}
        error={errors.minStockLevel}
      />
    </div>
  );
};
