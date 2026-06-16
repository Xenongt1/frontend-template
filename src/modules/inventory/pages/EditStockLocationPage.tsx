import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { storageLocationApi } from '@/core/api';
import { SuccessToast } from '@/shared/components/ui';
import InventoryPageShell, { BackButton, InventoryPageHeader } from '../components/InventoryPageShell';
import StockLocationForm from '../components/StockLocationForm';
import type { StockLocation } from '@/types';

const LIST_ROUTE = '/inventory/stock-locations';

const EditStockLocationPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams({ strict: false }) as { id?: string };

  const [location, setLocation] = useState<StockLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    storageLocationApi.getStorageLocationById(id)
      .then(setLocation)
      .catch(err => setLoadError(err?.message ?? t('stockLocations.edit.loadError', 'Failed to load location')))
      .finally(() => setLoading(false));
    return () => { if (redirectTimer.current) window.clearTimeout(redirectTimer.current); };
  }, [id, t]);

  const handleSubmit = async (name: string, description: string) => {
    await storageLocationApi.updateStorageLocation(id!, {
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

  if (loading) {
    return (
      <InventoryPageShell>
        <div className="flex justify-center p-12">
          <span className="font-inter text-sm text-text-secondary">Loading…</span>
        </div>
      </InventoryPageShell>
    );
  }

  if (loadError || !location) {
    return (
      <InventoryPageShell>
        <div className="flex flex-col items-start gap-4 p-12">
          <span className="font-inter text-sm text-[#B91C1C]">
            {loadError ?? t('stockLocations.edit.loadError', 'Failed to load location')}
          </span>
          <BackButton
            label={t('stockLocations.register.backButton')}
            onClick={() => navigate({ to: LIST_ROUTE })}
          />
        </div>
      </InventoryPageShell>
    );
  }

  return (
    <>
      {showSuccessToast && (
        <SuccessToast
          message={t('stockLocations.edit.successToast')}
          onClose={handleDismissToast}
        />
      )}
      <InventoryPageShell>

        <BackButton
          label={t('stockLocations.register.backButton')}
          onClick={() => navigate({ to: LIST_ROUTE })}
        />

        <div className="border-b border-stroke-light pb-2.5">
          <InventoryPageHeader
            title={t('stockLocations.edit.title')}
            subtitle={t('stockLocations.edit.subtitle')}
          />
        </div>

        <StockLocationForm
          initialName={location.name}
          initialDescription={location.description ?? ''}
          onSubmit={handleSubmit}
          onCancel={() => navigate({ to: LIST_ROUTE })}
          submitLabel={t('stockLocations.edit.updateButton')}
          savingLabel={t('stockLocations.edit.updating')}
        />

      </InventoryPageShell>
    </>
  );
};

export default EditStockLocationPage;
