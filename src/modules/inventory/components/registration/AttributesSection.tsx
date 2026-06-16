import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { Input } from '@/shared/components/ui';
import Button from '@/shared/components/ui/Button';
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
      className="bg-canvas-50 border border-stroke-light rounded-[10px] p-[clamp(12px,2vh,24px)] flex flex-col gap-[clamp(10px,1.6vh,18px)]"
    >
      <div className="border-b border-stroke-light pb-3 flex justify-between items-start gap-4">
        <div>
          <h2
            id="attributes-heading"
            className="m-0 font-inter text-lg font-semibold leading-7 text-brand-navy-dark"
          >
            {t('inventory.attributes.title')}
          </h2>
          <p className="mt-1 mb-0 font-inter text-sm font-normal leading-5 text-text-primary">
            {t('inventory.attributes.description')}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenForm}
          className="btn-outline px-3.5 py-2"
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
        <div className="flex flex-col gap-2.5">
          <span className="font-inter text-sm font-normal leading-5 text-text-primary">
            {t('inventory.attributes.addedLabel')}
          </span>

          <div className="flex flex-wrap gap-2">
            {attributes.map((attribute) => (
              <span
                key={attribute}
                className="inline-flex items-center gap-1 px-3 py-0.5 rounded-md border border-[#DEF7EC] bg-[#F3FAF7] text-[#00684A] font-inter text-[13px] font-medium leading-[18px]"
              >
                {attribute}
                <button
                  type="button"
                  aria-label={t('inventory.attributes.remove', { name: attribute })}
                  onClick={() => onRemove?.(attribute)}
                  className="border-none bg-transparent inline-flex items-center justify-center p-0 cursor-pointer"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {isFormOpen ? (
        <div className="flex flex-col items-start self-stretch gap-2.5 p-4 rounded-md bg-surface-page">
          <div className="w-full grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_96px] gap-4 items-center">
            <label
              htmlFor="attribute-name"
              className="m-0 font-inter text-sm font-medium leading-[1.5] text-text-primary"
            >
              {t('inventory.attributes.nameLabel')}
            </label>
            <label
              htmlFor="attribute-value"
              className="m-0 font-inter text-sm font-medium leading-[1.5] text-text-primary"
            >
              {t('inventory.attributes.valueLabel')}
            </label>
            <span aria-hidden="true" />
          </div>

          <div className="w-full grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_96px] gap-4 items-stretch">
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
            <Button
              variant="primary"
              size="sm"
              onClick={onAdd}
              leftIcon={<Plus size={16} aria-hidden="true" />}
              className="self-stretch w-24"
            >
              {t('inventory.attributes.add')}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
};
