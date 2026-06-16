import React from 'react';
import { render, screen } from '@testing-library/react';
import EmptyStateContainer from './EmptyStateContainer';

describe('EmptyStateContainer', () => {
  it('renders children inside a labelled section', () => {
    render(
      <EmptyStateContainer>
        <span data-testid="child">content</span>
      </EmptyStateContainer>
    );
    const section = screen.getByRole('region', { name: /empty state/i });
    expect(section).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
