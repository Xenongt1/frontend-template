import React, { useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { storageLocationApi } from '@/core/api';
import { SuccessToast } from '@/shared/components/ui';
import InventoryPageShell, { BackButton, InventoryPageHeader } from '../components/InventoryPageShell';
import StockLocationForm from '../components/StockLocationForm';

const LIST_ROUTE = '/inventory/stock-locations';

const RegisterStockLocationPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubmit = async (name: string, description: string) => {
    await storageLocationApi.createStorageLocation({
      name,
      description: description || undefined,
    });
    setShowSuccessToast(true);
    redirectTimer.current = setTimeout(() => navigate({ to: LIST_ROUTE }), 1200);
  };

  const handleDismissToast = () => {
    setShowSuccessToast(false);
    if (redirectTimer.current) window.clearTimeout(redirectTimer.current);
    navigate({ to: LIST_ROUTE });
  };

  return (
    <>
      {showSuccessToast && (
        <SuccessToast
          message={t('stockLocations.register.successToast')}
          onClose={handleDismissToast}
        />
      )}
      <InventoryPageShell>

        <BackButton
          label={t('stockLocations.register.backButton')}
          onClick={() => navigate({ to: LIST_ROUTE })}
        />

        <InventoryPageHeader
          title={t('stockLocations.register.title')}
          subtitle={t('stockLocations.register.subtitle')}
        />

        <StockLocationForm
          onSubmit={handleSubmit}
          onCancel={() => navigate({ to: LIST_ROUTE })}
          submitLabel={t('stockLocations.register.createButton')}
          savingLabel={t('stockLocations.register.creating')}
        />

      </InventoryPageShell>
    </>
  );
};

export default RegisterStockLocationPage;
