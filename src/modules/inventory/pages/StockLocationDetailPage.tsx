import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import InventoryPageShell from '../components/InventoryPageShell';
import { storageLocationApi } from '@/core/api';
import type { StockLocation } from '@/types';

const StockLocationDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams({ strict: false }) as { id: string };

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
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#395362' }}>Loading…</span>
        </div>
      </InventoryPageShell>
    );
  }

  if (error) {
    return (
      <InventoryPageShell>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 48 }}>
          <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#B91C1C' }}>{error}</span>
          <button
            onClick={() => navigate({ to: '/inventory/stock-locations' })}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', background: '#FDFDFD',
              border: '1px solid #B2BCC2', borderRadius: 8, cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} color="#061C2A" />
            <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 14, color: '#061C2A' }}>
              Back to locations
            </span>
          </button>
        </div>
      </InventoryPageShell>
    );
  }

  return (
    <InventoryPageShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Back button */}
        <button
          onClick={() => navigate({ to: '/inventory/stock-locations' })}
          style={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: '#FDFDFD',
            border: '1px solid #B2BCC2',
            borderRadius: 8,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <ArrowLeft size={16} color="#061C2A" />
          <span style={{
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: 1.5,
            color: '#061C2A',
            whiteSpace: 'nowrap',
          }}>
            Back to locations
          </span>
        </button>

        {/* Location Details card */}
        <div style={{
          background: '#FDFDFD',
          borderRadius: 6,
          padding: '14px 24px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <p style={{
              margin: 0,
              fontFamily: 'Inter',
              fontWeight: 600,
              fontSize: 18,
              lineHeight: '28px',
              color: '#041620',
            }}>
              Location Details
            </p>

            {/* Fields row — two equal columns */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              {/* Name */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{
                  margin: 0,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '20px',
                  color: '#08283B',
                }}>
                  Name
                </p>
                <p style={{
                  margin: 0,
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: 16,
                  lineHeight: 1.5,
                  color: '#041620',
                }}>
                  {locationName}
                </p>
              </div>

              {/* Description */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{
                  margin: 0,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '20px',
                  color: '#08283B',
                }}>
                  Description
                </p>
                <p style={{
                  margin: 0,
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: 16,
                  lineHeight: 1.5,
                  color: '#041620',
                }}>
                  {locationDescription}
                </p>
              </div>
            </div>

          </div>
        </div>


      </div>
    </InventoryPageShell>
  );
};

export default StockLocationDetailPage;
