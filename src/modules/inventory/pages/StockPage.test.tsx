import React from 'react';
import { render, screen } from '@testing-library/react';
import StockPage from './StockPage';

describe('StockPage', () => {
  it('renders the Stock title', () => {
    render(<StockPage />);
    expect(screen.getByText('Stock')).toBeInTheDocument();
  });
});
