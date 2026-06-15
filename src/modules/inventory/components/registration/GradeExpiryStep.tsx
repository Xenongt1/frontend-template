import React from 'react';
import { useTranslation } from 'react-i18next';
import { MoreVertical, Plus, Trash2 } from 'lucide-react';
import { FormField, Input } from '@/shared/components/ui';
import type { GradeDraft, GradeItem, IntakeField } from './types';
import { EmptySectionPanel } from './EmptySectionPanel';
import { dropdownItemTextStyle } from './RegistrationDropdown';

interface GradeExpiryStepProps {
  gradeDraft: GradeDraft;
  grades: GradeItem[];
  intakeFields: IntakeField[];
  isGradeFormOpen?: boolean;
  editingGradeId?: string | null;
  errors?: Record<string, string>;
  onGradeDraftChange: (field: keyof GradeDraft, value: string) => void;
  onOpenGradeForm: () => void;
  onEditGrade: (id: string) => void;
  onAddGrade: () => void;
  onRemoveGrade: (id: string) => void;
  onAddIntakeField: () => void;
  onUpdateIntakeField: (id: string, value: string) => void;
  onToggleIntakeField: (id: string) => void;
  onRemoveIntakeField: (id: string) => void;
}

const SectionHeader: React.FC<{
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}> = ({ title, description, actionLabel, onAction }) => (
  <header
    style={{
      borderBottom: '1px solid #E6EAEB',
      paddingBottom: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
    }}
  >
    <div style={{ flex: 1 }}>
      <h2
        style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 600,
          fontFamily: "'Inter', system-ui, sans-serif",
          color: '#041620',
          lineHeight: '28px',
        }}
      >
        {title}
      </h2>
      <p
        style={{
          margin: '4px 0 0 0',
          fontSize: 14,
          fontWeight: 400,
          fontFamily: "'Inter', system-ui, sans-serif",
          color: '#08283B',
          lineHeight: '20px',
        }}
      >
        {description}
      </p>
    </div>
    <button
      type="button"
      onClick={onAction}
      className="btn-outline"
      style={{ padding: '8px 14px' }}
    >
      <Plus size={16} aria-hidden="true" />
      {actionLabel}
    </button>
  </header>
);

const RequirementToggle: React.FC<{ required: boolean; onToggle: () => void }> = ({
  required,
  onToggle,
}) => {
  const { t } = useTranslation();
  return (
  <button
    type="button"
    aria-pressed={required}
    aria-label={required ? t('inventory.grades.toggleOptional') : t('inventory.grades.toggleRequired')}
    onClick={onToggle}
    style={{
      border: 'none',
      background: 'transparent',
      padding: 0,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
    }}
  >
    <span
      aria-hidden="true"
      style={{
        width: 40,
        height: 20,
        borderRadius: 999,
        background: required ? '#08283B' : '#ECECEB',
        position: 'relative',
        display: 'inline-block',
        transition: 'background 0.15s ease',
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 999,
          background: '#FDFDFD',
          position: 'absolute',
          top: 2,
          left: required ? 22 : 2,
          transition: 'left 0.15s ease',
        }}
      />
    </span>
    <span
      style={{
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#08283B',
      }}
    >
      {required ? t('common.required') : t('common.optional')}
    </span>
  </button>
  );
};

const IntakeFieldRow: React.FC<{
  field: IntakeField;
  error?: string;
  onLabelChange: (value: string) => void;
  onToggleRequired: () => void;
  onRemove: () => void;
}> = ({ field, error, onLabelChange, onToggleRequired, onRemove }) => {
  const { t } = useTranslation();
  return (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
    <div style={{ flex: 1, minWidth: 200 }}>
      <FormField id={field.id} label={t('inventory.intakeFields.fieldLabel')} error={error}>
        <Input
          id={field.id}
          placeholder={t('inventory.intakeFields.fieldPlaceholder')}
          value={field.label}
          onChange={(event) => onLabelChange(event.target.value)}
          aria-invalid={!!error}
          style={{ background: '#F0F2F4', border: error ? '1px solid #C81E1E' : '1px solid #E6EAEB' }}
        />
      </FormField>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <RequirementToggle required={field.required} onToggle={onToggleRequired} />
      <button
        type="button"
        aria-label={t('inventory.intakeFields.removeAriaLabel')}
        onClick={onRemove}
        className="btn-danger"
        style={{ width: 34, height: 34 }}
      >
        <Trash2 size={16} color="#FDFDFD" />
      </button>
    </div>
  </div>
  );
};

export const GradeExpiryStep: React.FC<GradeExpiryStepProps> = ({
  gradeDraft,
  grades,
  intakeFields,
  isGradeFormOpen = false,
  editingGradeId = null,
  errors = {},
  onGradeDraftChange,
  onOpenGradeForm,
  onEditGrade,
  onAddGrade,
  onRemoveGrade,
  onAddIntakeField,
  onUpdateIntakeField,
  onToggleIntakeField,
  onRemoveIntakeField,
}) => {
  const { t } = useTranslation();
  const formatGradeLabel = (grade: GradeItem) => `${grade.name} ${grade.rank}`.trim();
  const [openGradeActionId, setOpenGradeActionId] = React.useState<string | null>(null);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* ── Quality Grades section ── */}
      <form
        aria-label={t('inventory.grades.ariaLabel')}
        onSubmit={(e) => e.preventDefault()}
        style={{
          background: '#FDFDFD',
          border: '1px solid #E6EAEB',
          borderRadius: 10,
          padding: 'clamp(12px, 2vh, 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <SectionHeader
          title={t('inventory.grades.title')}
          description={t('inventory.grades.description')}
          actionLabel={t('inventory.grades.addButton')}
          onAction={onOpenGradeForm}
        />

        {isGradeFormOpen ? (
          <div style={{ borderRadius: 6, border: '1px solid #E6EAEB' }}>
            <div
              style={{
                padding: 16,
                background: '#F7F7F7',
                borderRadius: 6,
              }}
            >
              <div
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) 96px',
                  gap: 16,
                  alignItems: 'flex-start',
                }}
              >
                <FormField id="grade-name" label={t('inventory.grades.nameLabel')} required error={errors.gradeDraftName}>
                  <Input
                    id="grade-name"
                    placeholder={t('inventory.grades.namePlaceholder')}
                    value={gradeDraft.name}
                    onChange={(event) => onGradeDraftChange('name', event.target.value)}
                    aria-invalid={!!errors.gradeDraftName}
                  />
                </FormField>
                <FormField id="grade-rank" label={t('inventory.grades.rankLabel')} required error={errors.gradeDraftRank}>
                  <Input
                    id="grade-rank"
                    placeholder={t('inventory.grades.rankPlaceholder')}
                    value={gradeDraft.rank}
                    onChange={(event) => onGradeDraftChange('rank', event.target.value)}
                    aria-invalid={!!errors.gradeDraftRank}
                  />
                </FormField>
                <button
                  type="button"
                  onClick={onAddGrade}
                  className="btn-primary"
                  style={{
                    width: 96,
                    height: 40,
                    padding: '8px 12px',
                    marginTop: 22,
                  }}
                >
                  <Plus size={16} aria-hidden="true" />
                  {editingGradeId ? t('common.save') : t('inventory.attributes.add')}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div
          style={{
            borderRadius: 6,
            border: grades.length > 0 ? '1px solid #E6EAEB' : 'none',
          }}
        >
          {grades.length === 0 && !isGradeFormOpen && (
            <EmptySectionPanel>
              {t('inventory.grades.empty')}
            </EmptySectionPanel>
          )}
          {grades.length > 0 && (
            <div
              style={{
                padding: 16,
                background: '#F7F7F7',
                borderRadius: 6,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {grades.map((grade) => (
                <div
                  key={grade.id}
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    border: '1px solid #B2BCC2',
                    background: '#FDFDFD',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      color: '#08283B',
                      fontSize: 14,
                      fontWeight: 500,
                      fontFamily: "'Inter', system-ui, sans-serif",
                      lineHeight: '21px',
                    }}
                  >
                    {formatGradeLabel(grade)}
                  </div>
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={openGradeActionId === grade.id}
                    aria-label={t('inventory.grades.openActions', { name: grade.name })}
                    onClick={() =>
                      setOpenGradeActionId((current) =>
                        current === grade.id ? null : grade.id
                      )
                    }
                    style={{
                      width: 34,
                      height: 34,
                      border: 'none',
                      background: 'transparent',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#08283B',
                      cursor: 'pointer',
                    }}
                  >
                    <MoreVertical size={24} aria-hidden="true" />
                  </button>
                  {openGradeActionId === grade.id ? (
                    <div
                      role="menu"
                      style={{
                        position: 'absolute',
                        zIndex: 20,
                        right: 16,
                        top: 50,
                        minWidth: 160,
                        background: '#FDFDFD',
                        borderRadius: 8,
                        border: '1px solid #E6EAEB',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          onEditGrade(grade.id);
                          setOpenGradeActionId(null);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          border: 'none',
                          background: '#FDFDFD',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <span style={dropdownItemTextStyle}>{t('inventory.grades.edit')}</span>
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          onRemoveGrade(grade.id);
                          setOpenGradeActionId(null);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          border: 'none',
                          borderTop: '1px solid #E6EAEB',
                          background: '#FDFDFD',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <span style={dropdownItemTextStyle}>{t('inventory.grades.deactivate')}</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </form>

      {/* ── Define Intake Fields section ── */}
      <form
        aria-label={t('inventory.intakeFields.ariaLabel')}
        onSubmit={(e) => e.preventDefault()}
        style={{
          background: '#FDFDFD',
          border: '1px solid #E6EAEB',
          borderRadius: 10,
          padding: 'clamp(12px, 2vh, 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <SectionHeader
          title={t('inventory.intakeFields.title')}
          description={t('inventory.intakeFields.description')}
          actionLabel={t('inventory.intakeFields.addButton')}
          onAction={onAddIntakeField}
        />

        {intakeFields.length === 0 ? (
          <EmptySectionPanel>
            {t('inventory.intakeFields.empty')}
          </EmptySectionPanel>
        ) : (
          <div style={{ borderRadius: 6, border: '1px solid #E6EAEB' }}>
            <div
              style={{
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {intakeFields.map((field, index) => (
                <IntakeFieldRow
                  key={field.id}
                  field={field}
                  error={errors[`intakeField_${index}`]}
                  onLabelChange={(value) => onUpdateIntakeField(field.id, value)}
                  onToggleRequired={() => onToggleIntakeField(field.id)}
                  onRemove={() => onRemoveIntakeField(field.id)}
                />
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
