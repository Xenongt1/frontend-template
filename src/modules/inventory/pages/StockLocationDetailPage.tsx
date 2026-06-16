import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import InventoryPageShell from '../components/InventoryPageShell';
import { storageLocationApi } from '@/core/api';
import type { StockLocation } from '@/types';

interface BackButtonProps {
  onClick: () => void;
}

// The back-button is a one-off (white bg + thin border + text + leading icon)
// that doesn't fit primary/secondary/tertiary in the Figma button spec, so it
// stays as a local Tailwind-styled button rather than using <Button>.
const BackButton: React.FC<BackButtonProps> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="self-start inline-flex items-center gap-2 px-3 py-2 bg-canvas-50 border border-stroke-medium rounded-lg cursor-pointer text-left transition-colors duration-150 hover:bg-canvas-200"
  >
    <ArrowLeft size={16} color="#061C2A" />
    <span className="font-inter text-sm font-medium leading-[1.5] text-brand-navy-mid whitespace-nowrap">
      Back to locations
    </span>
  </button>
);

const DetailField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex-1 flex flex-col gap-2">
    <p className="m-0 font-inter text-sm font-normal leading-5 text-text-primary">
      {label}
    </p>
    <p className="m-0 font-inter text-base font-medium leading-[1.5] text-brand-navy-dark">
      {value}
    </p>
  </div>
);

const StockLocationDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams({ strict: false }) as { id?: string };

  const [location, setLocation] = useState<StockLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    storageLocationApi.getStorageLocationById(id)
      .then(setLocation)
      .catch(err => setError(err?.message ?? 'Failed to load location'))
      .finally(() => setLoading(false));
  }, [id]);

  const locationName = location?.name ?? '—';
  const locationDescription = location?.description ?? '—';

  if (loading) {
    return (
      <InventoryPageShell>
        <div className="flex justify-center p-12">
          <span className="font-inter text-sm text-text-secondary">Loading…</span>
        </div>
      </InventoryPageShell>
    );
  }

  if (error) {
    return (
      <InventoryPageShell>
        <div className="flex flex-col items-center gap-4 p-12">
          <span className="font-inter text-sm text-[#B91C1C]">{error}</span>
          <BackButton onClick={() => navigate({ to: '/inventory/stock-locations' })} />
        </div>
      </InventoryPageShell>
    );
  }

  return (
    <InventoryPageShell>
      <div className="flex flex-col gap-4">
        <BackButton onClick={() => navigate({ to: '/inventory/stock-locations' })} />

        {/* Location Details card */}
        <div className="bg-canvas-50 rounded-md px-6 py-3.5">
          <div className="flex flex-col gap-4">
            <p className="m-0 font-inter text-lg font-semibold leading-7 text-brand-navy-dark">
              Location Details
            </p>

            <div className="flex items-start justify-between">
              <DetailField label="Name" value={locationName} />
              <DetailField label="Description" value={locationDescription} />
            </div>
          </div>
        </div>
      </div>
    </InventoryPageShell>
  );
};

export default StockLocationDetailPage;
