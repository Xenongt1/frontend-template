import { useState, useCallback } from 'react';
import i18n from '@/i18n';
import type { InventoryItem } from '@/types';
import type {
  AttributeItem,
  AttributeType,
  BasicInfoValues,
  GradeDraft,
  GradeItem,
  IntakeField,
  IntakeFieldDraft,
} from '../components/registration';

/* ─── Types ─────────────────────────────────────────────────────────────────── */

export type SelectOption = { label: string; value: string };
export type StepErrors = Record<string, string>;

export interface InventoryFormPayload {
  name: string;
  description?: string;
  categoryId: string;
  uomLabel: string;
  stockUnit: number;
  minStockReorderLevel?: number;
  minStockNotificationLevel?: number;
  daysBeforeExpiryNotification?: number;
  notifyOnMinStockEnabled: boolean;
  reorderOnMinStockEnabled: boolean;
  notifyExpiryEnabled: boolean;
  properties: { id?: string; label: string; value: string | number | boolean; type: string }[];
  stockIntakeProperties: { id?: string; label: string; required: boolean; type: string }[];
  tags: string[];
}

/* ─── Constants ─────────────────────────────────────────────────────────────── */

export const FORM_STEPS = ['Basic Information', 'Properties', 'Notifications', 'Review'];

const INITIAL_BASIC_INFO: BasicInfoValues = {
  name: '',
  category: '',
  uom: '',
  stockUnit: '',
  description: '',
};

const INITIAL_GRADE_DRAFT: GradeDraft = { name: '', rank: '' };
const INITIAL_INTAKE_DRAFT: IntakeFieldDraft = { label: '', type: 'text', required: true };

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

function findOptionId(options: SelectOption[], rawValue: string | undefined): string {
  if (!rawValue) return '';
  // 1. Exact value match (UUID/ID)
  const byValue = options.find((o) => o.value === rawValue);
  if (byValue) return byValue.value;
  const normalized = rawValue.replace(/_/g, ' ').toLowerCase().trim();
  // 2. Exact label match (case-insensitive)
  const byLabel = options.find((o) => o.label.replace(/_/g, ' ').toLowerCase().trim() === normalized);
  if (byLabel) return byLabel.value;
  // 3. Substring fallback — handles "KG" vs "Kilogram (KG)" or similar
  const byPartial = options.find((o) => {
    const lbl = o.label.replace(/_/g, ' ').toLowerCase().trim();
    return lbl.includes(normalized) || normalized.includes(lbl);
  });
  return byPartial?.value ?? '';
}

function clearKey(prev: StepErrors, key: string): StepErrors {
  if (!(key in prev)) return prev;
  const next = { ...prev };
  delete next[key];
  return next;
}

/* ─── Hook ───────────────────────────────────────────────────────────────────── */

export function useInventoryForm() {
  /* Steps */
  const [activeStep, setActiveStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<StepErrors>({});

  /* Step 0 — Basic Info */
  const [basicInfo, setBasicInfo] = useState<BasicInfoValues>(INITIAL_BASIC_INFO);

  /* Step 1 — Properties */
  const [attributes, setAttributes] = useState<AttributeItem[]>([]);
  const [attrName, setAttrName] = useState('');
  const [attrType, setAttrType] = useState<AttributeType>('text');
  const [attrValue, setAttrValue] = useState('');
  const [isAttributeFormOpen, setIsAttributeFormOpen] = useState(false);

  const [intakeFields, setIntakeFields] = useState<IntakeField[]>([]);
  const [intakeFieldDraft, setIntakeFieldDraft] = useState<IntakeFieldDraft>(INITIAL_INTAKE_DRAFT);
  const [isIntakeFieldFormOpen, setIsIntakeFieldFormOpen] = useState(false);

  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState('');
  const [isTagFormOpen, setIsTagFormOpen] = useState(false);

  /* Step 2 — Notifications */
  const [enableExpiryAlert, setEnableExpiryAlert] = useState(false);
  const [expiryDays, setExpiryDays] = useState('');
  const [enableReorderAlert, setEnableReorderAlert] = useState(false);
  const [reorderLevel, setReorderLevel] = useState('');
  const [enableMinStockAlert, setEnableMinStockAlert] = useState(false);
  const [minStockLevel, setMinStockLevel] = useState('');

  /* Grades (kept for backward compat / edit mode pre-population) */
  const [gradeDraft, setGradeDraft] = useState<GradeDraft>(INITIAL_GRADE_DRAFT);
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [isGradeFormOpen, setIsGradeFormOpen] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);

  /* Lookup options */
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [uomOptions, setUomOptions] = useState<SelectOption[]>([]);

  /* Submit state */
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Validation ── */
  function validateBasicInfo(errors: StepErrors): void {
    const name = basicInfo.name.trim();
    if (!name) errors.name = i18n.t('inventory.validation.nameRequired');
    else if (name.length < 2) errors.name = i18n.t('inventory.validation.nameTooShort');

    if (!basicInfo.category) errors.category = i18n.t('inventory.validation.categoryRequired');
    if (!basicInfo.uom) errors.uom = i18n.t('inventory.validation.uomRequired');
    if (!basicInfo.stockUnit) errors.stockUnit = i18n.t('inventory.validation.stockUnitRequired');
  }

  function validateIntakeFields(errors: StepErrors): void {
    intakeFields.forEach((f, i) => {
      if (!f.label.trim()) errors[`intakeField_${i}`] = i18n.t('inventory.validation.intakeFieldLabelRequired');
    });
  }

  function validateNotifications(errors: StepErrors): void {
    const days = expiryDays.trim();
    if (enableExpiryAlert && !days) {
      errors.expiryDays = i18n.t('inventory.validation.expiryDaysRequired');
    } else if (days) {
      const n = Number(days);
      if (isNaN(n) || n <= 0) errors.expiryDays = i18n.t('inventory.validation.expiryDaysPositive');
    }

    const rLevel = reorderLevel.trim();
    if (enableReorderAlert && !rLevel) {
      errors.reorderLevel = i18n.t('inventory.validation.reorderRequired');
    } else if (rLevel) {
      const n = Number(rLevel);
      if (isNaN(n) || n < 0) errors.reorderLevel = i18n.t('inventory.validation.reorderPositive');
    }

    const mLevel = minStockLevel.trim();
    if (enableMinStockAlert && !mLevel) {
      errors.minStockLevel = i18n.t('inventory.validation.minStockRequired');
    } else if (mLevel) {
      const n = Number(mLevel);
      if (isNaN(n) || n < 0) errors.minStockLevel = i18n.t('inventory.validation.minStockPositive');
    }
  }

  function validateStep(step: number): boolean {
    const errors: StepErrors = {};
    if (step === 0) validateBasicInfo(errors);
    if (step === 1) validateIntakeFields(errors);
    if (step === 2) validateNotifications(errors);
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  }

  /* ── Navigation ── */
  const goNext = async (asyncValidate?: () => Promise<Record<string, string>>) => {
    if (!validateStep(activeStep)) return;
    if (asyncValidate) {
      const extraErrors = await asyncValidate();
      if (Object.keys(extraErrors).length > 0) {
        setStepErrors((prev) => ({ ...prev, ...extraErrors }));
        return;
      }
    }
    setStepErrors({});
    setActiveStep((s) => Math.min(s + 1, FORM_STEPS.length - 1));
  };

  const goPrev = () => {
    setStepErrors({});
    setActiveStep((s) => Math.max(s - 1, 0));
  };

  /* ── Handlers — Basic Info ── */
  const handleBasicInfoChange = useCallback(
    (field: keyof BasicInfoValues, value: string) => {
      setBasicInfo((prev) => ({ ...prev, [field]: value }));
      setStepErrors((prev) => clearKey(prev, field));
    },
    []
  );

  /* ── Handlers — Attributes ── */
  const handleAttrTypeChange = useCallback((type: AttributeType) => {
    setAttrType(type);
    setAttrValue(type === 'boolean' ? 'true' : '');
    setStepErrors((prev) => clearKey(prev, 'attrValue'));
  }, []);

  const handleAddAttribute = useCallback(() => {
    const errors: StepErrors = {};
    if (!attrName.trim()) errors.attrName = i18n.t('inventory.validation.attrNameRequired');
    if (attrType !== 'boolean' && !attrValue.trim()) {
      errors.attrValue = i18n.t('inventory.validation.attrValueRequired');
    } else if (attrType === 'number' && isNaN(Number(attrValue))) {
      errors.attrValue = i18n.t('inventory.validation.attrValueNumber');
    } else if (attrType === 'date' && isNaN(Date.parse(attrValue))) {
      errors.attrValue = i18n.t('inventory.validation.attrValueDate');
    }
    if (Object.keys(errors).length > 0) {
      setStepErrors((prev) => ({ ...prev, ...errors }));
      return;
    }
    setStepErrors((prev) => {
      const next = { ...prev };
      delete next.attrName;
      delete next.attrValue;
      return next;
    });
    setAttributes((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: attrName.trim(), type: attrType, value: attrValue.trim() },
    ]);
    setAttrName('');
    setAttrType('text');
    setAttrValue('');
    setIsAttributeFormOpen(false);
  }, [attrName, attrType, attrValue]);

  const handleRemoveAttribute = useCallback(
    (id: string) => setAttributes((prev) => prev.filter((a) => a.id !== id)),
    []
  );

  /* ── Handlers — Intake Fields ── */
  const handleIntakeFieldDraftLabelChange = useCallback((value: string) => {
    setIntakeFieldDraft((prev) => ({ ...prev, label: value }));
    setStepErrors((prev) => clearKey(prev, 'intakeFieldDraftLabel'));
  }, []);

  const handleIntakeFieldDraftTypeChange = useCallback((type: 'number' | 'text') => {
    setIntakeFieldDraft((prev) => ({ ...prev, type }));
  }, []);

  const handleIntakeFieldDraftRequiredToggle = useCallback(() => {
    setIntakeFieldDraft((prev) => ({ ...prev, required: !prev.required }));
  }, []);

  const handleAddIntakeFieldFromDraft = useCallback(() => {
    if (!intakeFieldDraft.label.trim()) {
      setStepErrors((prev) => ({
        ...prev,
        intakeFieldDraftLabel: i18n.t('inventory.validation.intakeFieldNameRequired'),
      }));
      return;
    }
    setIntakeFields((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: intakeFieldDraft.label.trim(),
        type: intakeFieldDraft.type,
        required: intakeFieldDraft.required,
      },
    ]);
    setIntakeFieldDraft(INITIAL_INTAKE_DRAFT);
    setIsIntakeFieldFormOpen(false);
    setStepErrors((prev) => clearKey(prev, 'intakeFieldDraftLabel'));
  }, [intakeFieldDraft]);

  const handleRemoveIntakeField = useCallback((id: string) => {
    setIntakeFields((prev) => prev.filter((f) => f.id !== id));
  }, []);

  /* Legacy inline-edit handlers kept for backward compat */
  const handleUpdateIntakeField = useCallback((id: string, value: string) => {
    setIntakeFields((prev) => {
      const index = prev.findIndex((f) => f.id === id);
      if (index !== -1) {
        setStepErrors((prevErrors) => clearKey(prevErrors, `intakeField_${index}`));
      }
      return prev.map((f) => (f.id === id ? { ...f, label: value } : f));
    });
  }, []);

  const handleToggleIntakeField = useCallback((id: string) => {
    setIntakeFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, required: !f.required } : f))
    );
  }, []);

  /* ── Handlers — Tags ── */
  const handleAddTag = useCallback(() => {
    const tag = tagDraft.trim();
    if (!tag) return;
    setTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
    setTagDraft('');
    setIsTagFormOpen(false);
  }, [tagDraft]);

  const handleRemoveTag = useCallback(
    (tag: string) => setTags((prev) => prev.filter((t) => t !== tag)),
    []
  );

  /* ── Handlers — Notifications ── */
  const handleToggleExpiryAlert = useCallback(() => {
    setEnableExpiryAlert((v) => !v);
    setStepErrors((prev) => clearKey(prev, 'expiryDays'));
  }, []);

  const handleToggleReorderAlert = useCallback(() => {
    setEnableReorderAlert((v) => !v);
    setStepErrors((prev) => clearKey(prev, 'reorderLevel'));
  }, []);

  const handleToggleMinStockAlert = useCallback(() => {
    setEnableMinStockAlert((v) => !v);
    setStepErrors((prev) => clearKey(prev, 'minStockLevel'));
  }, []);

  /* ── Handlers — Grades (legacy) ── */
  const handleGradeDraftChange = useCallback(
    (field: keyof GradeDraft, value: string) =>
      setGradeDraft((prev) => ({ ...prev, [field]: value })),
    []
  );

  const handleStartEditGrade = useCallback((id: string) => {
    const grade = grades.find((g) => g.id === id);
    if (!grade) return;
    setGradeDraft({ name: grade.name, rank: grade.rank });
    setEditingGradeId(id);
    setIsGradeFormOpen(true);
  }, [grades]);

  const handleAddGrade = useCallback(() => {
    if (!gradeDraft.name.trim() || !gradeDraft.rank.trim()) return;
    const duplicate = grades.some(
      (g) =>
        g.id !== editingGradeId &&
        g.name.trim().toLowerCase() === gradeDraft.name.trim().toLowerCase()
    );
    if (duplicate) {
      setStepErrors((prev) => ({ ...prev, gradeDraftName: 'A grade with this name already exists' }));
      return;
    }
    if (editingGradeId) {
      setGrades((prev) =>
        prev.map((g) =>
          g.id === editingGradeId
            ? { ...g, name: gradeDraft.name.trim(), rank: gradeDraft.rank.trim() }
            : g
        )
      );
      setEditingGradeId(null);
    } else {
      setGrades((prev) => [
        ...prev,
        { id: crypto.randomUUID(), name: gradeDraft.name.trim(), rank: gradeDraft.rank.trim() },
      ]);
    }
    setGradeDraft(INITIAL_GRADE_DRAFT);
    setIsGradeFormOpen(false);
  }, [gradeDraft, editingGradeId, grades]);

  const handleRemoveGrade = useCallback(
    (id: string) => setGrades((prev) => prev.filter((g) => g.id !== id)),
    []
  );

  /* ── Build payload ── */
  function buildPayload(): InventoryFormPayload {
    const uomEntry = uomOptions.find((o) => o.value === basicInfo.uom);
    return {
      name: basicInfo.name.trim(),
      description: basicInfo.description.trim() || undefined,
      categoryId: basicInfo.category,
      uomLabel: uomEntry?.label ?? basicInfo.uom,
      stockUnit: Number(basicInfo.stockUnit),
      minStockReorderLevel: reorderLevel.trim() ? Number(reorderLevel) : undefined,
      minStockNotificationLevel: minStockLevel.trim() ? Number(minStockLevel) : undefined,
      daysBeforeExpiryNotification: expiryDays.trim() ? Number(expiryDays) : undefined,
      notifyOnMinStockEnabled: enableMinStockAlert,
      reorderOnMinStockEnabled: enableReorderAlert,
      notifyExpiryEnabled: enableExpiryAlert,
      properties: attributes.map((a) => {
        let type: string;
        if (a.type === 'text') type = 'STRING';
        else if (a.type === 'number') type = 'NUMERIC';
        else if (a.type === 'boolean') type = 'BOOLEAN';
        else type = 'DATE';
        let value: string | number | boolean = a.value;
        if (a.type === 'number') value = Number(a.value);
        else if (a.type === 'boolean') value = a.value === 'true';
        return { ...(a.serverId ? { id: a.serverId } : {}), label: a.label, value, type };
      }),
      stockIntakeProperties: intakeFields
        .filter((f) => f.label.trim())
        .map((f) => ({ ...(f.serverId ? { id: f.serverId } : {}), label: f.label.trim(), required: f.required, type: f.type === 'text' ? 'STRING' : 'NUMERIC' })),
      tags,
    };
  }

  /* ── Pre-populate form from existing item (edit mode) ── */
  function populateForm(item: InventoryItem, cats: SelectOption[], uoms: SelectOption[]) {
    const uomSearch = item.uomLabel ?? item.baseUnitOfMeasure;
    setBasicInfo({
      name: item.displayName,
      stockUnit: item.stockUnit != null ? String(item.stockUnit) : '',
      category: findOptionId(cats, item.category),
      uom: findOptionId(uoms, uomSearch),
      description: item.description ?? '',
    });
    const properties = item.properties ?? (item.attributes ?? []).map((a) => ({ id: crypto.randomUUID(), label: a.label, value: a.value, type: 'STRING' }));
    setAttributes(
      properties.map((p) => {
        let attrType: AttributeType;
        if (p.type === 'NUMERIC') attrType = 'number';
        else if (p.type === 'BOOLEAN') attrType = 'boolean';
        else if (p.type === 'DATE') attrType = 'date';
        else attrType = 'text';
        return {
          id: crypto.randomUUID(),
          serverId: p.id,
          label: p.label,
          value: String(p.value),
          type: attrType,
        };
      })
    );
    // Expiry alert — prefer new field names, fall back to legacy
    const expiryDaysVal = item.daysBeforeExpiryNotification ?? item.expiryNotificationDays;
    const hasExpiry = item.notifyExpiryEnabled ?? (expiryDaysVal != null && expiryDaysVal > 0);
    setEnableExpiryAlert(hasExpiry);
    setExpiryDays(expiryDaysVal != null ? String(expiryDaysVal) : '');

    // Reorder alert
    const reorderVal = item.minStockReorderLevel ?? item.reorderThreshold;
    const hasReorder = item.reorderOnMinStockEnabled ?? (reorderVal != null && reorderVal > 0);
    setEnableReorderAlert(hasReorder);
    setReorderLevel(reorderVal != null ? String(reorderVal) : '');

    // Min stock alert
    const minStockVal = item.minStockNotificationLevel;
    const hasMinStock = item.notifyOnMinStockEnabled ?? (minStockVal != null && minStockVal > 0);
    setEnableMinStockAlert(hasMinStock);
    setMinStockLevel(minStockVal != null ? String(minStockVal) : '');

    const rawTags = item.tags ?? [];
    setTags(rawTags.map((t) => (typeof t === 'string' ? t : (t as { name?: string }).name ?? '')));
    setGrades(
      (item.grades ?? []).map((g) => ({
        id: g.id ?? crypto.randomUUID(),
        serverId: g.id,
        name: g.name,
        rank: String(g.rank),
      }))
    );
    const intakeSource = item.stockIntakeProperties ?? item.batchFields ?? [];
    setIntakeFields(
      intakeSource.map((f) => {
        const fType = (f as { type?: string }).type;
        const type: 'number' | 'text' = fType === 'NUMERIC' ? 'number' : 'text';
        return { id: crypto.randomUUID(), serverId: (f as { id?: string }).id, label: f.label, required: f.required, type };
      })
    );
    setStepErrors({});
  }

  return {
    /* Steps */
    activeStep,
    setActiveStep,
    goNext,
    goPrev,
    stepErrors,
    setStepErrors,

    /* Basic Info */
    basicInfo,
    handleBasicInfoChange,

    /* Attributes */
    attributes,
    attrName,
    setAttrName,
    attrType,
    setAttrType,
    attrValue,
    setAttrValue,
    isAttributeFormOpen,
    setIsAttributeFormOpen,
    handleAttrTypeChange,
    handleAddAttribute,
    handleRemoveAttribute,

    /* Intake Fields */
    intakeFields,
    intakeFieldDraft,
    isIntakeFieldFormOpen,
    setIsIntakeFieldFormOpen,
    handleIntakeFieldDraftLabelChange,
    handleIntakeFieldDraftTypeChange,
    handleIntakeFieldDraftRequiredToggle,
    handleAddIntakeFieldFromDraft,
    handleRemoveIntakeField,
    handleUpdateIntakeField,
    handleToggleIntakeField,

    /* Tags */
    tags,
    tagDraft,
    setTagDraft,
    isTagFormOpen,
    setIsTagFormOpen,
    handleAddTag,
    handleRemoveTag,

    /* Notifications */
    enableExpiryAlert,
    expiryDays,
    setExpiryDays,
    handleToggleExpiryAlert,
    enableReorderAlert,
    reorderLevel,
    setReorderLevel,
    handleToggleReorderAlert,
    enableMinStockAlert,
    minStockLevel,
    setMinStockLevel,
    handleToggleMinStockAlert,

    /* Grades (legacy) */
    gradeDraft,
    grades,
    isGradeFormOpen,
    setIsGradeFormOpen,
    editingGradeId,
    handleGradeDraftChange,
    handleStartEditGrade,
    handleAddGrade,
    handleRemoveGrade,

    /* Options */
    categoryOptions,
    setCategoryOptions,
    uomOptions,
    setUomOptions,

    /* Submit state */
    showSuccessToast,
    setShowSuccessToast,
    submitError,
    setSubmitError,
    isSubmitting,
    setIsSubmitting,

    /* Utilities */
    buildPayload,
    populateForm,
  };
}
