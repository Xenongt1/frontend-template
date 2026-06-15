import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { InventoryItem } from '../types';
import StatusBadge from './StatusBadge';
import { Skeleton } from '@/shared/components/ui/Skeleton/Skeleton';

const SKELETON_ROW_COUNT = 6;

interface Props {
  item: InventoryItem | null;
  loading?: boolean;
  error?: string | null;
  statusUpdating?: boolean;
  onClose: () => void;
  onStatusToggle: (item: InventoryItem) => void;
}

const pill = 'inline-flex items-center px-3 py-[3px] rounded-full text-[13px] font-medium whitespace-nowrap';

function formatCategoryLabel(category: string | null | undefined): string {
  if (!category) return '—';
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(iso: string | undefined, locale: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

const ItemDetailModal: React.FC<Props> = ({
  item,
  loading = false,
  error = null,
  statusUpdating = false,
  onClose,
  onStatusToggle,
}) => {
  const { t, i18n } = useTranslation();
  const skeletonKeys = useMemo(
    () => Array.from({ length: SKELETON_ROW_COUNT }, () => crypto.randomUUID()),
    []
  );

  if (!item && !loading && !error) return null;

  const fields: Array<{ label: string; value: string; mono?: boolean }> = item
    ? [
        { label: t('inventory.detail.field.category'), value: formatCategoryLabel(item.category) },
        { label: t('inventory.detail.field.unitOfMeasure'), value: item.uomLabel || '—' },
        { label: t('inventory.detail.field.stockUnit'), value: item.stockUnit != null ? String(item.stockUnit) : '—' },
        { label: t('inventory.detail.field.sku'), value: item.sku || '—', mono: true },
        ...(item.createdAt ? [{ label: t('inventory.detail.field.created'), value: formatDate(item.createdAt, i18n.language) }] : []),
        { label: t('inventory.detail.field.notifyExpiryEnabled'), value: String(item.notifyExpiryEnabled ?? false) },
        {
          label: t('inventory.detail.field.expiryNotifications'),
          value: (() => {
            const days = item.daysBeforeExpiryNotification ?? item.expiryNotificationDays;
            return days != null ? t('common.days', { count: days }) : '—';
          })(),
        },
        { label: t('inventory.detail.field.reorderOnMinStockEnabled'), value: String(item.reorderOnMinStockEnabled ?? false) },
        {
          label: t('inventory.detail.field.reorderLevel'),
          value: (() => {
            const level = item.minStockReorderLevel ?? item.reorderThreshold;
            return level != null ? String(level) : '—';
          })(),
        },
        { label: t('inventory.detail.field.notifyOnMinStockEnabled'), value: String(item.notifyOnMinStockEnabled ?? false) },
        { label: t('inventory.detail.field.minStockLevel'), value: item.minStockNotificationLevel != null ? String(item.minStockNotificationLevel) : '—' },
      ]
    : [];

  return (
    <>
      <button
        type="button"
        aria-label={t('inventory.detail.closeAriaLabel')}
        onClick={onClose}
        className="fixed inset-0 z-[200] bg-navy-900/25 backdrop-blur-[1px] border-none cursor-pointer"
      />

      <div className="fixed top-0 right-0 bottom-0 z-[201] w-[420px] max-w-full bg-canvas-50 shadow-[-8px_0_32px_rgba(8,40,59,0.12)] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-[18px] border-b border-canvas-300 flex-shrink-0">
          <span className="text-lg font-semibold text-navy-900">{t('inventory.detail.title')}</span>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="inline-flex items-center justify-center w-8 h-8 border-none rounded-md bg-transparent cursor-pointer transition-colors hover:bg-canvas-300"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 2l14 14M16 2L2 16" stroke="#08283B" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {(() => {
          if (error) {
            return (
              <div className="flex-1 flex flex-col items-center justify-center px-5 gap-3">
                <p className="text-sm text-red-800 text-center m-0">{error}</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-canvas-300 rounded-lg bg-transparent text-sm text-navy-900 cursor-pointer hover:bg-canvas-100"
                >
                  {t('common.close')}
                </button>
              </div>
            );
          }

          if (loading || !item) {
            return (
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4" aria-busy="true">
                <Skeleton variant="text" className="w-3/4 h-7" />
                <div className="flex gap-2">
                  <Skeleton variant="pill" className="w-20 h-7" />
                  <Skeleton variant="pill" className="w-16 h-7" />
                </div>
                {skeletonKeys.map((key) => (
                  <div key={key} className="flex justify-between gap-3 py-2 border-b border-canvas-300">
                    <Skeleton variant="text" className="w-24" />
                    <Skeleton variant="text" className="w-32" />
                  </div>
                ))}
              </div>
            );
          }

          let buttonLabel: string;
          if (statusUpdating) {
            buttonLabel = t('inventory.detail.action.updating');
          } else if (item.status === 'INTAKE_SUSPENDED') {
            buttonLabel = t('inventory.detail.action.activateItem');
          } else {
            buttonLabel = t('inventory.detail.action.suspendIntake');
          }

          return (
            <>
              {/* Item name + badges */}
              <div className="px-5 py-4 border-b border-canvas-300 flex-shrink-0">
                <h2 className="m-0 mb-2.5 text-xl font-bold text-navy-900 leading-7">{item.displayName}</h2>
                <div className="flex gap-2 flex-wrap">
                  <span className={`${pill} bg-[#EDE9FE] border border-[#C4B5FD] text-[#5B21B6]`}>
                    {formatCategoryLabel(item.category)}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto">

                {/* Key-value rows */}
                {fields.map(({ label, value, mono }) => (
                  <div key={label} className="flex justify-between items-center px-5 py-3 border-b border-canvas-300 gap-3">
                    <span className="text-[13px] text-gray-500 flex-shrink-0">{label}</span>
                    <span className={`text-sm font-medium text-navy-900 text-right ${mono ? 'font-mono' : ''}`}>
                      {value}
                    </span>
                  </div>
                ))}

                {/* Inventory Item Properties */}
                {(item.properties ?? []).length > 0 && (
                  <div className="border-b border-canvas-300">
                    <div className="px-5 pt-[14px] pb-2 text-[13px] font-semibold text-navy-600">
                      {t('inventory.detail.section.attributes')}
                    </div>
                    <div className="px-5 pb-[14px] flex gap-2 flex-wrap">
                      {(item.properties ?? []).map((prop) => (
                        <span
                          key={prop.id}
                          className={`${pill} bg-[#DEF7EC] border border-[#84E1BC] text-[#03543F]`}
                        >
                          {prop.label}: {String(prop.value)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {(item.tags ?? []).length > 0 && (
                  <div className="border-b border-canvas-300">
                    <div className="px-5 pt-[14px] pb-2 text-[13px] font-semibold text-navy-600">
                      {t('inventory.detail.section.tags')}
                    </div>
                    <div className="px-5 pb-[14px] flex gap-2 flex-wrap">
                      {(item.tags ?? []).map((tag) => (
                        <span key={tag} className={`${pill} bg-[#FDF2F2] border border-[#FDE8E8] text-[#9B1C1C]`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Level Properties */}
                {(item.stockIntakeProperties ?? []).length > 0 && (
                  <div className="border-b border-canvas-300">
                    <div className="px-5 pt-[14px] pb-2 text-[13px] font-semibold text-navy-600">
                      {t('inventory.detail.section.batchFields')}
                    </div>
                    <div className="px-5 pb-[14px] flex flex-col gap-2">
                      {(item.stockIntakeProperties ?? []).map((field) => (
                        <div key={field.id} className="flex justify-between items-center">
                          <span className="text-sm text-navy-900">{field.label}</span>
                          {field.required && (
                            <span className={`${pill} bg-[#FDF2F2] border border-[#FDE8E8] text-[#9B1C1C]`}>
                              {t('common.required')}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {item.description && (
                  <div className="border-b border-canvas-300">
                    <div className="px-5 pt-[14px] pb-2 text-[13px] font-semibold text-navy-600">
                      {t('inventory.detail.section.description')}
                    </div>
                    <p className="m-0 px-5 pb-4 text-[13px] text-gray-500 leading-5">{item.description}</p>
                  </div>
                )}
              </div>

              {/* Footer action */}
              <div className="px-5 py-4 border-t border-canvas-300 flex-shrink-0 bg-canvas-50">
                {item.status !== 'INACTIVE' && (
                  <button
                    onClick={() => onStatusToggle(item)}
                    disabled={statusUpdating}
                    className={`w-full py-3 border-none rounded-lg text-sm font-semibold cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                      item.status === 'INTAKE_SUSPENDED'
                        ? 'bg-navy-900 text-canvas-50 hover:bg-navy-800'
                        : 'bg-[#C81E1E] text-canvas-50 hover:bg-[#a11919]'
                    }`}
                  >
                    {buttonLabel}
                  </button>
                )}
              </div>
            </>
          );
        })()}
      </div>
    </>
  );
};

export default ItemDetailModal;
