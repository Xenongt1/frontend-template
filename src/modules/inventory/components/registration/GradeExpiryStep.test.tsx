import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { GradeExpiryStep } from './GradeExpiryStep';
import type { GradeDraft, GradeItem, IntakeField } from './types';

const emptyDraft: GradeDraft = { name: '', rank: '' };

function makeProps(overrides: Partial<React.ComponentProps<typeof GradeExpiryStep>> = {}) {
  return {
    gradeDraft: emptyDraft,
    grades: [] as GradeItem[],
    intakeFields: [] as IntakeField[],
    isGradeFormOpen: false,
    onGradeDraftChange: jest.fn(),
    onOpenGradeForm: jest.fn(),
    onAddGrade: jest.fn(),
    onEditGrade: jest.fn(),
    onRemoveGrade: jest.fn(),
    onAddIntakeField: jest.fn(),
    onUpdateIntakeField: jest.fn(),
    onToggleIntakeField: jest.fn(),
    onRemoveIntakeField: jest.fn(),
    ...overrides,
  };
}

describe('GradeExpiryStep', () => {
  it('shows empty panels for both sections by default', () => {
    render(<GradeExpiryStep {...makeProps()} />);
    expect(screen.getByText(/No grades defined yet/i)).toBeInTheDocument();
    expect(screen.getByText(/No Custom fields defined/i)).toBeInTheDocument();
  });

  it('triggers onOpenGradeForm and onAddIntakeField from headers', () => {
    const props = makeProps();
    render(<GradeExpiryStep {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /add grade/i }));
    fireEvent.click(screen.getByRole('button', { name: /add custom field/i }));
    expect(props.onOpenGradeForm).toHaveBeenCalledTimes(1);
    expect(props.onAddIntakeField).toHaveBeenCalledTimes(1);
  });

  it('renders the grade draft form and wires inputs + Add button', () => {
    const props = makeProps({
      isGradeFormOpen: true,
      gradeDraft: { name: 'A', rank: '1' },
    });
    render(<GradeExpiryStep {...props} />);

    const nameInput = screen.getByLabelText(/grade name/i) as HTMLInputElement;
    const rankInput = screen.getByLabelText(/^rank/i) as HTMLInputElement;
    expect(nameInput.value).toBe('A');
    expect(rankInput.value).toBe('1');

    fireEvent.change(nameInput, { target: { value: 'B' } });
    fireEvent.change(rankInput, { target: { value: '2' } });
    expect(props.onGradeDraftChange).toHaveBeenCalledWith('name', 'B');
    expect(props.onGradeDraftChange).toHaveBeenCalledWith('rank', '2');

    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    expect(props.onAddGrade).toHaveBeenCalledTimes(1);
  });

  it('lists grades and exposes Edit/Deactivate menu actions', () => {
    const props = makeProps({
      grades: [{ id: 'g1', name: 'Premium', rank: 'A' }],
    });
    render(<GradeExpiryStep {...props} />);

    expect(screen.getByText('Premium A')).toBeInTheDocument();
    // empty grade panel should be hidden
    expect(screen.queryByText(/No grades defined yet/i)).not.toBeInTheDocument();

    const trigger = screen.getByRole('button', { name: /open actions for premium/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const menu = screen.getByRole('menu');
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Edit' }));
    expect(props.onEditGrade).toHaveBeenCalledWith('g1');

    // Re-open and trigger Deactivate
    fireEvent.click(trigger);
    fireEvent.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: 'Deactivate' }));
    expect(props.onRemoveGrade).toHaveBeenCalledWith('g1');
  });

  it('renders intake field rows and wires their callbacks', () => {
    const props = makeProps({
      intakeFields: [
        { id: 'f1', label: 'Vehicle registration', type: 'text' as const, required: true },
      ],
    });
    render(<GradeExpiryStep {...props} />);

    const labelInput = screen.getByLabelText(/field label/i) as HTMLInputElement;
    expect(labelInput.value).toBe('Vehicle registration');
    fireEvent.change(labelInput, { target: { value: 'Driver name' } });
    expect(props.onUpdateIntakeField).toHaveBeenCalledWith('f1', 'Driver name');

    // toggle required
    const toggle = screen.getByRole('button', { name: /mark as optional/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(toggle);
    expect(props.onToggleIntakeField).toHaveBeenCalledWith('f1');

    fireEvent.click(screen.getByRole('button', { name: /remove intake field/i }));
    expect(props.onRemoveIntakeField).toHaveBeenCalledWith('f1');
  });

  it('renders optional toggle label when the field is not required', () => {
    const props = makeProps({
      intakeFields: [{ id: 'f1', label: 'Notes', type: 'text' as const, required: false }],
    });
    render(<GradeExpiryStep {...props} />);
    const toggle = screen.getByRole('button', { name: /mark as required/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });
});
