import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from './ConfirmDialog';

function setup(overrides: Partial<React.ComponentProps<typeof ConfirmDialog>> = {}) {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  const props: React.ComponentProps<typeof ConfirmDialog> = {
    open: true,
    title: 'Suspend Intake',
    description: 'Are you sure?',
    onConfirm,
    onCancel,
    ...overrides,
  };
  const utils = render(<ConfirmDialog {...props} />);
  return { ...utils, onConfirm, onCancel };
}

describe('ConfirmDialog', () => {
  it('renders nothing when open is false', () => {
    const { container } = setup({ open: false });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the title and description', () => {
    setup();
    expect(screen.getByRole('heading', { name: /suspend intake/i })).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('fires onConfirm when the confirm button is clicked', () => {
    const { onConfirm } = setup({ confirmLabel: 'Suspend' });
    fireEvent.click(screen.getByRole('button', { name: 'Suspend' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('fires onCancel from the cancel button, the X button, and the backdrop', () => {
    const { onCancel } = setup({ cancelLabel: 'Cancel' });
    // Both the backdrop and the footer button are accessible as "Cancel" buttons.
    const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' });
    expect(cancelButtons).toHaveLength(2);

    fireEvent.click(cancelButtons[0]); // backdrop
    fireEvent.click(cancelButtons[1]); // footer cancel
    fireEvent.click(screen.getByRole('button', { name: 'Close' })); // X
    expect(onCancel).toHaveBeenCalledTimes(3);
  });

  it('closes on Escape key', () => {
    const { onCancel } = setup();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons and shows loading copy when loading', () => {
    setup({ loading: true, confirmLabel: 'Suspend' });
    const confirm = screen.getByRole('button', { name: /processing/i });
    expect(confirm).toBeDisabled();
    // The footer Cancel button is disabled when loading.
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
    expect(cancelButtons.some((b) => (b as HTMLButtonElement).disabled)).toBe(true);
  });

  it('applies the danger class when danger=true', () => {
    setup({ danger: true, confirmLabel: 'Suspend' });
    const confirm = screen.getByRole('button', { name: 'Suspend' });
    expect(confirm.className).toContain('bg-[#C81E1E]');
  });

  it('applies the primary class when danger=false (default)', () => {
    setup({ confirmLabel: 'Activate' });
    const confirm = screen.getByRole('button', { name: 'Activate' });
    expect(confirm.className).toContain('bg-navy-900');
  });

  it('uses sensible default button labels', () => {
    setup({ confirmLabel: undefined, cancelLabel: undefined });
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Cancel' }).length).toBeGreaterThanOrEqual(1);
  });
});
