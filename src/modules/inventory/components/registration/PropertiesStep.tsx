import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, X } from 'lucide-react';
import { FormField, Input, Select } from '@/shared/components/ui';
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

const cardStyle: React.CSSProperties = {
  background: '#FDFDFD',
  border: '1px solid #E6EAEB',
  borderRadius: 10,
  padding: 'clamp(12px, 2vh, 24px)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'clamp(10px, 1.6vh, 18px)',
};

const sectionHeaderStyle: React.CSSProperties = {
  borderBottom: '1px solid #E6EAEB',
  paddingBottom: 12,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
};

const headingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 600,
  fontFamily: "'Inter', system-ui, sans-serif",
  color: '#041620',
  lineHeight: '28px',
};

const descStyle: React.CSSProperties = {
  margin: '4px 0 0 0',
  fontSize: 14,
  fontWeight: 400,
  fontFamily: "'Inter', system-ui, sans-serif",
  color: '#08283B',
  lineHeight: '20px',
};

const addedLabelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 400,
  fontFamily: "'Inter', system-ui, sans-serif",
  color: '#08283B',
  lineHeight: '20px',
};

const TypeBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 10px',
      borderRadius: 6,
      border: '1px solid #E6EAEB',
      background: '#FDFDFD',
      color: '#08283B',
      fontSize: 12,
      fontWeight: 500,
      fontFamily: "'Inter', system-ui, sans-serif",
      lineHeight: '18px',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

const RequiredBadge: React.FC = () => {
  const { t } = useTranslation();
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        borderRadius: 6,
        border: '1px solid #FDE8E8',
        background: '#FDF2F2',
        color: '#9B1C1C',
        fontSize: 12,
        fontWeight: 500,
        fontFamily: "'Inter', system-ui, sans-serif",
        lineHeight: '18px',
        whiteSpace: 'nowrap',
      }}
    >
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vh, 20px)' }}>
      {/* ── Inventory Item Properties ── */}
      <section aria-labelledby="inv-props-heading" style={cardStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <h2 id="inv-props-heading" style={headingStyle}>
              {t('inventory.properties.title')}
            </h2>
            <p style={descStyle}>{t('inventory.properties.description')}</p>
          </div>
          <button
            type="button"
            onClick={onOpenAttributeForm}
            className="btn-outline"
            style={{ padding: '8px 14px', flexShrink: 0 }}
          >
            <Plus size={16} aria-hidden="true" />
            {t('inventory.properties.addButton')}
          </button>
        </div>

        {attributes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={addedLabelStyle}>{t('inventory.properties.addedLabel')}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {attributes.map((attr) => (
                <span
                  key={attr.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px 4px 12px',
                    borderRadius: 6,
                    border: '1px solid #DEF7EC',
                    background: '#F3FAF7',
                    color: '#00684A',
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    lineHeight: '18px',
                  }}
                >
                  {attr.label}: {attr.value}
                  <button
                    type="button"
                    aria-label={t('inventory.attributes.remove', { name: `${attr.label} ${attr.value}` })}
                    onClick={() => onRemoveAttribute(attr.id)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: 0,
                      cursor: 'pointer',
                      color: '#00684A',
                    }}
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {isAttributeFormOpen && (
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              border: '1px solid #E6EAEB',
              background: '#FDFDFD',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) auto',
                gap: 16,
                alignItems: 'flex-end',
              }}
            >
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

              <button
                type="button"
                onClick={onAddAttribute}
                className="btn-primary"
                style={{ padding: '10px 18px', height: 42, whiteSpace: 'nowrap' }}
              >
                <Plus size={16} aria-hidden="true" />
                {t('inventory.attributes.add')}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Stock Level Properties ── */}
      <section aria-labelledby="stock-props-heading" style={cardStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <h2 id="stock-props-heading" style={headingStyle}>
              {t('inventory.properties.stockLevelTitle')}
            </h2>
            <p style={descStyle}>{t('inventory.properties.stockLevelDescription')}</p>
          </div>
          <button
            type="button"
            onClick={onOpenIntakeFieldForm}
            className="btn-outline"
            style={{ padding: '8px 14px', flexShrink: 0 }}
          >
            <Plus size={16} aria-hidden="true" />
            {t('inventory.properties.addStockButton')}
          </button>
        </div>

        {intakeFields.length > 0 && (
          <div
            style={{
              borderRadius: 6,
              border: '1px solid #E6EAEB',
              overflow: 'hidden',
            }}
          >
            {intakeFields.map((field) => (
              <div
                key={field.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '12px 16px',
                  borderBottom: '1px solid #E6EAEB',
                  background: '#FDFDFD',
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    color: '#08283B',
                    flex: 1,
                  }}
                >
                  {field.label}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                    className="btn-danger"
                    style={{ width: 34, height: 34, flexShrink: 0 }}
                  >
                    <Trash2 size={16} color="#FDFDFD" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isIntakeFieldFormOpen && (
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              border: '1px solid #E6EAEB',
              background: '#FDFDFD',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) auto auto',
                gap: 16,
                alignItems: 'end',
              }}
            >
              {/* Property Name */}
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

              {/* Property Type */}
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingBottom: 2 }}>
                <input
                  type="checkbox"
                  id="intake-required"
                  checked={intakeFieldDraft.required}
                  onChange={onIntakeFieldDraftRequiredToggle}
                  style={{
                    width: 16,
                    height: 16,
                    marginTop: 2,
                    cursor: 'pointer',
                    accentColor: '#08283B',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <label
                    htmlFor="intake-required"
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: "'Inter', system-ui, sans-serif",
                      color: '#08283B',
                      cursor: 'pointer',
                      display: 'block',
                    }}
                  >
                    {t('inventory.properties.requiredFieldLabel')}
                  </label>
                  <p
                    style={{
                      margin: '2px 0 0 0',
                      fontSize: 12,
                      fontFamily: "'Inter', system-ui, sans-serif",
                      color: '#5A6F7C',
                      lineHeight: '16px',
                    }}
                  >
                    {t('inventory.properties.requiredFieldDesc')}
                  </p>
                </div>
              </div>

              {/* Add button */}
              <button
                type="button"
                onClick={onAddIntakeFieldFromDraft}
                className="btn-primary"
                style={{ padding: '10px 18px', height: 42, whiteSpace: 'nowrap' }}
              >
                <Plus size={16} aria-hidden="true" />
                {t('inventory.attributes.add')}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Tags ── */}
      <section aria-labelledby="tags-heading" style={cardStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <h2 id="tags-heading" style={headingStyle}>
              {t('inventory.properties.tagsTitle')}
            </h2>
            <p style={descStyle}>{t('inventory.properties.tagsDescription')}</p>
          </div>
          <button
            type="button"
            onClick={onOpenTagForm}
            className="btn-outline"
            style={{ padding: '8px 14px', flexShrink: 0 }}
          >
            <Plus size={16} aria-hidden="true" />
            {t('inventory.properties.addTagButton')}
          </button>
        </div>

        {tags.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={addedLabelStyle}>{t('inventory.properties.tagsAddedLabel')}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 12px',
                    borderRadius: 6,
                    border: '1px solid #FDE8E8',
                    background: '#FDF2F2',
                    color: '#9B1C1C',
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    lineHeight: '18px',
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    aria-label={t('inventory.properties.removeTag', { name: tag })}
                    onClick={() => onRemoveTag(tag)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: 0,
                      cursor: 'pointer',
                      color: '#9B1C1C',
                    }}
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {isTagFormOpen && (
          <div
            style={{
              padding: 16,
              borderRadius: 6,
              background: '#F7F7F7',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-end',
            }}
          >
            <div style={{ flex: 1 }}>
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
            <button
              type="button"
              onClick={onAddTag}
              className="btn-primary"
              style={{ padding: '8px 16px', height: 40 }}
            >
              <Plus size={16} aria-hidden="true" />
              {t('inventory.attributes.add')}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
