import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmptySectionPanel } from './EmptySectionPanel';

describe('EmptySectionPanel', () => {
  it('renders its children inside the panel paragraph', () => {
    render(<EmptySectionPanel>No items yet</EmptySectionPanel>);
    const message = screen.getByText('No items yet');
    expect(message).toBeInTheDocument();
    expect(message.tagName).toBe('P');
  });

  it('accepts React nodes as children', () => {
    render(
      <EmptySectionPanel>
        <span data-testid="child">complex</span>
      </EmptySectionPanel>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
