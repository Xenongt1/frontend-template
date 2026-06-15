import React, { useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { ApiError } from '@/core/api';
import type { ApiResponse, UnitOfMeasure } from '@/types';
import { SuccessToast } from '@/shared/components/ui';
import {
  RegistrationStepper,
  BasicInfoStep,
  PropertiesStep,
  NotificationsStep,
  ReviewStep,
} from '../components/registration';
import { useInventoryForm, FORM_STEPS } from '../hooks/useInventoryForm';
import { inventoryApi } from '../api/inventoryApi';

const STEP0_FIELD_MAP: Record<string, string> = {
  name:        'name',
  categoryId:  'category',
  uomLabel:    'uom',
  description: 'description',
};

const RegisterInventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const submitRedirectTimer = useRef<number | undefined>(undefined);
  const form = useInventoryForm();

  useEffect(() => {
    return () => {
      if (submitRedirectTimer.current) window.clearTimeout(submitRedirectTimer.current);
    };
  }, []);

  /* Load category + UOM options */
  useEffect(() => {
    let isMounted = true;

    async function loadLookups() {
      try {
        const [categories, unitsResponse]: [
          { value: string; label: string }[],
          ApiResponse<UnitOfMeasure[]>,
        ] = await Promise.all([
          inventoryApi.getCategories(),
          inventoryApi.getUnitsOfMeasure(),
        ]);
        if (!isMounted) return;
        form.setCategoryOptions(categories);
        form.setUomOptions(unitsResponse.data.map((u) => ({ label: u.name, value: u.id })));
      } catch {
        if (!isMounted) return;
        form.setCategoryOptions([]);
        form.setUomOptions([]);
      }
    }

    loadLookups();
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoNext = async () => {
    await form.goNext();
  };

  const applyApiValidationErrors = (apiError: ApiError) => {
    const step0Errors: Record<string, string> = {};
    const otherMessages: string[] = [];
    for (const [field, msg] of Object.entries(apiError.errors ?? {})) {
      const formField = STEP0_FIELD_MAP[field];
      if (formField) step0Errors[formField] = msg;
      else otherMessages.push(`${field}: ${msg}`);
    }
    if (Object.keys(step0Errors).length > 0) {
      form.setStepErrors(step0Errors);
      form.setActiveStep(0);
    }
    if (otherMessages.length > 0) {
      form.setSubmitError(otherMessages.join('\n'));
    }
  };

  const handleSubmit = async () => {
    form.setSubmitError('');
    form.setIsSubmitting(true);
    try {
      await inventoryApi.createItem(form.buildPayload());
      form.setShowSuccessToast(true);
      if (submitRedirectTimer.current) window.clearTimeout(submitRedirectTimer.current);
      submitRedirectTimer.current = window.setTimeout(() => navigate({ to: '/inventory/catalogue' }), 1200);
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        applyApiValidationErrors(error);
      } else {
        form.setSubmitError(error instanceof Error ? error.message : t('inventory.register.genericFailure'));
      }
    } finally {
      form.setIsSubmitting(false);
    }
  };

  const handleDismissToast = () => {
    form.setShowSuccessToast(false);
    if (submitRedirectTimer.current) window.clearTimeout(submitRedirectTimer.current);
  };

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
        <button type="button" onClick={() => { handleGoNext(); }} className="btn-primary" style={{ minWidth: 111 }}>
          {t('common.next')}
        </button>
      ) : (
        <button type="button" onClick={handleSubmit} className="btn-primary" disabled={form.isSubmitting} style={{ minWidth: 160 }}>
          {form.isSubmitting ? t('inventory.register.submitting') : t('inventory.register.submit')}
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

      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 600,
            fontFamily: "'Inter', system-ui, sans-serif",
            color: '#041620',
            lineHeight: '28px',
          }}
        >
          {t('inventory.register.title')}
        </h1>
        <p
          style={{
            margin: '4px 0 0 0',
            fontSize: 14,
            fontWeight: 400,
            fontFamily: "'Inter', system-ui, sans-serif",
            color: '#08283B',
          }}
        >
          {t('inventory.register.description')}
        </p>
      </div>

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
        <SuccessToast message={t('inventory.register.successToast')} onClose={handleDismissToast} />
      ) : null}
    </div>
  );
};

export default RegisterInventoryPage;
