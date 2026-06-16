import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';

describe('FormField', () => {
  it('renders the label', () => {
    render(<FormField id="test" label="Name"><input id="test" /></FormField>);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('renders a required asterisk when required is true', () => {
    render(<FormField id="test" label="Name" required><input id="test" /></FormField>);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders an optional hint when optional is true', () => {
    render(<FormField id="test" label="Name" optional><input id="test" /></FormField>);
    expect(screen.getByText(/optional/i)).toBeInTheDocument();
  });

  it('renders a hint text when hint is provided', () => {
    render(<FormField id="test" label="UOM" hint="(UOM)"><input id="test" /></FormField>);
    expect(screen.getByText('(UOM)')).toBeInTheDocument();
  });

  it('does not render an error message when error prop is absent', () => {
    render(<FormField id="test" label="Name"><input id="test" /></FormField>);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders the error message when error prop is provided', () => {
    render(
      <FormField id="test" label="Name" error="Name is required">
        <input id="test" />
      </FormField>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert.textContent).toBe('Name is required');
  });

  it('error message has the correct id for aria-describedby linking', () => {
    render(
      <FormField id="my-field" label="Name" error="Required">
        <input id="my-field" />
      </FormField>,
    );
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'my-field-error');
  });

  it('does not render required asterisk when error is set but required is false', () => {
    render(
      <FormField id="test" label="Name" error="Invalid">
        <input id="test" />
      </FormField>,
    );
    expect(screen.queryByText('*')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders children inside the field', () => {
    render(
      <FormField id="test" label="Name">
        <input id="test" data-testid="the-input" />
      </FormField>,
    );
    expect(screen.getByTestId('the-input')).toBeInTheDocument();
  });
});
