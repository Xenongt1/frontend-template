import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, X } from 'lucide-react';
import { FormField, Input, Select } from '@/shared/components/ui';
import Button from '@/shared/components/ui/Button';
import type { AttributeItem, AttributeType, IntakeField, IntakeFieldDraft } from './types';

interface PropertiesStepProps {
  attributes: AttributeItem[];
  attrName: string;
  attrType: AttributeType;
  attrValue: string;
  isAttributeFormOpen: boolean;
  onOpenAttributeForm: () => void;
  onAttrNameChange: (value: string) => void;
  onAttrTypeChange: (type: AttributeType) => void;
  onAttrValueChange: (value: string) => void;
  onAddAttribute: () => void;
  onRemoveAttribute: (id: string) => void;

  intakeFields: IntakeField[];
  intakeFieldDraft: IntakeFieldDraft;
  isIntakeFieldFormOpen: boolean;
  onOpenIntakeFieldForm: () => void;
  onIntakeFieldDraftLabelChange: (value: string) => void;
  onIntakeFieldDraftTypeChange: (type: 'number' | 'text') => void;
  onIntakeFieldDraftRequiredToggle: () => void;
  onAddIntakeFieldFromDraft: () => void;
  onRemoveIntakeField: (id: string) => void;
  errors?: Record<string, string>;

  tags: string[];
  tagDraft: string;
  isTagFormOpen: boolean;
  onOpenTagForm: () => void;
  onTagDraftChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

// Repeated card/header shape across the three sections. Extract once.
const cardClass =
  'bg-canvas-50 border border-stroke-light rounded-[10px] ' +
  'p-[clamp(12px,2vh,24px)] flex flex-col gap-[clamp(10px,1.6vh,18px)]';
const sectionHeaderClass =
  'border-b border-stroke-light pb-3 flex justify-between items-start gap-4';
const headingClass =
  'm-0 font-inter text-lg font-semibold leading-7 text-brand-navy-dark';
const descClass =
  'mt-1 mb-0 font-inter text-sm font-normal leading-5 text-text-primary';
const addedLabelClass = 'font-inter text-sm font-normal leading-5 text-text-primary';

const TypeBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md border border-stroke-light bg-canvas-50 text-text-primary font-inter text-xs font-medium leading-[18px] whitespace-nowrap">
    {children}
  </span>
);

const RequiredBadge: React.FC = () => {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md border border-[#FDE8E8] bg-[#FDF2F2] text-[#9B1C1C] font-inter text-xs font-medium leading-[18px] whitespace-nowrap">
      {t('common.required')}
    </span>
  );
};


export const PropertiesStep: React.FC<PropertiesStepProps> = ({
  attributes,
  attrName,
  attrType,
  attrValue,
  isAttributeFormOpen,
  onOpenAttributeForm,
  onAttrNameChange,
  onAttrTypeChange,
  onAttrValueChange,
  onAddAttribute,
  onRemoveAttribute,
  intakeFields,
  intakeFieldDraft,
  isIntakeFieldFormOpen,
  onOpenIntakeFieldForm,
  onIntakeFieldDraftLabelChange,
  onIntakeFieldDraftTypeChange,
  onIntakeFieldDraftRequiredToggle,
  onAddIntakeFieldFromDraft,
  onRemoveIntakeField,
  errors = {},
  tags,
  tagDraft,
  isTagFormOpen,
  onOpenTagForm,
  onTagDraftChange,
  onAddTag,
  onRemoveTag,
}) => {
  const { t } = useTranslation();

  let attrInputType: 'number' | 'date' | 'text' = 'text';
  if (attrType === 'number') attrInputType = 'number';
  else if (attrType === 'date') attrInputType = 'date';

  let attrInputPlaceholder: string;
  if (attrType === 'number') attrInputPlaceholder = t('inventory.attributes.valuePlaceholderNumber');
  else if (attrType === 'date') attrInputPlaceholder = '';
  else attrInputPlaceholder = t('inventory.attributes.valuePlaceholder');

  return (
    <div className="flex flex-col gap-[clamp(12px,2vh,20px)]">
      {/* ── Inventory Item Properties ── */}
      <section aria-labelledby="inv-props-heading" className={cardClass}>
        <div className={sectionHeaderClass}>
          <div>
            <h2 id="inv-props-heading" className={headingClass}>
              {t('inventory.properties.title')}
            </h2>
            <p className={descClass}>{t('inventory.properties.description')}</p>
          </div>
          <button
            type="button"
            onClick={onOpenAttributeForm}
            className="btn-outline px-3.5 py-2 shrink-0"
          >
            <Plus size={16} aria-hidden="true" />
            {t('inventory.properties.addButton')}
          </button>
        </div>

        {attributes.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className={addedLabelClass}>{t('inventory.properties.addedLabel')}</span>
            <div className="flex flex-wrap gap-2">
              {attributes.map((attr) => (
                <span
                  key={attr.id}
                  className="inline-flex items-center gap-1.5 pl-3 pr-2.5 py-1 rounded-md border border-[#DEF7EC] bg-[#F3FAF7] text-[#00684A] font-inter text-[13px] font-medium leading-[18px]"
                >
                  {attr.label}: {attr.value}
                  <button
                    type="button"
                    aria-label={t('inventory.attributes.remove', { name: `${attr.label} ${attr.value}` })}
                    onClick={() => onRemoveAttribute(attr.id)}
                    className="border-none bg-transparent inline-flex items-center p-0 cursor-pointer text-[#00684A]"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {isAttributeFormOpen && (
          <div className="p-4 rounded-lg border border-stroke-light bg-canvas-50">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 items-end">
              <FormField id="attr-type" label={t('inventory.properties.propertyTypeLabel')}>
                <Select
                  id="attr-type"
                  value={attrType}
                  onChange={(e) => onAttrTypeChange(e.target.value as AttributeType)}
                  options={[
                    { label: t('inventory.properties.typeText'), value: 'text' },
                    { label: t('inventory.properties.typeNumber'), value: 'number' },
                    { label: t('inventory.properties.typeBoolean'), value: 'boolean' },
                    { label: t('inventory.properties.typeDate'), value: 'date' },
                  ]}
                />
              </FormField>

              <FormField id="attr-name" label={t('inventory.attributes.nameLabel')} required error={errors.attrName}>
                <Input
                  id="attr-name"
                  placeholder={t('inventory.attributes.namePlaceholder')}
                  value={attrName}
                  onChange={(e) => onAttrNameChange(e.target.value)}
                  aria-invalid={!!errors.attrName}
                />
              </FormField>

              <FormField id="attr-value" label={t('inventory.attributes.valueLabel')} required error={errors.attrValue}>
                {attrType === 'boolean' ? (
                  <Select
                    id="attr-value"
                    value={attrValue}
                    onChange={(e) => onAttrValueChange(e.target.value)}
                    options={[
                      { label: t('common.true'), value: 'true' },
                      { label: t('common.false'), value: 'false' },
                    ]}
                  />
                ) : (
                  <Input
                    id="attr-value"
                    type={attrInputType}
                    placeholder={attrInputPlaceholder}
                    value={attrValue}
                    onChange={(e) => onAttrValueChange(e.target.value)}
                    aria-invalid={!!errors.attrValue}
                  />
                )}
              </FormField>

              <Button
                variant="primary"
                onClick={onAddAttribute}
                leftIcon={<Plus size={16} aria-hidden="true" />}
                className="h-[42px]"
              >
                {t('inventory.attributes.add')}
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* ── Stock Level Properties ── */}
      <section aria-labelledby="stock-props-heading" className={cardClass}>
        <div className={sectionHeaderClass}>
          <div>
            <h2 id="stock-props-heading" className={headingClass}>
              {t('inventory.properties.stockLevelTitle')}
            </h2>
            <p className={descClass}>{t('inventory.properties.stockLevelDescription')}</p>
          </div>
          <button
            type="button"
            onClick={onOpenIntakeFieldForm}
            className="btn-outline px-3.5 py-2 shrink-0"
          >
            <Plus size={16} aria-hidden="true" />
            {t('inventory.properties.addStockButton')}
          </button>
        </div>

        {intakeFields.length > 0 && (
          <div className="rounded-md border border-stroke-light overflow-hidden">
            {intakeFields.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between gap-3 px-4 py-3 border-b border-stroke-light bg-canvas-50 last:border-b-0"
              >
                <span className="font-inter text-sm font-medium text-text-primary flex-1">
                  {field.label}
                </span>
                <div className="flex items-center gap-2">
                  <TypeBadge>
                    {field.type === 'number'
                      ? t('inventory.properties.typeNumber')
                      : t('inventory.properties.typeText')}
                  </TypeBadge>
                  {field.required && <RequiredBadge />}
                  <button
                    type="button"
                    aria-label={t('inventory.properties.removeField')}
                    onClick={() => onRemoveIntakeField(field.id)}
                    className="btn-danger w-[34px] h-[34px] shrink-0"
                  >
                    <Trash2 size={16} color="#FDFDFD" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isIntakeFieldFormOpen && (
          <div className="p-4 rounded-lg border border-stroke-light bg-canvas-50">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] gap-4 items-end">
              <FormField
                id="intake-field-name"
                label={t('inventory.properties.fieldNameLabel')}
                required
                error={errors.intakeFieldDraftLabel}
              >
                <Input
                  id="intake-field-name"
                  placeholder={t('inventory.properties.fieldNamePlaceholder')}
                  value={intakeFieldDraft.label}
                  onChange={(e) => onIntakeFieldDraftLabelChange(e.target.value)}
                  aria-invalid={!!errors.intakeFieldDraftLabel}
                />
              </FormField>

              <FormField id="intake-field-type" label={t('inventory.properties.propertyTypeLabel')}>
                <Select
                  id="intake-field-type"
                  value={intakeFieldDraft.type}
                  onChange={(e) => onIntakeFieldDraftTypeChange(e.target.value as 'number' | 'text')}
                  options={[
                    { label: t('inventory.properties.typeText'), value: 'text' },
                    { label: t('inventory.properties.typeNumber'), value: 'number' },
                  ]}
                  placeholder={t('inventory.properties.propertyTypePlaceholder')}
                />
              </FormField>

              {/* Required field checkbox */}
              <div className="flex items-start gap-2.5 pb-0.5">
                <input
                  type="checkbox"
                  id="intake-required"
                  checked={intakeFieldDraft.required}
                  onChange={onIntakeFieldDraftRequiredToggle}
                  className="w-4 h-4 mt-0.5 cursor-pointer accent-brand-navy shrink-0"
                />
                <div>
                  <label
                    htmlFor="intake-required"
                    className="font-inter text-sm font-semibold text-text-primary cursor-pointer block"
                  >
                    {t('inventory.properties.requiredFieldLabel')}
                  </label>
                  <p className="mt-0.5 mb-0 font-inter text-xs leading-4 text-text-tertiary">
                    {t('inventory.properties.requiredFieldDesc')}
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={onAddIntakeFieldFromDraft}
                leftIcon={<Plus size={16} aria-hidden="true" />}
                className="h-[42px]"
              >
                {t('inventory.attributes.add')}
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* ── Tags ── */}
      <section aria-labelledby="tags-heading" className={cardClass}>
        <div className={sectionHeaderClass}>
          <div>
            <h2 id="tags-heading" className={headingClass}>
              {t('inventory.properties.tagsTitle')}
            </h2>
            <p className={descClass}>{t('inventory.properties.tagsDescription')}</p>
          </div>
          <button
            type="button"
            onClick={onOpenTagForm}
            className="btn-outline px-3.5 py-2 shrink-0"
          >
            <Plus size={16} aria-hidden="true" />
            {t('inventory.properties.addTagButton')}
          </button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className={addedLabelClass}>{t('inventory.properties.tagsAddedLabel')}</span>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-0.5 rounded-md border border-[#FDE8E8] bg-[#FDF2F2] text-[#9B1C1C] font-inter text-[13px] font-medium leading-[18px]"
                >
                  {tag}
                  <button
                    type="button"
                    aria-label={t('inventory.properties.removeTag', { name: tag })}
                    onClick={() => onRemoveTag(tag)}
                    className="border-none bg-transparent inline-flex items-center p-0 cursor-pointer text-[#9B1C1C]"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {isTagFormOpen && (
          <div className="p-4 rounded-md bg-surface-page flex gap-3 items-end">
            <div className="flex-1">
              <FormField id="tag-input" label={t('inventory.properties.tagsTitle')} required>
                <Input
                  id="tag-input"
                  placeholder={t('inventory.properties.tagPlaceholder')}
                  value={tagDraft}
                  onChange={(e) => onTagDraftChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onAddTag();
                    }
                  }}
                />
              </FormField>
            </div>
            <Button
              variant="primary"
              onClick={onAddTag}
              leftIcon={<Plus size={16} aria-hidden="true" />}
              className="h-10"
            >
              {t('inventory.attributes.add')}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};
