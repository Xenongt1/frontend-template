import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BasicInfoStep } from './BasicInfoStep';
import type { BasicInfoValues } from './types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const defaultValues: BasicInfoValues = {
  name: '',
  category: '',
  uom: '',
  stockUnit: '',
  description: '',
};

const categoryOptions = [{ label: 'Raw Materials', value: 'cat-raw' }];
const uomOptions      = [{ label: 'Kilogram', value: 'uom-kg' }];

function makeProps(overrides: Partial<React.ComponentProps<typeof BasicInfoStep>> = {}) {
  return {
    values: defaultValues,
    categoryOptions,
    uomOptions,
    onChange: jest.fn(),
    errors: {},
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('BasicInfoStep', () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders all field labels', () => {
    render(<BasicInfoStep {...makeProps()} />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stock unit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/unit of measure/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('displays current field values', () => {
    const values: BasicInfoValues = {
      name: 'Sheet Steel',
      category: 'cat-raw',
      uom: 'uom-kg',
      stockUnit: '2.5',
      description: 'Steel sheets',
    };
    render(<BasicInfoStep {...makeProps({ values })} />);

    expect((screen.getByLabelText(/^name/i) as HTMLInputElement).value).toBe('Sheet Steel');
    expect((screen.getByLabelText(/stock unit/i) as HTMLInputElement).value).toBe('2.5');
  });

  it('calls onChange with the correct field and value when typing', () => {
    const onChange = jest.fn();
    render(<BasicInfoStep {...makeProps({ onChange })} />);

    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: 'Timber' } });
    expect(onChange).toHaveBeenCalledWith('name', 'Timber');

    fireEvent.change(screen.getByLabelText(/stock unit/i), { target: { value: '3' } });
    expect(onChange).toHaveBeenCalledWith('stockUnit', '3');
  });

  // ── Validation errors ──────────────────────────────────────────────────────

  it('shows no error messages when errors object is empty', () => {
    render(<BasicInfoStep {...makeProps({ errors: {} })} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders the name error message under the Name field', () => {
    render(<BasicInfoStep {...makeProps({ errors: { name: 'Name is required' } })} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required');
  });

  it('renders multiple error messages simultaneously', () => {
    render(
      <BasicInfoStep
        {...makeProps({
          errors: {
            name: 'Name is required',
            category: 'Category is required',
            uom: 'Unit of measure is required',
          },
        })}
      />,
    );
    const alerts = screen.getAllByRole('alert');
    expect(alerts.length).toBeGreaterThanOrEqual(2);
  });

  it('marks the name input as aria-invalid when there is a name error', () => {
    render(<BasicInfoStep {...makeProps({ errors: { name: 'Required' } })} />);
    expect(screen.getByLabelText(/^name/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not mark the name input as aria-invalid when there is no error', () => {
    render(<BasicInfoStep {...makeProps()} />);
    expect(screen.getByLabelText(/^name/i)).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('stock unit input accepts numeric values', () => {
    const onChange = jest.fn();
    render(<BasicInfoStep {...makeProps({ onChange })} />);
    const input = screen.getByLabelText(/stock unit/i) as HTMLInputElement;
    expect(input.type).toBe('number');
    fireEvent.change(input, { target: { value: '1.5' } });
    expect(onChange).toHaveBeenCalledWith('stockUnit', '1.5');
  });
});
