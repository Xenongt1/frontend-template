import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useInventory } from '../hooks/useInventory';
import type { InventoryItem } from '../types';
import { inventoryApi } from '../api/inventoryApi';
import InventoryTable from '../components/InventoryTable';
import Pagination from '../components/Pagination';
import ToolBar from '../components/ToolBar';
import ItemDetailModal from '../components/ItemDetailModal';
import { ConfirmDialog, Toast, type ToastVariant } from '@/shared/components/ui';
import PageHeader from '@/shared/components/PageHeader';

const CataloguePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedRow, setSelectedRow] = useState<InventoryItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [confirmingItem, setConfirmingItem] = useState<InventoryItem | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);

  const {
    items, loading, error, filters, pagination, totalPages, pageSizeOptions,
    updateSearch, applyFilters, goToPage, changePageSize, reload,
  } = useInventory();

  useEffect(() => {
    if (!selectedItemId) return;

    const controller = new AbortController();

    const loadItem = async () => {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const item = await inventoryApi.getItem(selectedItemId, controller.signal);
        // Backend's detail endpoint omits createdAt; fall back to the list row.
        setSelectedItem((prev) => ({
          ...item,
          createdAt: item.createdAt ?? selectedRow?.createdAt ?? prev?.createdAt,
        }));
      } catch (err) {
        const e = err as Error;
        if (e.name === 'AbortError') return;
        setDetailError(e.message || 'Failed to load item details');
        setSelectedItem(null);
      } finally {
        if (!controller.signal.aborted) setDetailLoading(false);
      }
    };

    loadItem();
    return () => controller.abort();
  }, [selectedItemId, selectedRow?.createdAt]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleView = (item: InventoryItem) => {
    setSelectedItemId(item.id);
    setSelectedRow(item);
    setSelectedItem(null);
    setDetailLoading(true);
    setDetailError(null);
  };

  const handleCloseDetail = () => {
    setSelectedItemId(null);
    setSelectedRow(null);
    setSelectedItem(null);
    setDetailError(null);
    setDetailLoading(false);
  };

  const openConfirm = (item: InventoryItem) => {
    setConfirmingItem(item);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmingItem(null);
  };

  const handleConfirmToggle = async () => {
    if (!confirmingItem) return;
    const isSuspended = confirmingItem.status === 'INTAKE_SUSPENDED';

    setConfirmLoading(true);
    try {
      const updated = isSuspended
        ? await inventoryApi.activateItem(confirmingItem.id)
        : await inventoryApi.suspendItem(confirmingItem.id);

      if (selectedItem?.id === updated.id) {
        setSelectedItem(updated);
      }
      reload();
      setToast({
        message: isSuspended
          ? t('inventory.catalogue.toast.reactivated', { name: updated.displayName })
          : t('inventory.catalogue.toast.suspended', { name: updated.displayName }),
        variant: 'success',
      });
      setConfirmingItem(null);
    } catch (err) {
      const e = err as Error;
      setToast({
        message: e.message || t('inventory.catalogue.toast.updateFailed'),
        variant: 'error',
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  const isConfirmingSuspended = confirmingItem?.status === 'INTAKE_SUSPENDED';

  return (
    <>
      <ItemDetailModal
        item={selectedItem}
        loading={detailLoading}
        error={detailError}
        statusUpdating={confirmLoading && confirmingItem?.id === selectedItem?.id}
        onClose={handleCloseDetail}
        onStatusToggle={openConfirm}
      />

      <ConfirmDialog
        open={!!confirmingItem}
        title={isConfirmingSuspended ? t('inventory.catalogue.confirm.activateTitle') : t('inventory.catalogue.confirm.suspendTitle')}
        description={
          isConfirmingSuspended
            ? t('inventory.catalogue.confirm.activateDescription')
            : t('inventory.catalogue.confirm.suspendDescription')
        }
        confirmLabel={isConfirmingSuspended ? t('inventory.catalogue.confirm.activate') : t('inventory.catalogue.confirm.suspend')}
        cancelLabel={t('inventory.catalogue.confirm.cancel')}
        danger={!isConfirmingSuspended}
        loading={confirmLoading}
        onConfirm={handleConfirmToggle}
        onCancel={closeConfirm}
      />

      <Toast
        open={!!toast}
        message={toast?.message ?? ''}
        variant={toast?.variant}
        onDismiss={() => setToast(null)}
      />

      <div className="flex flex-col gap-5 w-full min-h-0">
       <PageHeader
          title={t('inventory.catalogue.title')}
          description={t('inventory.catalogue.description')}
        />
        <div className="bg-canvas-50 rounded-xl border border-canvas-300 overflow-hidden flex flex-col flex-1">
          <ToolBar
            filters={filters}
            onSearch={updateSearch}
            onFiltersApply={applyFilters}
          />

          <div className="h-px bg-canvas-300" />

          {error && (
            <div className="px-5 py-2.5 bg-red-50 border-b border-red-100 text-red-800 text-[13px]">
              {error}
            </div>
          )}

          <div className="flex-1 overflow-x-auto">
            <InventoryTable
              items={items}
              loading={loading}
              skeletonRowCount={pagination.pageSize}
              onView={handleView}
              onEdit={(item) => navigate({ to: `/inventory/edit/${item.id}` })}
             onToggleSuspension={openConfirm}
            />
          </div>

          <Pagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            totalPages={totalPages}
            pageSizeOptions={pageSizeOptions}
            onPageChange={goToPage}
            onPageSizeChange={changePageSize}
            disabled={loading}
          />
        </div>

        <style>{`
          @media (max-width: 640px) {
            .hide-on-mobile { display: none !important; }
          }
        `}</style>
      </div>
    </>
  );
};

export default CataloguePage;
