import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  initialName?: string;
  initialDescription?: string;
  onSubmit: (name: string, description: string) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  savingLabel: string;
}

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
    <div style={{
      background: 'var(--Background-General-Light, #FDFDFD)',
      borderRadius: 6,
      padding: '16px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>

      {/* Name field */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{
          fontFamily: 'Inter',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '21px',
          color: 'var(--Body-Text-Primary, #08283B)',
        }}>
          {t('stockLocations.register.nameLabel')}
          <span style={{ color: '#C81E1E', marginLeft: 1 }}>*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); if (nameError) setNameError(''); }}
          placeholder={t('stockLocations.register.namePlaceholder')}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'var(--Overlay-Primary, #ECECEB)',
            border: nameError
              ? '1px solid #C81E1E'
              : '1px solid var(--Stroke-Default-Medium, #B2BCC2)',
            borderRadius: 8,
            padding: '12px 16px',
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: 14,
            lineHeight: '21px',
            color: 'var(--Body-Text-Primary, #08283B)',
            outline: 'none',
          }}
        />
        {nameError && (
          <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#C81E1E' }}>
            {nameError}
          </span>
        )}
      </div>

      {/* Description field */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{
          fontFamily: 'Inter',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '21px',
          color: 'var(--Body-Text-Primary, #08283B)',
        }}>
          {t('stockLocations.register.descriptionLabel')}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('stockLocations.register.descriptionPlaceholder')}
          rows={4}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'var(--Overlay-Primary, #ECECEB)',
            border: '1px solid var(--Stroke-Default-Medium, #B2BCC2)',
            borderRadius: 8,
            padding: '12px 16px',
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: 14,
            lineHeight: '21px',
            color: 'var(--Body-Text-Primary, #08283B)',
            resize: 'vertical',
            outline: 'none',
          }}
        />
      </div>

      {submitError && (
        <p style={{ margin: 0, fontFamily: 'Inter', fontSize: 13, color: '#C81E1E' }}>
          {submitError}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button
          onClick={onCancel}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: '1px solid #2C2B29',
            borderRadius: 8,
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '21px',
            color: '#2C2B29',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {t('stockLocations.register.cancelButton')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            background: isLoading ? '#395362' : 'var(--Buttons-Filled-Dark-Blue-Default, #08283B)',
            border: 'none',
            borderRadius: 8,
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '21px',
            color: '#FDFDFD',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          {isLoading ? savingLabel : submitLabel}
        </button>
      </div>

    </div>
  );
};

export default StockLocationForm;
