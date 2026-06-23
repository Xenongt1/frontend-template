import { useState, useCallback } from 'react';
import { useForm, useStore } from '@tanstack/react-form';
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

interface NotificationsConfig {
  enableExpiryAlert: boolean;
  expiryDays: string;
  enableReorderAlert: boolean;
  reorderLevel: string;
  enableMinStockAlert: boolean;
  minStockLevel: string;
}

interface InventoryFormValues {
  basicInfo: BasicInfoValues;
  attributes: AttributeItem[];
  intakeFields: IntakeField[];
  tags: string[];
  grades: GradeItem[];
  notifications: NotificationsConfig;
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

const INITIAL_NOTIFICATIONS: NotificationsConfig = {
  enableExpiryAlert: false,
  expiryDays: '',
  enableReorderAlert: false,
  reorderLevel: '',
  enableMinStockAlert: false,
  minStockLevel: '',
};

const INITIAL_FORM_VALUES: InventoryFormValues = {
  basicInfo: INITIAL_BASIC_INFO,
  attributes: [],
  intakeFields: [],
  tags: [],
  grades: [],
  notifications: INITIAL_NOTIFICATIONS,
};

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

function findOptionId(options: SelectOption[], rawValue: string | undefined): string {
  if (!rawValue) return '';
  const byValue = options.find((o) => o.value === rawValue);
  if (byValue) return byValue.value;
  const normalized = rawValue.replace(/_/g, ' ').toLowerCase().trim();
  const byLabel = options.find((o) => o.label.replace(/_/g, ' ').toLowerCase().trim() === normalized);
  if (byLabel) return byLabel.value;
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
  /* Persisted form values — single TanStack Form tree */
  const form = useForm({
    defaultValues: INITIAL_FORM_VALUES,
  });

  /* Reactive reads via useStore selectors */
  const basicInfo = useStore(form.store, (s) => s.values.basicInfo);
  const attributes = useStore(form.store, (s) => s.values.attributes);
  const intakeFields = useStore(form.store, (s) => s.values.intakeFields);
  const tags = useStore(form.store, (s) => s.values.tags);
  const grades = useStore(form.store, (s) => s.values.grades);
  const notifications = useStore(form.store, (s) => s.values.notifications);
  const {
    enableExpiryAlert,
    expiryDays,
    enableReorderAlert,
    reorderLevel,
    enableMinStockAlert,
    minStockLevel,
  } = notifications;

  /* Step navigation + cross-step error display — not form values */
  const [activeStep, setActiveStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<StepErrors>({});

  /* Step 1 — Attributes draft sub-form (transient UI) */
  const [attrName, setAttrName] = useState('');
  const [attrType, setAttrType] = useState<AttributeType>('text');
  const [attrValue, setAttrValue] = useState('');
  const [isAttributeFormOpen, setIsAttributeFormOpen] = useState(false);

  /* Step 1 — Intake field draft sub-form */
  const [intakeFieldDraft, setIntakeFieldDraft] = useState<IntakeFieldDraft>(INITIAL_INTAKE_DRAFT);
  const [isIntakeFieldFormOpen, setIsIntakeFieldFormOpen] = useState(false);

  /* Step 1 — Tag draft sub-form */
  const [tagDraft, setTagDraft] = useState('');
  const [isTagFormOpen, setIsTagFormOpen] = useState(false);

  /* Grade draft sub-form (legacy / edit mode) */
  const [gradeDraft, setGradeDraft] = useState<GradeDraft>(INITIAL_GRADE_DRAFT);
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
    const bi = form.state.values.basicInfo;
    const name = bi.name.trim();
    if (!name) errors.name = i18n.t('inventory.validation.nameRequired');
    else if (name.length < 2) errors.name = i18n.t('inventory.validation.nameTooShort');

    if (!bi.category) errors.category = i18n.t('inventory.validation.categoryRequired');
    if (!bi.uom) errors.uom = i18n.t('inventory.validation.uomRequired');
    if (!bi.stockUnit) errors.stockUnit = i18n.t('inventory.validation.stockUnitRequired');
  }

  function validateIntakeFields(errors: StepErrors): void {
    form.state.values.intakeFields.forEach((f, i) => {
      if (!f.label.trim()) errors[`intakeField_${i}`] = i18n.t('inventory.validation.intakeFieldLabelRequired');
    });
  }

  function validateNotifications(errors: StepErrors): void {
    const n = form.state.values.notifications;
    const days = n.expiryDays.trim();
    if (n.enableExpiryAlert && !days) {
      errors.expiryDays = i18n.t('inventory.validation.expiryDaysRequired');
    } else if (days) {
      const num = Number(days);
      if (isNaN(num) || num <= 0) errors.expiryDays = i18n.t('inventory.validation.expiryDaysPositive');
    }

    const rLevel = n.reorderLevel.trim();
    if (n.enableReorderAlert && !rLevel) {
      errors.reorderLevel = i18n.t('inventory.validation.reorderRequired');
    } else if (rLevel) {
      const num = Number(rLevel);
      if (isNaN(num) || num < 0) errors.reorderLevel = i18n.t('inventory.validation.reorderPositive');
    }

    const mLevel = n.minStockLevel.trim();
    if (n.enableMinStockAlert && !mLevel) {
      errors.minStockLevel = i18n.t('inventory.validation.minStockRequired');
    } else if (mLevel) {
      const num = Number(mLevel);
      if (isNaN(num) || num < 0) errors.minStockLevel = i18n.t('inventory.validation.minStockPositive');
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
      form.setFieldValue(`basicInfo.${field}`, value);
      setStepErrors((prev) => clearKey(prev, field));
    },
    [form]
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
    form.setFieldValue('attributes', (prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: attrName.trim(), type: attrType, value: attrValue.trim() },
    ]);
    setAttrName('');
    setAttrType('text');
    setAttrValue('');
    setIsAttributeFormOpen(false);
  }, [attrName, attrType, attrValue, form]);

  const handleRemoveAttribute = useCallback(
    (id: string) => form.setFieldValue('attributes', (prev) => prev.filter((a) => a.id !== id)),
    [form]
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
    form.setFieldValue('intakeFields', (prev) => [
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
  }, [intakeFieldDraft, form]);

  const handleRemoveIntakeField = useCallback((id: string) => {
    form.setFieldValue('intakeFields', (prev) => prev.filter((f) => f.id !== id));
  }, [form]);

  /* Legacy inline-edit handlers kept for backward compat */
  const handleUpdateIntakeField = useCallback((id: string, value: string) => {
    form.setFieldValue('intakeFields', (prev) => {
      const index = prev.findIndex((f) => f.id === id);
      if (index !== -1) {
        setStepErrors((prevErrors) => clearKey(prevErrors, `intakeField_${index}`));
      }
      return prev.map((f) => (f.id === id ? { ...f, label: value } : f));
    });
  }, [form]);

  const handleToggleIntakeField = useCallback((id: string) => {
    form.setFieldValue('intakeFields', (prev) =>
      prev.map((f) => (f.id === id ? { ...f, required: !f.required } : f))
    );
  }, [form]);

  /* ── Handlers — Tags ── */
  const handleAddTag = useCallback(() => {
    const tag = tagDraft.trim();
    if (!tag) return;
    form.setFieldValue('tags', (prev) => (prev.includes(tag) ? prev : [...prev, tag]));
    setTagDraft('');
    setIsTagFormOpen(false);
  }, [tagDraft, form]);

  const handleRemoveTag = useCallback(
    (tag: string) => form.setFieldValue('tags', (prev) => prev.filter((t) => t !== tag)),
    [form]
  );

  /* ── Handlers — Notifications ── */
  const setExpiryDays = useCallback(
    (value: string) => form.setFieldValue('notifications.expiryDays', value),
    [form]
  );
  const setReorderLevel = useCallback(
    (value: string) => form.setFieldValue('notifications.reorderLevel', value),
    [form]
  );
  const setMinStockLevel = useCallback(
    (value: string) => form.setFieldValue('notifications.minStockLevel', value),
    [form]
  );

  const handleToggleExpiryAlert = useCallback(() => {
    form.setFieldValue('notifications.enableExpiryAlert', (v) => !v);
    setStepErrors((prev) => clearKey(prev, 'expiryDays'));
  }, [form]);

  const handleToggleReorderAlert = useCallback(() => {
    form.setFieldValue('notifications.enableReorderAlert', (v) => !v);
    setStepErrors((prev) => clearKey(prev, 'reorderLevel'));
  }, [form]);

  const handleToggleMinStockAlert = useCallback(() => {
    form.setFieldValue('notifications.enableMinStockAlert', (v) => !v);
    setStepErrors((prev) => clearKey(prev, 'minStockLevel'));
  }, [form]);

  /* ── Handlers — Grades (legacy) ── */
  const handleGradeDraftChange = useCallback(
    (field: keyof GradeDraft, value: string) =>
      setGradeDraft((prev) => ({ ...prev, [field]: value })),
    []
  );

  const handleStartEditGrade = useCallback((id: string) => {
    const grade = form.state.values.grades.find((g) => g.id === id);
    if (!grade) return;
    setGradeDraft({ name: grade.name, rank: grade.rank });
    setEditingGradeId(id);
    setIsGradeFormOpen(true);
  }, [form]);

  const handleAddGrade = useCallback(() => {
    if (!gradeDraft.name.trim() || !gradeDraft.rank.trim()) return;
    const currentGrades = form.state.values.grades;
    const duplicate = currentGrades.some(
      (g) =>
        g.id !== editingGradeId &&
        g.name.trim().toLowerCase() === gradeDraft.name.trim().toLowerCase()
    );
    if (duplicate) {
      setStepErrors((prev) => ({ ...prev, gradeDraftName: 'A grade with this name already exists' }));
      return;
    }
    if (editingGradeId) {
      form.setFieldValue('grades', (prev) =>
        prev.map((g) =>
          g.id === editingGradeId
            ? { ...g, name: gradeDraft.name.trim(), rank: gradeDraft.rank.trim() }
            : g
        )
      );
      setEditingGradeId(null);
    } else {
      form.setFieldValue('grades', (prev) => [
        ...prev,
        { id: crypto.randomUUID(), name: gradeDraft.name.trim(), rank: gradeDraft.rank.trim() },
      ]);
    }
    setGradeDraft(INITIAL_GRADE_DRAFT);
    setIsGradeFormOpen(false);
  }, [gradeDraft, editingGradeId, form]);

  const handleRemoveGrade = useCallback(
    (id: string) => form.setFieldValue('grades', (prev) => prev.filter((g) => g.id !== id)),
    [form]
  );

  /* ── Build payload ── */
  function buildPayload(): InventoryFormPayload {
    const values = form.state.values;
    const bi = values.basicInfo;
    const notif = values.notifications;
    const uomEntry = uomOptions.find((o) => o.value === bi.uom);
    return {
      name: bi.name.trim(),
      description: bi.description.trim() || undefined,
      categoryId: bi.category,
      uomLabel: uomEntry?.label ?? bi.uom,
      stockUnit: Number(bi.stockUnit),
      minStockReorderLevel: notif.reorderLevel.trim() ? Number(notif.reorderLevel) : undefined,
      minStockNotificationLevel: notif.minStockLevel.trim() ? Number(notif.minStockLevel) : undefined,
      daysBeforeExpiryNotification: notif.expiryDays.trim() ? Number(notif.expiryDays) : undefined,
      notifyOnMinStockEnabled: notif.enableMinStockAlert,
      reorderOnMinStockEnabled: notif.enableReorderAlert,
      notifyExpiryEnabled: notif.enableExpiryAlert,
      properties: values.attributes.map((a) => {
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
      stockIntakeProperties: values.intakeFields
        .filter((f) => f.label.trim())
        .map((f) => ({
          ...(f.serverId ? { id: f.serverId } : {}),
          label: f.label.trim(),
          required: f.required,
          type: f.type === 'text' ? 'STRING' : 'NUMERIC',
        })),
      tags: values.tags,
    };
  }

  /* ── Pre-populate form from existing item (edit mode) ── */
  function populateForm(item: InventoryItem, cats: SelectOption[], uoms: SelectOption[]) {
    const uomSearch = item.uomLabel ?? item.baseUnitOfMeasure;
    const nextBasicInfo: BasicInfoValues = {
      name: item.displayName,
      stockUnit: item.stockUnit != null ? String(item.stockUnit) : '',
      category: findOptionId(cats, item.category),
      uom: findOptionId(uoms, uomSearch),
      description: item.description ?? '',
    };

    const properties = item.properties
      ?? (item.attributes ?? []).map((a) => ({
        id: crypto.randomUUID(),
        label: a.label,
        value: a.value,
        type: 'STRING',
      }));
    const nextAttributes: AttributeItem[] = properties.map((p) => {
      let attrTypeNext: AttributeType;
      if (p.type === 'NUMERIC') attrTypeNext = 'number';
      else if (p.type === 'BOOLEAN') attrTypeNext = 'boolean';
      else if (p.type === 'DATE') attrTypeNext = 'date';
      else attrTypeNext = 'text';
      return {
        id: crypto.randomUUID(),
        serverId: p.id,
        label: p.label,
        value: String(p.value),
        type: attrTypeNext,
      };
    });

    const expiryDaysVal = item.daysBeforeExpiryNotification ?? item.expiryNotificationDays;
    const hasExpiry = item.notifyExpiryEnabled ?? (expiryDaysVal != null && expiryDaysVal > 0);

    const reorderVal = item.minStockReorderLevel ?? item.reorderThreshold;
    const hasReorder = item.reorderOnMinStockEnabled ?? (reorderVal != null && reorderVal > 0);

    const minStockVal = item.minStockNotificationLevel;
    const hasMinStock = item.notifyOnMinStockEnabled ?? (minStockVal != null && minStockVal > 0);

    const rawTags = item.tags ?? [];
    const nextTags = rawTags.map((t) => (typeof t === 'string' ? t : (t as { name?: string }).name ?? ''));

    const nextGrades: GradeItem[] = (item.grades ?? []).map((g) => ({
      id: g.id ?? crypto.randomUUID(),
      serverId: g.id,
      name: g.name,
      rank: String(g.rank),
    }));

    const intakeSource = item.stockIntakeProperties ?? item.batchFields ?? [];
    const nextIntakeFields: IntakeField[] = intakeSource.map((f) => {
      const fType = (f as { type?: string }).type;
      const type: 'number' | 'text' = fType === 'NUMERIC' ? 'number' : 'text';
      return {
        id: crypto.randomUUID(),
        serverId: (f as { id?: string }).id,
        label: f.label,
        required: f.required,
        type,
      };
    });

    form.reset({
      basicInfo: nextBasicInfo,
      attributes: nextAttributes,
      intakeFields: nextIntakeFields,
      tags: nextTags,
      grades: nextGrades,
      notifications: {
        enableExpiryAlert: hasExpiry,
        expiryDays: expiryDaysVal != null ? String(expiryDaysVal) : '',
        enableReorderAlert: hasReorder,
        reorderLevel: reorderVal != null ? String(reorderVal) : '',
        enableMinStockAlert: hasMinStock,
        minStockLevel: minStockVal != null ? String(minStockVal) : '',
      },
    });
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
