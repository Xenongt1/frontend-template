import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { ArrowLeft, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiError, inventoryApi } from '@/core/api';
import { supplierApi } from '@/core/api/supplier';
import type { Supplier } from '@/core/api';
import { toast } from '@/shared/components/ui';
import PhoneInput from '../components/PhoneInput';
import MultiSelectDropdown, { type SelectOption } from '../components/MultiSelectDropdown';

const LIST_ROUTE = '/suppliers' as const;
const ITEM_PAGE_SIZE = 10;

// ── Reusable field pieces (mirrors RegisterSupplierPage) ──────────────────────

const FieldLabel: React.FC<{ label: string; required?: boolean; optional?: boolean }> = ({
  label, required, optional,
}) => (
  <span className="font-inter font-medium text-sm leading-[21px] text-text-primary">
    {label}
    {required && <span className="text-red-700 ml-px">*</span>}
    {optional && <span className="font-normal text-text-tertiary ml-1">(optional)</span>}
  </span>
);

const ErrorMsg: React.FC<{ message?: string }> = ({ message }) =>
  message ? <span className="font-inter text-xs text-red-700">{message}</span> : null;

const SectionCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-surface-card rounded-md px-6 py-5 flex flex-col gap-5">{children}</div>
);

const SectionHeader: React.FC<{ title: string; subtitle: string; count?: number }> = ({
  title, subtitle, count,
}) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <span className="font-inter font-semibold text-base leading-6 text-brand-navy-dark">{title}</span>
      {count !== undefined && count > 0 && (
        <span className="px-2.5 py-0.5 rounded-xl bg-red-100 font-inter font-medium text-[13px] text-red-700">
          {count} selected
        </span>
      )}
    </div>
    <span className="font-inter font-normal text-sm text-text-tertiary">{subtitle}</span>
    <div className="border-b border-stroke-light mt-1" />
  </div>
);

const SelectedTags: React.FC<{ items: SelectOption[]; onRemove: (id: string) => void }> = ({
  items, onRemove,
}) => {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <div
          key={item.id}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E6F4F1] rounded-full border border-[#B2D8D2]"
        >
          <span className="font-inter text-[13px] text-[#1A5C54] font-normal">{item.label}</span>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="border-none bg-transparent cursor-pointer p-0 flex items-center"
          >
            <X size={13} className="text-[#1A5C54]" />
          </button>
        </div>
      ))}
    </div>
  );
};

// ── Skeleton shown while supplier is loading ──────────────────────────────────

const FormSkeleton: React.FC = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    <div className="h-9 w-32 bg-canvas-300 rounded-lg" />
    <div className="h-12 w-64 bg-canvas-300 rounded" />
    <div className="bg-surface-card rounded-md px-6 py-5 flex flex-col gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="h-4 w-28 bg-canvas-300 rounded" />
          <div className="h-11 bg-canvas-300 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

// ── Inner form (only mounted after supplier data is available) ────────────────

interface EditFormProps {
  supplier: Supplier;
}

const EditSupplierForm: React.FC<EditFormProps> = ({ supplier }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // ── Multi-select state ────────────────────────────────────────────────────────
  const [selectedItems, setSelectedItems] = useState<SelectOption[]>(() =>
    supplier.approvedItems.map(i => ({ id: i.inventoryItemId, label: i.name })),
  );
  const [itemsError, setItemsError] = useState('');

  // ── Inventory options with pagination ────────────────────────────────────────
  const [inventoryOptions, setInventoryOptions] = useState<SelectOption[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [itemTotal, setItemTotal] = useState(0);
  const itemsStateRef = useRef({ loadedCount: 0, total: 0, page: 1, search: '', isLoading: false });
  const debouncedItemSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadItems = async (search: string, page: number, append: boolean) => {
    if (itemsStateRef.current.isLoading) return;
    itemsStateRef.current.isLoading = true;
    setIsLoadingItems(true);
    try {
      const result = await inventoryApi.getItems({
        page,
        pageSize: ITEM_PAGE_SIZE,
        search: search || undefined,
        status: 'ACTIVE',
      });
      const mapped = result.items.map(i => ({ id: i.id, label: i.displayName }));
      setInventoryOptions(prev => {
        const next = append ? [...prev, ...mapped] : mapped;
        itemsStateRef.current.loadedCount = next.length;
        return next;
      });
      setItemTotal(result.total);
      itemsStateRef.current.total = result.total;
      itemsStateRef.current.page = page;
      itemsStateRef.current.search = search;
    } catch {
      // keep existing options
    } finally {
      itemsStateRef.current.isLoading = false;
      setIsLoadingItems(false);
    }
  };

  useEffect(() => {
    loadItems('', 1, false);
    return () => {
      if (debouncedItemSearchRef.current) clearTimeout(debouncedItemSearchRef.current);
    };
  // biome-ignore lint/correctness/useExhaustiveDependencies: load on mount only
  }, []);

  const handleItemSearch = (query: string) => {
    if (debouncedItemSearchRef.current) clearTimeout(debouncedItemSearchRef.current);
    debouncedItemSearchRef.current = setTimeout(() => loadItems(query, 1, false), 300);
  };

  const handleItemLoadMore = () => {
    const { isLoading, page, total, search, loadedCount } = itemsStateRef.current;
    if (!isLoading && loadedCount < total) loadItems(search, page + 1, true);
  };

  // ── Update mutation ───────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof supplierApi.updateSupplier>[1]) =>
      supplierApi.updateSupplier(supplier.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', supplier.id] });
      toast(t('suppliers.edit.success'), 'success');
      navigate({ to: LIST_ROUTE });
    },
  });

  // ── TanStack Form ─────────────────────────────────────────────────────────────
  const form = useForm({
    defaultValues: {
      companyName: supplier.companyName ?? '',
      fullName: supplier.fullName,
      dialCode: supplier.phoneCountryCode ?? '+1',
      phone: supplier.phoneNumber,
      email: supplier.email,
      notes: supplier.notes ?? '',
    },
    onSubmit: async ({ value }) => {
      if (selectedItems.length === 0) {
        setItemsError(t('suppliers.edit.itemsRequired'));
        return;
      }
      await updateMutation.mutateAsync({
        contactPerson: value.fullName.trim(),
        companyName: value.companyName?.trim() || undefined,
        phoneCountryCode: value.dialCode,
        phoneNumber: value.phone.trim(),
        email: value.email.trim(),
        notes: value.notes?.trim() || undefined,
        approvedInventoryItemIds: selectedItems.map(i => i.id),
      });
    },
  });

  const submitError = updateMutation.error
    ? updateMutation.error instanceof ApiError
      ? updateMutation.error.errors?.join(' ') ?? updateMutation.error.message
      : (updateMutation.error as Error).message
    : '';

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}
      className="flex flex-col gap-4"
    >
      {/* ── General Information ── */}
      <SectionCard>
        <SectionHeader
          title={t('suppliers.edit.generalInfoTitle')}
          subtitle={t('suppliers.edit.generalInfoSubtitle')}
        />

        {/* Company Name */}
        <form.Field name="companyName">
          {(field) => (
            <div className="flex flex-col gap-2">
              <FieldLabel label={t('suppliers.edit.companyNameLabel')} optional />
              <input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="e.g. Forest Prime Ltd"
                className="w-full box-border bg-surface-overlay border border-stroke-medium rounded-lg px-4 py-3 font-inter text-sm text-text-primary placeholder:text-text-placeholder outline-none"
              />
            </div>
          )}
        </form.Field>

        {/* Contact Person */}
        <form.Field
          name="fullName"
          validators={{
            onBlur: ({ value }) => {
              const r = z.string().min(1, 'Contact person is required').safeParse(value);
              return r.success ? undefined : r.error.issues[0]?.message;
            },
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <FieldLabel label={t('suppliers.edit.contactPersonLabel')} required />
              <input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="e.g. Noah Reed"
                className={`w-full box-border bg-surface-overlay border rounded-lg px-4 py-3 font-inter text-sm text-text-primary placeholder:text-text-placeholder outline-none ${field.state.meta.errors[0] ? 'border-red-700' : 'border-stroke-medium'}`}
              />
              <ErrorMsg message={field.state.meta.errors[0] as string | undefined} />
            </div>
          )}
        </form.Field>

        {/* Phone + Email row */}
        <div className="flex gap-4 flex-wrap">
          <form.Field
            name="phone"
            validators={{
              onBlur: ({ value }) => {
                if (!value.trim()) return 'Phone number is required';
                if (value.replace(/\D/g, '').length < 7) return 'Phone must be at least 7 digits';
                return undefined;
              },
            }}
          >
            {(phoneField) => (
              <form.Field name="dialCode">
                {(dialField) => (
                  <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                    <FieldLabel label={t('suppliers.edit.phoneLabel')} required />
                    <PhoneInput
                      dialCode={dialField.state.value}
                      onDialCodeChange={(code) => dialField.handleChange(code)}
                      value={phoneField.state.value}
                      onChange={(v) => phoneField.handleChange(v)}
                      error={phoneField.state.meta.errors[0] as string | undefined}
                    />
                  </div>
                )}
              </form.Field>
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onBlur: ({ value }) => {
                const r = z.string().email('Invalid email address').safeParse(value);
                return r.success ? undefined : r.error.issues[0]?.message;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                <FieldLabel label={t('suppliers.edit.emailLabel')} />
                <input
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g. contact@company.com"
                  className={`w-full box-border bg-surface-overlay border rounded-lg px-4 py-3 font-inter text-sm text-text-primary placeholder:text-text-placeholder outline-none ${field.state.meta.errors[0] ? 'border-red-700' : 'border-stroke-medium'}`}
                />
                <ErrorMsg message={field.state.meta.errors[0] as string | undefined} />
              </div>
            )}
          </form.Field>
        </div>

        {/* Notes */}
        <form.Field name="notes">
          {(field) => (
            <div className="flex flex-col gap-2">
              <FieldLabel label={t('suppliers.edit.notesLabel')} optional />
              <textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder={t('suppliers.edit.notesPlaceholder')}
                rows={3}
                className="w-full box-border bg-surface-overlay border border-stroke-medium rounded-lg px-4 py-3 font-inter text-sm text-text-primary placeholder:text-text-placeholder outline-none resize-y"
              />
            </div>
          )}
        </form.Field>
      </SectionCard>

      {/* ── Approved Inventory Items ── */}
      <SectionCard>
        <SectionHeader
          title={t('suppliers.edit.approvedItemsTitle')}
          subtitle={t('suppliers.edit.approvedItemsSubtitle')}
          count={selectedItems.length}
        />
        <SelectedTags
          items={selectedItems}
          onRemove={(id) => setSelectedItems(prev => prev.filter(i => i.id !== id))}
        />
        <div className="flex flex-col gap-2">
          <FieldLabel label={t('suppliers.edit.approvedItemsLabel')} required />
          <MultiSelectDropdown
            options={inventoryOptions}
            selected={selectedItems}
            onToggle={(option) => {
              setItemsError('');
              setSelectedItems(prev =>
                prev.some(i => i.id === option.id)
                  ? prev.filter(i => i.id !== option.id)
                  : [...prev, option],
              );
            }}
            placeholder={t('suppliers.edit.approvedItemsPlaceholder')}
            error={itemsError}
            onSearch={handleItemSearch}
            onLoadMore={handleItemLoadMore}
            isLoading={isLoadingItems}
            hasMore={inventoryOptions.length < itemTotal}
          />
        </div>
      </SectionCard>

      {/* Submit error */}
      {submitError && (
        <p className="m-0 px-4 py-3 border border-red-200 rounded-lg bg-red-50 font-inter text-[13px] text-red-800">
          {submitError}
        </p>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => navigate({ to: LIST_ROUTE })}
          disabled={updateMutation.isPending}
          className="px-5 py-2.5 bg-transparent border border-[#2C2B29] rounded-lg font-inter font-medium text-sm text-[#2C2B29] cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className={`px-5 py-2.5 border-none rounded-lg font-inter font-medium text-sm text-surface-card transition-colors ${updateMutation.isPending ? 'bg-navy-600 cursor-not-allowed' : 'bg-brand-navy cursor-pointer'}`}
        >
          {updateMutation.isPending ? t('suppliers.edit.submitting') : t('suppliers.edit.submit')}
        </button>
      </div>
    </form>
  );
};

// ── Route component ───────────────────────────────────────────────────────────

const EditSupplierPage: React.FC = () => {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => supplierApi.getSupplierById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto bg-surface-page p-6 box-border">
        <FormSkeleton />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto bg-surface-page p-6 flex flex-col gap-4">
        <button
          type="button"
          onClick={() => navigate({ to: LIST_ROUTE })}
          className="inline-flex items-center gap-2 px-3 py-2 bg-surface-card border border-stroke-medium rounded-lg cursor-pointer self-start"
        >
          <ArrowLeft size={16} className="text-brand-navy-mid" />
          <span className="font-inter font-medium text-sm text-brand-navy-mid">{t('suppliers.edit.backButton')}</span>
        </button>
        <p className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-800 m-0">
          {error ? (error as Error).message : t('suppliers.edit.notFound')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-surface-page p-6 flex flex-col gap-4 box-border">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate({ to: LIST_ROUTE })}
        className="inline-flex items-center gap-2 px-3 py-2 bg-surface-card border border-stroke-medium rounded-lg cursor-pointer self-start"
      >
        <ArrowLeft size={16} className="text-brand-navy-mid" />
        <span className="font-inter font-medium text-sm leading-[21px] text-brand-navy-mid whitespace-nowrap">
          {t('suppliers.edit.backButton')}
        </span>
      </button>

      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="m-0 font-inter font-semibold text-lg leading-7 text-brand-navy-dark">
          {t('suppliers.edit.title')}
        </h1>
        <p className="m-0 font-inter font-normal text-sm text-text-primary">
          {t('suppliers.edit.subtitle')}
        </p>
      </div>

      <EditSupplierForm supplier={data.data} />
    </div>
  );
};

export default EditSupplierPage;
