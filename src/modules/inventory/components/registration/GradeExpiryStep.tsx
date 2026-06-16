import React from 'react';
import { useTranslation } from 'react-i18next';
import { MoreVertical, Plus, Trash2 } from 'lucide-react';
import { FormField, Input } from '@/shared/components/ui';
import Button from '@/shared/components/ui/Button';
import type { GradeDraft, GradeItem, IntakeField } from './types';
import { EmptySectionPanel } from './EmptySectionPanel';
import { dropdownItemTextClass } from './RegistrationDropdown';

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

// Section card shape is reused by both Grades and Intake Fields below.
const sectionCardClass =
  'bg-canvas-50 border border-stroke-light rounded-[10px] ' +
  'p-[clamp(12px,2vh,24px)] flex flex-col gap-4';

// Dropdown menu item shape (mirrors the row-action menus elsewhere).
const menuItemClass =
  'w-full px-4 py-2 bg-canvas-50 border-none cursor-pointer text-left ' +
  'transition-colors duration-150 hover:bg-canvas-100';

const SectionHeader: React.FC<{
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}> = ({ title, description, actionLabel, onAction }) => (
  <header className="border-b border-stroke-light pb-2.5 flex items-center gap-3 flex-wrap">
    <div className="flex-1">
      <h2 className="m-0 font-inter text-lg font-semibold leading-7 text-brand-navy-dark">
        {title}
      </h2>
      <p className="mt-1 mb-0 font-inter text-sm font-normal leading-5 text-text-primary">
        {description}
      </p>
    </div>
    <button
      type="button"
      onClick={onAction}
      className="btn-outline px-3.5 py-2"
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
      className="border-none bg-transparent p-0 inline-flex items-center gap-2 cursor-pointer"
    >
      <span
        aria-hidden="true"
        className={[
          'w-10 h-5 rounded-full relative inline-block transition-colors duration-150',
          required ? 'bg-brand-navy' : 'bg-canvas-200',
        ].join(' ')}
      >
        <span
          className={[
            'absolute w-4 h-4 rounded-full bg-canvas-50 top-0.5 transition-[left] duration-150',
            required ? 'left-[22px]' : 'left-0.5',
          ].join(' ')}
        />
      </span>
      <span className="font-inter text-sm font-medium text-text-primary">
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
    <div className="flex items-end gap-3.5 flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <FormField id={field.id} label={t('inventory.intakeFields.fieldLabel')} error={error}>
          <Input
            id={field.id}
            placeholder={t('inventory.intakeFields.fieldPlaceholder')}
            value={field.label}
            onChange={(event) => onLabelChange(event.target.value)}
            aria-invalid={!!error}
            className={error
              ? 'bg-[#F0F2F4] border border-[#C81E1E]'
              : 'bg-[#F0F2F4] border border-stroke-light'}
          />
        </FormField>
      </div>
      <div className="flex items-center gap-3.5">
        <RequirementToggle required={field.required} onToggle={onToggleRequired} />
        <button
          type="button"
          aria-label={t('inventory.intakeFields.removeAriaLabel')}
          onClick={onRemove}
          className="btn-danger w-[34px] h-[34px]"
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
    <div className="flex flex-col gap-6">
      {/* ── Quality Grades section ── */}
      <form
        aria-label={t('inventory.grades.ariaLabel')}
        onSubmit={(e) => e.preventDefault()}
        className={sectionCardClass}
      >
        <SectionHeader
          title={t('inventory.grades.title')}
          description={t('inventory.grades.description')}
          actionLabel={t('inventory.grades.addButton')}
          onAction={onOpenGradeForm}
        />

        {isGradeFormOpen ? (
          <div className="rounded-md border border-stroke-light">
            <div className="p-4 bg-surface-page rounded-md">
              <div className="w-full grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_96px] gap-4 items-start">
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
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onAddGrade}
                  leftIcon={<Plus size={16} aria-hidden="true" />}
                  className="w-24 h-10 mt-[22px]"
                >
                  {editingGradeId ? t('common.save') : t('inventory.attributes.add')}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <div className={grades.length > 0 ? 'rounded-md border border-stroke-light' : ''}>
          {grades.length === 0 && !isGradeFormOpen && (
            <EmptySectionPanel>
              {t('inventory.grades.empty')}
            </EmptySectionPanel>
          )}
          {grades.length > 0 && (
            <div className="p-4 bg-surface-page rounded-md flex flex-col gap-4">
              {grades.map((grade) => (
                <div
                  key={grade.id}
                  className="p-4 rounded-lg border border-stroke-medium bg-canvas-50 flex items-center justify-between gap-3.5 relative"
                >
                  <div className="text-text-primary font-inter text-sm font-medium leading-[21px]">
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
                    className="w-[34px] h-[34px] border-none bg-transparent inline-flex items-center justify-center text-text-primary cursor-pointer rounded transition-colors duration-150 hover:bg-canvas-200"
                  >
                    <MoreVertical size={24} aria-hidden="true" />
                  </button>
                  {openGradeActionId === grade.id ? (
                    <div
                      role="menu"
                      className="absolute z-20 right-4 top-[50px] min-w-[160px] bg-canvas-50 rounded-lg border border-stroke-light overflow-hidden"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          onEditGrade(grade.id);
                          setOpenGradeActionId(null);
                        }}
                        className={menuItemClass}
                      >
                        <span className={dropdownItemTextClass}>{t('inventory.grades.edit')}</span>
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          onRemoveGrade(grade.id);
                          setOpenGradeActionId(null);
                        }}
                        className={`${menuItemClass} border-t border-stroke-light`}
                      >
                        <span className={dropdownItemTextClass}>{t('inventory.grades.deactivate')}</span>
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
        className={sectionCardClass}
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
          <div className="rounded-md border border-stroke-light">
            <div className="p-4 flex flex-col gap-4">
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
