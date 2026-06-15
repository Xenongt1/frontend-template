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
    style={{
      /* Exact Figma spec */
      display: 'flex',
      padding: 16,
      alignItems: 'center',
      gap: 16,
      alignSelf: 'stretch',
      borderRadius: 8,
      border: '1px solid #B2BCC2',
      background: '#FDFDFD',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.08)',
    }}
  >
    {steps.map((label, index) => {
      const isCompleted = index < activeStep;
      const isActive = index === activeStep;

      const isHighlighted = isActive || isCompleted;

      /* colour logic */
      const labelColor = isHighlighted ? '#08283B' : '#9CA3AF';
      const circleBackground = isHighlighted ? '#08283B' : 'transparent';
      const circleBorder = isHighlighted ? '1px solid #08283B' : '1px solid #9CA3AF';
      const circleNumberColor = isHighlighted ? '#FDFDFD' : '#9CA3AF';

      return (
        <React.Fragment key={label}>
          <div
            role="listitem"
            aria-current={isActive ? 'step' : undefined}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {/* Step circle */}
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 999,
                border: circleBorder,
                background: circleBackground,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.2s ease, border-color 0.2s ease',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  color: circleNumberColor,
                  lineHeight: 1,
                }}
              >
                {index + 1}
              </span>
            </div>

            {/* Step label */}
            <span
              style={{
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                fontFamily: "'Inter', system-ui, sans-serif",
                color: labelColor,
                lineHeight: '20px',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s ease',
              }}
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
              style={{ flexShrink: 0 }}
            />
          )}
        </React.Fragment>
      );
    })}
  </nav>
  );
};
