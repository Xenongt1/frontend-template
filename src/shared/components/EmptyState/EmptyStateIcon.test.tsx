import React from 'react';
import { render, screen } from '@testing-library/react';
import EmptyStateIcon from './EmptyStateIcon';

describe('EmptyStateIcon', () => {
  it('renders the default illustration when no icon prop is passed', () => {
    render(<EmptyStateIcon />);
    expect(
      screen.getByTestId('no-inventory-illustration')
    ).toBeInTheDocument();
  });

  it('renders the provided icon in a sized wrapper', () => {
    render(
      <EmptyStateIcon icon={<svg data-testid="custom-icon" />} size={64} />
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    // The default illustration should not also be rendered.
    expect(
      screen.queryByTestId('no-inventory-illustration')
    ).not.toBeInTheDocument();
  });
});
