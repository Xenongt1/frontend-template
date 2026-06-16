import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductionPage from './ProductionPage';

describe('ProductionPage', () => {
  it('renders the heading and description', () => {
    render(<ProductionPage />);
    expect(screen.getByRole('heading', { name: /production/i })).toBeInTheDocument();
    expect(screen.getByText(/manage your production/i)).toBeInTheDocument();
  });
});
