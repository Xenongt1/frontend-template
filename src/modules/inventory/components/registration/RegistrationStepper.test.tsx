import React from 'react';
import { render, screen } from '@testing-library/react';
import { RegistrationStepper } from './RegistrationStepper';

const STEPS = ['Basic Information', 'Intake Parameters', 'Review'];

describe('RegistrationStepper', () => {
  it('renders every step label and numbers them', () => {
    render(<RegistrationStepper steps={STEPS} activeStep={0} />);
    STEPS.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('marks only the active step with aria-current="step"', () => {
    render(<RegistrationStepper steps={STEPS} activeStep={1} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).not.toHaveAttribute('aria-current');
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[2]).not.toHaveAttribute('aria-current');
  });

  it('renders chevron separators between (but not after) the last step', () => {
    const { container } = render(
      <RegistrationStepper steps={STEPS} activeStep={0} />
    );
    // Chevrons rendered via lucide-react are inline <svg> elements
    // between step items. We expect steps.length - 1 separators.
    const separators = container.querySelectorAll(
      'nav > svg.lucide-chevrons-right'
    );
    expect(separators.length).toBe(STEPS.length - 1);
  });

  it('renders correctly when there is only one step (no separators)', () => {
    const { container } = render(
      <RegistrationStepper steps={['Only']} activeStep={0} />
    );
    expect(
      container.querySelectorAll('nav > svg.lucide-chevrons-right')
    ).toHaveLength(0);
  });
});
