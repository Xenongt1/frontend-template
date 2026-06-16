import React from 'react';
import { render, screen } from '@testing-library/react';
import EmptyStateLabel from './EmptyStateLabel';

describe('EmptyStateLabel', () => {
  it('renders the title as an h2 and a single description paragraph', () => {
    render(<EmptyStateLabel title="No items" description="Add one to begin." />);
    expect(screen.getByRole('heading', { level: 2, name: 'No items' })).toBeInTheDocument();
    expect(screen.getByText('Add one to begin.')).toBeInTheDocument();
  });

  it('renders an array of description lines as separate paragraphs', () => {
    render(
      <EmptyStateLabel title="No items" description={['line one', 'line two']} />
    );
    expect(screen.getByText('line one')).toBeInTheDocument();
    expect(screen.getByText('line two')).toBeInTheDocument();
  });
});
