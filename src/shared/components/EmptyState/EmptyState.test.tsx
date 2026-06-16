import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from './index';

describe('EmptyState', () => {
  it('renders title, description and the default illustration', () => {
    render(<EmptyState title="No inventory" description="Add some items." />);
    expect(screen.getByRole('heading', { name: /no inventory/i })).toBeInTheDocument();
    expect(screen.getByText('Add some items.')).toBeInTheDocument();
    expect(
      screen.getByTestId('no-inventory-illustration')
    ).toBeInTheDocument();
  });

  it('hides the icon when showIcon is false', () => {
    render(
      <EmptyState title="No inventory" description="Add items." showIcon={false} />
    );
    expect(
      screen.queryByTestId('no-inventory-illustration')
    ).not.toBeInTheDocument();
  });

  it('renders the action button only when both actionLabel and onAction are provided', () => {
    const onAction = jest.fn();
    const { rerender } = render(
      <EmptyState title="t" description="d" actionLabel="Add" onAction={onAction} />
    );
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(onAction).toHaveBeenCalledTimes(1);

    // No button when actionLabel is missing
    rerender(<EmptyState title="t" description="d" onAction={onAction} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    // No button when onAction is missing
    rerender(<EmptyState title="t" description="d" actionLabel="Add" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('uses a custom icon when provided', () => {
    render(
      <EmptyState
        title="t"
        description="d"
        icon={<svg data-testid="my-icon" />}
      />
    );
    expect(screen.getByTestId('my-icon')).toBeInTheDocument();
  });
});
