import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronsRight } from 'lucide-react';

interface RegistrationStepperProps {
  steps: string[];
  activeStep: number;
}

export const RegistrationStepper: React.FC<RegistrationStepperProps> = ({
  steps,
  activeStep,
}) => {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t('inventory.stepper.ariaLabel')}
      className="flex items-center gap-4 self-stretch p-4 rounded-lg border border-stroke-medium bg-canvas-50 shadow-[0_1px_2px_0_rgba(0,0,0,0.08)]"
    >
      {steps.map((label, index) => {
        const isCompleted = index < activeStep;
        const isActive = index === activeStep;
        const isHighlighted = isActive || isCompleted;

        return (
          <React.Fragment key={label}>
            <div
              role="listitem"
              aria-current={isActive ? 'step' : undefined}
              className="flex items-center gap-2"
            >
              {/* Step circle */}
              <div
                className={[
                  'w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0',
                  'transition-colors duration-200',
                  isHighlighted
                    ? 'bg-brand-navy border border-brand-navy'
                    : 'bg-transparent border border-text-placeholder',
                ].join(' ')}
              >
                <span
                  className={[
                    'font-inter text-[11px] font-semibold leading-none',
                    isHighlighted ? 'text-canvas-50' : 'text-text-placeholder',
                  ].join(' ')}
                >
                  {index + 1}
                </span>
              </div>

              {/* Step label */}
              <span
                className={[
                  'font-inter text-sm leading-5 whitespace-nowrap',
                  'transition-colors duration-200',
                  isActive ? 'font-semibold' : 'font-normal',
                  isHighlighted ? 'text-text-primary' : 'text-text-placeholder',
                ].join(' ')}
              >
                {label}
              </span>
            </div>

            {/* Separator — chevrons-right (>>) as per Figma Assets */}
            {index < steps.length - 1 && (
              <ChevronsRight
                size={16}
                color="#08283B"
                aria-hidden="true"
                className="shrink-0"
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
