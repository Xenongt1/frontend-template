import React from 'react';
import { render, screen } from '@testing-library/react';
import InventoryPage from './InventoryPage';

describe('InventoryPage', () => {
  it('renders the heading and description', () => {
    render(<InventoryPage />);
    expect(screen.getByRole('heading', { name: /^inventory$/i })).toBeInTheDocument();
    expect(screen.getByText(/manage your inventory/i)).toBeInTheDocument();
  });
});
