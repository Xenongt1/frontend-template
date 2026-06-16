import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { ApiError } from '@/core/api';
import type { ApiResponse, UnitOfMeasure } from '@/types';
import { SuccessToast, Skeleton } from '@/shared/components/ui';
import {
  RegistrationStepper,
  BasicInfoStep,
  PropertiesStep,
  NotificationsStep,
  ReviewStep,
} from '../components/registration';
import { useInventoryForm, FORM_STEPS } from '../hooks/useInventoryForm';
import { inventoryApi } from '../api/inventoryApi';
import PageHeader from '@/shared/components/PageHeader';

const EditInventoryPage: React.FC = () => {
  const { id } = useParams({ strict: false }) as { id?: string };
  const navigate = useNavigate();
  const { t } = useTranslation();
  const submitRedirectTimer = useRef<number | undefined>(undefined);
  const form = useInventoryForm();

  const [isLoadingItem, setIsLoadingItem] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (submitRedirectTimer.current) window.clearTimeout(submitRedirectTimer.current);
    };
  }, []);

  /* Load item + lookups in parallel */
  useEffect(() => {
    if (!id) {
      setLoadError(t('inventory.edit.missingId'));
      setIsLoadingItem(false);
      return;
    }

    let isMounted = true;

    async function load() {
      setIsLoadingItem(true);
      setLoadError(null);
      try {
        const [cats, unitsResponse, item]: [
          { value: string; label: string }[],
          ApiResponse<UnitOfMeasure[]>,
          import('@/types').InventoryItem,
        ] = await Promise.all([
          inventoryApi.getCategories(),
          inventoryApi.getUnitsOfMeasure(),
          inventoryApi.getItem(id as string),
        ]);

        if (!isMounted) return;
        const uoms = unitsResponse.data.map((u) => ({ label: u.name, value: u.id }));
        form.setCategoryOptions(cats);
        form.setUomOptions(uoms);
        form.populateForm(item, cats, uoms);
      } catch (err) {
        if (!isMounted) return;
        setLoadError((err as Error).message || t('inventory.edit.loadFailure'));
      } finally {
        if (isMounted) setIsLoadingItem(false);
      }
    }

    load();
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async () => {
    if (!id) return;
    form.setSubmitError('');
    form.setIsSubmitting(true);
    try {
      await inventoryApi.updateItem(id, form.buildPayload());
      form.setShowSuccessToast(true);
      if (submitRedirectTimer.current) window.clearTimeout(submitRedirectTimer.current);
      submitRedirectTimer.current = window.setTimeout(() => navigate({ to: '/inventory/catalogue' }), 1200);
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        const messages = Object.entries(error.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('\n');
        form.setSubmitError(messages);
      } else {
        form.setSubmitError(error instanceof Error ? error.message : t('inventory.edit.genericFailure'));
      }
    } finally {
      form.setIsSubmitting(false);
    }
  };

  const handleDismissToast = () => {
    form.setShowSuccessToast(false);
    if (submitRedirectTimer.current) window.clearTimeout(submitRedirectTimer.current);
  };

  /* ── Early states ── */
  if (loadError) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '24px 0' }}>
        <button type="button" onClick={() => navigate({ to: '/inventory/catalogue' })} className="btn-ghost" style={{ width: 'fit-content' }}>
          <ArrowLeft size={16} aria-hidden="true" />
          {t('inventory.register.back')}
        </button>
        <div role="alert" style={{ padding: 12, border: '1px solid #FDE8E8', borderRadius: 8, background: '#FDF2F2', color: '#9B1C1C', fontSize: 14, fontFamily: "'Inter', system-ui, sans-serif" }}>
          {loadError}
        </div>
      </div>
    );
  }

  if (isLoadingItem) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.8vh, 20px)', overflowY: 'auto', minHeight: 0, paddingRight: 2 }}>
        <button type="button" onClick={() => navigate({ to: '/inventory/catalogue' })} className="btn-ghost" style={{ width: 'fit-content' }}>
          <ArrowLeft size={16} aria-hidden="true" />
          {t('inventory.register.back')}
        </button>
        <RegistrationStepper
          steps={[
            t('inventory.stepper.basicInformation'),
            t('inventory.stepper.properties'),
            t('inventory.stepper.notifications'),
            t('inventory.stepper.review'),
          ]}
          activeStep={0}
        />

        <div style={{ background: '#FDFDFD', border: '1px solid #E6EAEB', borderRadius: 10, padding: 'clamp(12px, 2vh, 24px)', display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.5vh, 16px)' }}>
          <div style={{ borderBottom: '1px solid #E6EAEB', paddingBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton variant="text" className="w-48 h-5" />
            <Skeleton variant="text" className="w-80 h-4" />
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton variant="text" className="w-14 h-3.5" />
              <Skeleton variant="block" className="w-full h-10" />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton variant="text" className="w-10 h-3.5" />
              <Skeleton variant="block" className="w-full h-10" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton variant="text" className="w-20 h-3.5" />
              <Skeleton variant="block" className="w-full h-10" />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton variant="text" className="w-32 h-3.5" />
              <Skeleton variant="block" className="w-full h-10" />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Skeleton variant="text" className="w-24 h-3.5" />
            <Skeleton variant="block" className="w-full h-20" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Step content ── */
  const renderStep = () => {
    switch (form.activeStep) {
      case 0:
        return (
          <BasicInfoStep
            values={form.basicInfo}
            categoryOptions={form.categoryOptions}
            uomOptions={form.uomOptions}
            onChange={form.handleBasicInfoChange}
            errors={form.stepErrors}
          />
        );
      case 1:
        return (
          <PropertiesStep
            attributes={form.attributes}
            attrName={form.attrName}
            attrType={form.attrType}
            attrValue={form.attrValue}
            isAttributeFormOpen={form.isAttributeFormOpen}
            onOpenAttributeForm={() => form.setIsAttributeFormOpen(true)}
            onAttrNameChange={form.setAttrName}
            onAttrTypeChange={form.handleAttrTypeChange}
            onAttrValueChange={form.setAttrValue}
            onAddAttribute={form.handleAddAttribute}
            onRemoveAttribute={form.handleRemoveAttribute}
            intakeFields={form.intakeFields}
            intakeFieldDraft={form.intakeFieldDraft}
            isIntakeFieldFormOpen={form.isIntakeFieldFormOpen}
            onOpenIntakeFieldForm={() => form.setIsIntakeFieldFormOpen(true)}
            onIntakeFieldDraftLabelChange={form.handleIntakeFieldDraftLabelChange}
            onIntakeFieldDraftTypeChange={form.handleIntakeFieldDraftTypeChange}
            onIntakeFieldDraftRequiredToggle={form.handleIntakeFieldDraftRequiredToggle}
            onAddIntakeFieldFromDraft={form.handleAddIntakeFieldFromDraft}
            onRemoveIntakeField={form.handleRemoveIntakeField}
            errors={form.stepErrors}
            tags={form.tags}
            tagDraft={form.tagDraft}
            isTagFormOpen={form.isTagFormOpen}
            onOpenTagForm={() => form.setIsTagFormOpen(true)}
            onTagDraftChange={form.setTagDraft}
            onAddTag={form.handleAddTag}
            onRemoveTag={form.handleRemoveTag}
          />
        );
      case 2:
        return (
          <NotificationsStep
            enableExpiryAlert={form.enableExpiryAlert}
            expiryDays={form.expiryDays}
            onToggleExpiryAlert={form.handleToggleExpiryAlert}
            onExpiryDaysChange={form.setExpiryDays}
            enableReorderAlert={form.enableReorderAlert}
            reorderLevel={form.reorderLevel}
            onToggleReorderAlert={form.handleToggleReorderAlert}
            onReorderLevelChange={form.setReorderLevel}
            enableMinStockAlert={form.enableMinStockAlert}
            minStockLevel={form.minStockLevel}
            onToggleMinStockAlert={form.handleToggleMinStockAlert}
            onMinStockLevelChange={form.setMinStockLevel}
            errors={form.stepErrors}
          />
        );
      case 3:
        return (
          <ReviewStep
            basicInfo={form.basicInfo}
            categoryOptions={form.categoryOptions}
            uomOptions={form.uomOptions}
            attributes={form.attributes}
            intakeFields={form.intakeFields}
            tags={form.tags}
            enableExpiryAlert={form.enableExpiryAlert}
            expiryDays={form.expiryDays}
            enableReorderAlert={form.enableReorderAlert}
            reorderLevel={form.reorderLevel}
            enableMinStockAlert={form.enableMinStockAlert}
            minStockLevel={form.minStockLevel}
          />
        );
      default:
        return null;
    }
  };

  /* ── Footer ── */
  const renderFooter = () => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, flexShrink: 0, paddingBottom: 4 }}>
      {form.activeStep === 0 ? (
        <button type="button" onClick={() => navigate({ to: '/inventory/catalogue' })} className="btn-outline" style={{ minWidth: 87 }}>
          {t('common.cancel')}
        </button>
      ) : (
        <button type="button" onClick={form.goPrev} className="btn-outline" style={{ minWidth: 100 }}>
          {t('common.previous')}
        </button>
      )}

      {form.activeStep < FORM_STEPS.length - 1 ? (
        <button type="button" onClick={() => { form.goNext(); }} className="btn-primary" style={{ minWidth: 111 }}>
          {t('common.next')}
        </button>
      ) : (
        <button type="button" onClick={handleSubmit} className="btn-primary" disabled={form.isSubmitting} style={{ minWidth: 140 }}>
          {form.isSubmitting ? t('inventory.edit.submitting') : t('inventory.edit.submit')}
        </button>
      )}
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.8vh, 20px)', overflowY: 'auto', minHeight: 0, paddingRight: 2 }}>
      <button type="button" onClick={() => navigate({ to: '/inventory/catalogue' })} className="btn-ghost" style={{ width: 'fit-content' }}>
        <ArrowLeft size={16} aria-hidden="true" />
        {t('inventory.register.back')}
      </button>
      <PageHeader
        title={t('inventory.edit.title')}
        description={t('inventory.edit.description')}
      />
      <RegistrationStepper
        steps={[
          t('inventory.stepper.basicInformation'),
          t('inventory.stepper.properties'),
          t('inventory.stepper.notifications'),
          t('inventory.stepper.review'),
        ]}
        activeStep={form.activeStep}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vh, 20px)', flexShrink: 0 }}>
        {renderStep()}
      </div>

      {form.submitError ? (
        <div role="alert" style={{ padding: 12, border: '1px solid #FDE8E8', borderRadius: 8, background: '#FDF2F2', color: '#9B1C1C', fontSize: 14, fontFamily: "'Inter', system-ui, sans-serif" }}>
          {form.submitError}
        </div>
      ) : null}

      {renderFooter()}

      {form.showSuccessToast ? (
        <SuccessToast message={t('inventory.edit.successToast')} onClose={handleDismissToast} />
      ) : null}
    </div>
  );
};

export default EditInventoryPage;
