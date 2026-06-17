import React, { useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { ApiError } from '@/core/api';
import type { ApiResponse, UnitOfMeasure } from '@/types';
import { SuccessToast } from '@/shared/components/ui';
import Button from '@/shared/components/ui/Button';
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

// Same shared classes as EditInventoryPage so the two wizard pages stay
// in sync visually. Kept inline rather than exported because both pages
// own a thin wrapper around the same hook + step list; the duplication
// is two short strings.
const errorBannerClass =
  'p-3 border border-[#FDE8E8] rounded-lg bg-[#FDF2F2] text-[#9B1C1C] text-sm font-inter';
const outerWrapperClass =
  'flex-1 flex flex-col gap-[clamp(12px,1.8vh,20px)] overflow-y-auto min-h-0 pr-0.5';

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
    <div className="flex justify-end items-center gap-3 shrink-0 pb-1">
      {form.activeStep === 0 ? (
        <button type="button" onClick={() => navigate({ to: '/inventory/catalogue' })} className="btn-outline min-w-[87px]">
          {t('common.cancel')}
        </button>
      ) : (
        <button type="button" onClick={form.goPrev} className="btn-outline min-w-[100px]">
          {t('common.previous')}
        </button>
      )}

      {form.activeStep < FORM_STEPS.length - 1 ? (
        <Button variant="primary" onClick={() => { handleGoNext(); }} className="min-w-[111px]">
          {t('common.next')}
        </Button>
      ) : (
        <Button variant="primary" onClick={handleSubmit} disabled={form.isSubmitting} className="min-w-[160px]">
          {form.isSubmitting ? t('inventory.register.submitting') : t('inventory.register.submit')}
        </Button>
      )}
    </div>
  );

  return (
    <div className={outerWrapperClass}>
      <button
        type="button"
        onClick={() => navigate({ to: '/inventory/catalogue' })}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-canvas-300 bg-canvas-50 text-text-primary text-sm font-medium cursor-pointer w-fit transition-colors hover:bg-canvas-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-button-focus-ring"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t('inventory.register.back')}
      </button>

      <div>
        <h1 className="m-0 font-inter text-xl font-semibold leading-7 text-brand-navy-dark">
          {t('inventory.register.title')}
        </h1>
        <p className="mt-1 mb-0 font-inter text-sm font-normal text-text-primary">
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

      <div className="flex flex-col gap-[clamp(12px,2vh,20px)] shrink-0">
        {renderStep()}
      </div>

      {form.submitError ? (
        <div role="alert" className={errorBannerClass}>
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
