import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/ui/Button';

interface Props {
  initialName?: string;
  initialDescription?: string;
  onSubmit: (name: string, description: string) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  savingLabel: string;
}

// Shared input/textarea classes — same border/bg/typography for both fields.
// The nameError branch swaps the border to the literal error red (#C81E1E),
// kept as an arbitrary value until a design-system error token lands.
const baseFieldClass =
  'w-full box-border bg-canvas-200 rounded-lg px-4 py-3 ' +
  'font-inter text-sm font-normal leading-[21px] text-text-primary outline-none';

const StockLocationForm: React.FC<Props> = ({
  initialName = '',
  initialDescription = '',
  onSubmit,
  onCancel,
  submitLabel,
  savingLabel,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [nameError, setNameError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setNameError(t('stockLocations.validation.nameRequired'));
      return;
    }
    setNameError('');
    setSubmitError('');
    setIsLoading(true);
    try {
      await onSubmit(name.trim(), description.trim());
    } catch (err) {
      const e = err as { message?: string; errors?: string[] };
      setSubmitError(
        e.errors?.length ? e.errors.join(' ') : (e.message ?? t('stockLocations.register.genericFailure'))
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-canvas-50 rounded-md px-6 py-4 flex flex-col gap-5">

      {/* Name field */}
      <div className="flex flex-col gap-2">
        <label className="font-inter text-sm font-medium leading-[21px] text-text-primary">
          {t('stockLocations.register.nameLabel')}
          <span className="text-[#C81E1E] ml-px">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); if (nameError) setNameError(''); }}
          placeholder={t('stockLocations.register.namePlaceholder')}
          className={[
            baseFieldClass,
            nameError ? 'border border-[#C81E1E]' : 'border border-stroke-medium',
          ].join(' ')}
        />
        {nameError && (
          <span className="font-inter text-xs text-[#C81E1E]">
            {nameError}
          </span>
        )}
      </div>

      {/* Description field */}
      <div className="flex flex-col gap-2">
        <label className="font-inter text-sm font-medium leading-[21px] text-text-primary">
          {t('stockLocations.register.descriptionLabel')}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('stockLocations.register.descriptionPlaceholder')}
          rows={4}
          className={`${baseFieldClass} border border-stroke-medium resize-y`}
        />
      </div>

      {submitError && (
        <p className="m-0 font-inter text-[13px] text-[#C81E1E]">
          {submitError}
        </p>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {/* Cancel is an outline-style button (transparent + dark grey border).
            Doesn't map to any of primary/secondary/tertiary in the current
            Figma button spec — when that variant lands, swap this in. */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={[
            'px-5 py-2.5 bg-transparent border border-[#2C2B29] rounded-lg',
            'font-inter text-sm font-medium leading-[21px] text-[#2C2B29]',
            'transition-colors duration-150 hover:bg-canvas-200',
            isLoading ? 'cursor-not-allowed' : 'cursor-pointer',
          ].join(' ')}
        >
          {t('stockLocations.register.cancelButton')}
        </button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? savingLabel : submitLabel}
        </Button>
      </div>

    </div>
  );
};

export default StockLocationForm;
