import React from 'react';
import Button from '@/shared/components/ui/Button';

interface ErrorPageAction {
  label: string;
  onClick: () => void;
}

interface ErrorPageProps {
  /** Illustration shown above the title. Pass an <img>, an inline SVG, or any node. */
  illustration: React.ReactNode;
  /** Big heading — Poppins 24px (per Figma node 2350:24300). */
  title: string;
  /** Inter 16px body text below the title. */
  description: string;
  /** Secondary outline-style CTA on the left of the primary action. */
  secondaryAction?: ErrorPageAction;
  /** Primary navy filled CTA. */
  primaryAction: ErrorPageAction;
}

/**
 * App-wide error-page layout matching Figma "error page" section
 * (node 2350:24300). Used for 404, network timeout, connection lost,
 * and 503-style screens. The illustration is a slot so each variant
 * brings its own visual.
 *
 * Secondary CTA uses a custom outline-ghost style (transparent +
 * brand-navy-mid border) — that variant isn't on the canonical
 * <Button> yet. Primary CTA uses <Button variant="primary">.
 */
const ErrorPage: React.FC<ErrorPageProps> = ({
  illustration,
  title,
  description,
  secondaryAction,
  primaryAction,
}) => (
  <div className="bg-canvas-50 flex flex-col items-center justify-center p-20 relative size-full min-h-screen">
    <div className="flex flex-col gap-6 items-center justify-center w-full">
      <div className="flex items-center justify-center shrink-0">
        {illustration}
      </div>

      <div className="flex flex-col gap-6 items-center w-full">
        <div className="flex flex-col gap-2 items-center text-center w-full">
          <h1 className="m-0 font-poppins text-2xl font-medium leading-[1.5] text-brand-navy-dark">
            {title}
          </h1>
          <p className="m-0 font-inter text-base font-normal leading-[1.5] text-text-secondary">
            {description}
          </p>
        </div>

        <div className="flex gap-4 items-start">
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-brand-navy-mid bg-transparent font-inter text-sm font-medium leading-[1.5] text-brand-navy-mid whitespace-nowrap cursor-pointer transition-colors duration-150 hover:bg-stroke-light"
            >
              {secondaryAction.label}
            </button>
          )}
          <Button variant="primary" onClick={primaryAction.onClick}>
            {primaryAction.label}
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default ErrorPage;
