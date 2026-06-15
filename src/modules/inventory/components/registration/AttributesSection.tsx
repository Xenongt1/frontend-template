import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { Input } from '@/shared/components/ui';
import { EmptySectionPanel } from './EmptySectionPanel';

interface AttributesSectionProps {
  attributes?: string[];
  nameValue?: string;
  value?: string;
  isFormOpen?: boolean;
  onOpenForm?: () => void;
  onNameChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  onAdd?: () => void;
  onRemove?: (attribute: string) => void;
}

export const AttributesSection: React.FC<AttributesSectionProps> = ({
  attributes = [],
  nameValue = '',
  value = '',
  isFormOpen = false,
  onOpenForm,
  onNameChange,
  onValueChange,
  onAdd,
  onRemove,
}) => {
  const { t } = useTranslation();
  const hasAttributes = attributes.length > 0;

  return (
    <section
      aria-labelledby="attributes-heading"
      style={{
        background: '#FDFDFD',
        border: '1px solid #E6EAEB',
        borderRadius: 10,
        padding: 'clamp(12px, 2vh, 24px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(10px, 1.6vh, 18px)',
      }}
    >
      <div
        style={{
          borderBottom: '1px solid #E6EAEB',
          paddingBottom: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
        }}
      >
        <div>
          <h2
            id="attributes-heading"
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
              fontFamily: "'Inter', system-ui, sans-serif",
              color: '#041620',
              lineHeight: '28px',
            }}
          >
            {t('inventory.attributes.title')}
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
            {t('inventory.attributes.description')}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenForm}
          className="btn-outline"
          style={{ padding: '8px 14px' }}
        >
          <Plus size={16} aria-hidden="true" />
          {t('inventory.attributes.addButton')}
        </button>
      </div>

      {!hasAttributes && !isFormOpen ? (
        <EmptySectionPanel>
          {t('inventory.attributes.empty')}
        </EmptySectionPanel>
      ) : null}

      {hasAttributes ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 400,
              fontFamily: "'Inter', system-ui, sans-serif",
              color: '#08283B',
              lineHeight: '20px',
            }}
          >
            {t('inventory.attributes.addedLabel')}
          </span>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {attributes.map((attribute) => (
              <span
                key={attribute}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 12px',
                  borderRadius: 'var(--rounded-md, 6px)',
                  border: '1px solid var(--Badge-Green-Stroke, #DEF7EC)',
                  background: 'var(--Badge-Green-Fill, #F3FAF7)',
                  color: '#00684A',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  lineHeight: '18px',
                }}
              >
                {attribute}
                <button
                  type="button"
                  aria-label={t('inventory.attributes.remove', { name: attribute })}
                  onClick={() => onRemove?.(attribute)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {isFormOpen ? (
        <div
          style={{
            display: 'flex',
            padding: 16,
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 10,
            alignSelf: 'stretch',
            borderRadius: 'var(--rounded-md, 6px)',
            background: 'var(--Page-Background, #F7F7F7)',
          }}
        >
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) 96px',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <label
              htmlFor="attribute-name"
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "'Inter', system-ui, sans-serif",
                color: '#08283B',
                lineHeight: 1.5,
              }}
            >
              {t('inventory.attributes.nameLabel')}
            </label>
            <label
              htmlFor="attribute-value"
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "'Inter', system-ui, sans-serif",
                color: '#08283B',
                lineHeight: 1.5,
              }}
            >
              {t('inventory.attributes.valueLabel')}
            </label>
            <span aria-hidden="true" />
          </div>

          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) 96px',
              gap: 16,
              alignItems: 'stretch',
            }}
          >
            <Input
              id="attribute-name"
              placeholder={t('inventory.attributes.namePlaceholder')}
              value={nameValue}
              onChange={(event) => onNameChange?.(event.target.value)}
            />
            <Input
              id="attribute-value"
              placeholder={t('inventory.attributes.valuePlaceholder')}
              value={value}
              onChange={(event) => onValueChange?.(event.target.value)}
            />
            <button
              type="button"
              onClick={onAdd}
              className="btn-primary"
              style={{ alignSelf: 'stretch', width: 96, padding: '8px 12px' }}
            >
              <Plus size={16} aria-hidden="true" />
              {t('inventory.attributes.add')}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};
