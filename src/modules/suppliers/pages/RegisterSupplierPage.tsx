import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { ArrowLeft, X } from 'lucide-react';
import { ApiError } from '@/core/api';
import { inventoryApi } from '@/core/api';
import { supplierApi } from '@/core/api/supplier';
import { toast } from '@/shared/components/ui';
import PhoneInput from '../components/PhoneInput';
import MultiSelectDropdown, { type SelectOption } from '../components/MultiSelectDropdown';

const LIST_ROUTE = '/suppliers' as const;
const ITEM_PAGE_SIZE = 10;

// ── Zod schema for the text fields ───────────────────────────────────────────

const supplierTextSchema = z.object({
  companyName: z.string().optional(),
  fullName: z.string().min(1, 'Contact person is required'),
  dialCode: z.string(),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine((v) => v.replace(/\D/g, '').length >= 7, 'Phone must be at least 7 digits'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  notes: z.string().optional(),
});

// ── Small reusable pieces ────────────────────────────────────────────────────

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
  <div className="bg-surface-card rounded-md px-6 py-5 flex flex-col gap-5">
    {children}
  </div>
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

// ── Page ─────────────────────────────────────────────────────────────────────

const RegisterSupplierPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // ── Multi-select state (complex custom UI, not in TanStack Form) ─────────────
  const [selectedItems, setSelectedItems] = useState<SelectOption[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<SelectOption[]>([]);
  const [itemsError, setItemsError] = useState('');
  const [unitsError, setUnitsError] = useState('');

  // ── Inventory items pagination for multi-select ──────────────────────────────
  const [inventoryOptions, setInventoryOptions] = useState<SelectOption[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [itemTotal, setItemTotal] = useState(0);
  const itemsStateRef = useRef({ loadedCount: 0, total: 0, page: 1, search: '', isLoading: false });
  const debouncedItemSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Units of measure via TanStack Query ─────────────────────────────────────
  const { data: uomData } = useQuery({
    queryKey: ['units-of-measure'],
    queryFn: () => inventoryApi.getUnitsOfMeasure(),
    staleTime: 10 * 60 * 1000,
  });
  const unitOptions: SelectOption[] = (uomData?.data ?? []).map(u => ({ id: u.id, label: u.name }));

  // ── Create supplier mutation ─────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: supplierApi.createSupplier,
    onSuccess: () => {
      toast(t('suppliers.register.successToast'), 'success');
      navigate({ to: LIST_ROUTE });
    },
  });

  // ── Load inventory items for the multi-select ─────────────────────────────
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

  // ── TanStack Form ────────────────────────────────────────────────────────────
  const form = useForm({
    defaultValues: {
      companyName: '',
      fullName: '',
      dialCode: '+1',
      phone: '',
      email: '',
      notes: '',
    },
    onSubmit: async ({ value }) => {
      // Validate multi-selects separately
      let hasMultiError = false;
      if (selectedItems.length === 0) {
        setItemsError(t('suppliers.validation.itemsRequired'));
        hasMultiError = true;
      }
      if (selectedUnits.length === 0) {
        setUnitsError(t('suppliers.validation.unitsRequired'));
        hasMultiError = true;
      }
      if (hasMultiError) return;

      await createMutation.mutateAsync({
        contactPerson: value.fullName.trim(),
        companyName: value.companyName?.trim() || undefined,
        phoneCountryCode: value.dialCode,
        phoneNumber: value.phone.trim(),
        email: value.email.trim(),
        notes: value.notes?.trim() || undefined,
        approvedInventoryItemIds: selectedItems.map(i => i.id),
        deliveryUnitIds: selectedUnits.map(u => u.id),
      });
    },
  });

  const toggleItem = (option: SelectOption) => {
    setItemsError('');
    setSelectedItems(prev =>
      prev.some(i => i.id === option.id) ? prev.filter(i => i.id !== option.id) : [...prev, option],
    );
  };

  const toggleUnit = (option: SelectOption) => {
    setUnitsError('');
    setSelectedUnits(prev =>
      prev.some(u => u.id === option.id) ? prev.filter(u => u.id !== option.id) : [...prev, option],
    );
  };

  const submitError = createMutation.error
    ? createMutation.error instanceof ApiError
      ? createMutation.error.errors?.join(' ') ?? createMutation.error.message
      : (createMutation.error as Error).message
    : '';

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
          {t('suppliers.register.backButton')}
        </span>
      </button>

      {/* Page header */}
      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-inter font-semibold text-lg leading-7 text-brand-navy-dark">
          {t('suppliers.register.title')}
        </h1>
        <p className="m-0 font-inter font-normal text-sm text-text-primary">
          {t('suppliers.register.subtitle')}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        {/* ── General Information ── */}
        <SectionCard>
          <SectionHeader
            title={t('suppliers.register.generalInfoTitle')}
            subtitle={t('suppliers.register.generalInfoSubtitle')}
          />

          {/* Company Name */}
          <form.Field name="companyName">
            {(field) => (
              <div className="flex flex-col gap-2">
                <FieldLabel label={t('suppliers.register.companyNameLabel')} optional />
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t('suppliers.register.companyNamePlaceholder')}
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
                const result = z.string().min(1, 'Contact person is required').safeParse(value);
                return result.success ? undefined : result.error.issues[0]?.message;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-2">
                <FieldLabel label={t('suppliers.register.fullNameLabel')} required />
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t('suppliers.register.fullNamePlaceholder')}
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
                      <FieldLabel label={t('suppliers.register.phoneLabel')} required />
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
                  const result = supplierTextSchema.shape.email.safeParse(value);
                  return result.success ? undefined : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                  <FieldLabel label={t('suppliers.register.emailLabel')} required />
                  <input
                    type="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder={t('suppliers.register.emailPlaceholder')}
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
                <FieldLabel label={t('suppliers.register.notesLabel')} optional />
                <textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t('suppliers.register.notesPlaceholder')}
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
            title={t('suppliers.register.approvedItemsTitle')}
            subtitle={t('suppliers.register.approvedItemsSubtitle')}
            count={selectedItems.length}
          />
          <SelectedTags items={selectedItems} onRemove={id => setSelectedItems(prev => prev.filter(i => i.id !== id))} />
          <div className="flex flex-col gap-2">
            <FieldLabel label={t('suppliers.register.approvedItemsLabel')} required />
            <MultiSelectDropdown
              options={inventoryOptions}
              selected={selectedItems}
              onToggle={toggleItem}
              placeholder={t('suppliers.register.approvedItemsPlaceholder')}
              error={itemsError}
              onSearch={handleItemSearch}
              onLoadMore={handleItemLoadMore}
              isLoading={isLoadingItems}
              hasMore={inventoryOptions.length < itemTotal}
            />
          </div>
        </SectionCard>

        {/* ── Delivery Units ── */}
        <SectionCard>
          <SectionHeader
            title={t('suppliers.register.deliveryUnitsTitle')}
            subtitle={t('suppliers.register.deliveryUnitsSubtitle')}
            count={selectedUnits.length}
          />
          <SelectedTags items={selectedUnits} onRemove={id => setSelectedUnits(prev => prev.filter(u => u.id !== id))} />
          <div className="flex flex-col gap-2">
            <FieldLabel label={t('suppliers.register.deliveryUnitsLabel')} required />
            <MultiSelectDropdown
              options={unitOptions}
              selected={selectedUnits}
              onToggle={toggleUnit}
              placeholder={t('suppliers.register.deliveryUnitsPlaceholder')}
              error={unitsError}
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
            disabled={createMutation.isPending}
            className="px-5 py-2.5 bg-transparent border border-[#2C2B29] rounded-lg font-inter font-medium text-sm text-[#2C2B29] cursor-pointer disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className={`px-5 py-2.5 border-none rounded-lg font-inter font-medium text-sm text-surface-card transition-colors ${createMutation.isPending ? 'bg-navy-600 cursor-not-allowed' : 'bg-brand-navy cursor-pointer'}`}
          >
            {createMutation.isPending
              ? t('suppliers.register.submitting')
              : t('suppliers.register.submitButton')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterSupplierPage;
